-- Campos de encomenda para produção v1.
-- Idempotente, sem apagar dados e compatível com encomendas existentes.

alter table public.orders
  add column if not exists subtotal numeric(12, 2) null,
  add column if not exists shipping_total numeric(12, 2) not null default 0,
  add column if not exists delivery_method text null,
  add column if not exists delivery_region text null,
  add column if not exists delivery_country text null,
  add column if not exists delivery_address text null,
  add column if not exists delivery_postal_code text null,
  add column if not exists delivery_city text null,
  add column if not exists delivery_notes text null,
  add column if not exists shipping_carrier text null,
  add column if not exists shipping_estimate text null,
  add column if not exists payment_method text null,
  add column if not exists payment_status text not null default 'aguardando pagamento',
  add column if not exists payment_reference text null,
  add column if not exists paid_at timestamptz null,
  add column if not exists payment_notes text null,
  add column if not exists privacy_accepted boolean not null default false,
  add column if not exists customer_locale text not null default 'pt';

alter table public.orders drop constraint if exists orders_shipping_total_check;
alter table public.orders add constraint orders_shipping_total_check check (shipping_total >= 0);

alter table public.orders drop constraint if exists orders_delivery_method_check;
alter table public.orders add constraint orders_delivery_method_check check (
  delivery_method is null or delivery_method in ('Envio', 'Recolha em mão')
);

alter table public.orders drop constraint if exists orders_delivery_region_check;
alter table public.orders add constraint orders_delivery_region_check check (
  delivery_region is null or delivery_region in ('PT', 'EU')
);

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (
  payment_method is null or payment_method in ('MB Way', 'Transferência bancária', 'Referência Multibanco')
);

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check (
  payment_status in ('pendente', 'aguardando pagamento', 'pago', 'falhado', 'reembolsado', 'cancelado')
);

alter table public.orders drop constraint if exists orders_customer_locale_check;
alter table public.orders add constraint orders_customer_locale_check check (
  customer_locale in ('pt', 'en', 'es', 'fr', 'de', 'zh')
);
