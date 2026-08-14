-- Métodos de pagamento suportados pelo checkout.
-- Não altera dados nem inclui qualquer lógica de inventário.

begin;

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

commit;
