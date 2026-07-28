create table if not exists public.orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text null,
  items jsonb not null,
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'Pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email_sent_at timestamptz null,
  notification_error text null
);

alter table public.orders
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists email_sent_at timestamptz null,
  add column if not exists notification_error text null;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('Pendente', 'Confirmada', 'Enviada', 'Concluída', 'Cancelada')
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

-- As encomendas são criadas exclusivamente pela Server Action com a service role.
-- Não são concedidas permissões diretas ao browser.
revoke all on table public.orders from anon, authenticated;
