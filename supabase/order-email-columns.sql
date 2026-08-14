-- Campos de controlo dos emails transacionais.
-- Não altera dados nem inclui qualquer lógica de inventário.

alter table public.orders
  add column if not exists customer_email_sent_at timestamptz null,
  add column if not exists payment_email_sent_at timestamptz null;
