-- Produção real: inventário, pagamentos Stripe live e emails transacionais.
-- Idempotente: não apaga dados existentes.

alter table public.orders
  add column if not exists customer_email_sent_at timestamptz null,
  add column if not exists payment_email_sent_at timestamptz null,
  add column if not exists inventory_decremented_at timestamptz null;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (
  payment_method is null or payment_method in (
    'MB Way',
    'Transferência bancária',
    'Cartão de crédito',
    'Referência Multibanco',
    'Stripe Checkout Test'
  )
);

create table if not exists public.product_inventory (
  stable_id text primary key,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 1 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists product_inventory_stock_quantity_idx
  on public.product_inventory (stock_quantity);

alter table public.product_inventory enable row level security;
revoke all on table public.product_inventory from anon, authenticated;

create table if not exists public.order_inventory_movements (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  stripe_event_id text null,
  items jsonb not null,
  created_at timestamptz not null default now(),
  constraint order_inventory_movements_order_id_key unique (order_id)
);

create unique index if not exists order_inventory_movements_stripe_event_id_idx
  on public.order_inventory_movements (stripe_event_id)
  where stripe_event_id is not null;

alter table public.order_inventory_movements enable row level security;
revoke all on table public.order_inventory_movements from anon, authenticated;

create or replace function public.decrement_order_inventory_once(
  input_order_id bigint,
  input_items jsonb,
  input_stripe_event_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  item_stable_id text;
  item_quantity integer;
  current_stock integer;
begin
  if exists (select 1 from public.order_inventory_movements where order_id = input_order_id) then
    return false;
  end if;

  for item in select * from jsonb_array_elements(input_items)
  loop
    item_stable_id := item->>'stable_id';
    item_quantity := (item->>'quantity')::integer;

    if item_stable_id is null or item_quantity is null or item_quantity < 1 then
      raise exception 'Invalid inventory item for order %', input_order_id;
    end if;

    select stock_quantity
      into current_stock
      from public.product_inventory
      where stable_id = item_stable_id
      for update;

    if current_stock is null then
      raise exception 'Inventory row missing for product %', item_stable_id;
    end if;

    if current_stock < item_quantity then
      raise exception 'Insufficient stock for product %', item_stable_id;
    end if;
  end loop;

  for item in select * from jsonb_array_elements(input_items)
  loop
    update public.product_inventory
      set stock_quantity = stock_quantity - ((item->>'quantity')::integer),
          updated_at = now()
      where stable_id = item->>'stable_id';
  end loop;

  insert into public.order_inventory_movements (order_id, stripe_event_id, items)
  values (input_order_id, input_stripe_event_id, input_items);

  update public.orders
    set inventory_decremented_at = coalesce(inventory_decremented_at, now()),
        updated_at = now()
    where id = input_order_id;

  return true;
end;
$$;
