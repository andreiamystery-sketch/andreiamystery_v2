-- Gestão avançada de encomendas no backoffice.
-- Idempotente, sem apagar dados e compatível com encomendas existentes.

create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  previous_status text null,
  new_status text not null,
  created_at timestamptz not null default now(),
  changed_by text null
);

alter table public.orders
  add column if not exists internal_notes text null;

alter table public.order_status_history
  add column if not exists changed_by text null;

alter table public.order_status_history drop constraint if exists order_status_history_previous_status_check;
alter table public.order_status_history add constraint order_status_history_previous_status_check check (
  previous_status is null or previous_status in ('Pendente', 'Confirmada', 'Enviada', 'Concluída', 'Cancelada')
);

alter table public.order_status_history drop constraint if exists order_status_history_new_status_check;
alter table public.order_status_history add constraint order_status_history_new_status_check check (
  new_status in ('Pendente', 'Confirmada', 'Enviada', 'Concluída', 'Cancelada')
);

create index if not exists order_status_history_order_id_idx on public.order_status_history (order_id, created_at desc);

alter table public.order_status_history enable row level security;

-- Histórico e notas são geridos apenas pelas Server Actions com service role.
revoke all on table public.order_status_history from anon, authenticated;

