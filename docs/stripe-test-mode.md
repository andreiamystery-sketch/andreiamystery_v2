# Stripe Test Mode

Esta integração existe apenas para testar pagamentos automáticos por cartão e MB Way com Stripe Checkout. Não ativa pagamentos reais.

## Variáveis

Adicionar localmente, sem commitar valores reais:

```env
PAYMENTS_TEST_MODE=true
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

A aplicação recusa `sk_live_` e chaves publishable que não comecem por `pk_test_`.

## Webhook local com Stripe CLI

1. Instalar e autenticar a Stripe CLI.
2. Iniciar o servidor local:

```bash
npm run dev
```

3. Encaminhar webhooks para o Next.js:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copiar o `whsec_...` mostrado pela CLI para `STRIPE_WEBHOOK_SECRET` no ambiente local.
5. No checkout, escolher `Cartão - Stripe Test Mode` ou `MB Way`.
6. Para cartão, usar o cartão de teste Stripe:

```text
4242 4242 4242 4242
```

Qualquer CVC/data futura/código postal de teste serve.

7. Para MB Way, usar o fluxo hospedado da Stripe em modo de teste. A sessão é criada com `payment_method_types: ["mb_way"]`, moeda EUR e metadata da encomenda.

## Regras de segurança

- A encomenda nasce com `status = Pendente` e `payment_status = aguardando pagamento`.
- MB Way não é tratado como pagamento manual quando `PAYMENTS_TEST_MODE=true`; redireciona sempre para Stripe Checkout.
- O regresso à página de obrigado nunca marca a encomenda como paga.
- Só o webhook assinado muda `payment_status` para `pago` ou `falhado`.
- Antes de marcar como pago, o webhook confirma que a encomenda existe, que a moeda é EUR, que o valor recebido corresponde ao total da encomenda e que o método Stripe é `card` ou `mb_way`.
- A tabela `stripe_webhook_events` guarda `stripe_event_id` para impedir processamento duplicado do mesmo evento.
- Se o processamento falhar, o evento é libertado para permitir retry da Stripe CLI/Stripe.
- Transferência bancária continua disponível como método manual.
