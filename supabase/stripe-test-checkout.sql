-- Stripe Checkout em modo de teste.
-- Idempotente: adiciona apenas colunas ausentes e mantém colunas existentes.

alter table public.orders
  add column if not exists stripe_checkout_session_id text null,
  add column if not exists stripe_payment_intent_id text null,
  add column if not exists stripe_payment_method text null,
  add column if not exists stripe_last_event_id text null,
  add column if not exists paid_at timestamptz null;

create index if not exists orders_stripe_checkout_session_id_idx
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_stripe_payment_intent_id_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists orders_stripe_payment_method_idx
  on public.orders (stripe_payment_method)
  where stripe_payment_method is not null;

alter table public.orders drop constraint if exists orders_stripe_payment_method_check;
alter table public.orders add constraint orders_stripe_payment_method_check check (
  stripe_payment_method is null or stripe_payment_method in ('card', 'mb_way')
);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
revoke all on table public.stripe_webhook_events from anon, authenticated;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (
  payment_method is null or payment_method in (
    'MB Way',
    'Transferência bancária',
    'Referência Multibanco',
    'Stripe Checkout Test'
  )
);
