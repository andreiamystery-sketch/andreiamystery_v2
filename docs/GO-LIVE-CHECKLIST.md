# Andrea's Mystery - Go-Live Checklist

Checklist curta para ativar vendas reais sem expor credenciais no repositório.

## 1. Hosting e domínio

- [ ] Confirmar que o domínio final aponta para o hosting correto.
- [ ] Confirmar HTTPS ativo antes de aceitar pagamentos reais.
- [ ] Definir `NEXT_PUBLIC_SITE_URL` com o domínio final, sem barra no fim.
- [ ] Confirmar que `/pt`, `/en`, `/es`, `/fr`, `/de` e `/zh` abrem em HTTPS.

## 2. Supabase

- [ ] Executar todas as migrations em `supabase/`.
- [ ] Executar especialmente `supabase/production-inventory-and-emails.sql`.
- [ ] Confirmar que `orders`, `stripe_webhook_events`, `product_inventory` e `order_inventory_movements` existem.
- [ ] Preencher `product_inventory` com stock real por `stable_id`.
- [ ] Confirmar que nenhum produto publicado tem stock em falta.
- [ ] Confirmar que RLS está ativo e que o browser não tem permissões diretas sobre encomendas/inventário.

## 3. Variáveis de produção

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `ADMIN_EMAIL`
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `PAYMENTS_TEST_MODE=false`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...` do webhook live

Não guardar estes valores no Git.

## 4. Stripe live

- [ ] Ativar a conta Stripe para pagamentos reais.
- [ ] Confirmar que cartão e MB WAY estão disponíveis na conta Stripe.
- [ ] Criar webhook live para `https://DOMINIO/api/stripe/webhook`.
- [ ] Selecionar eventos:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `checkout.session.async_payment_failed`
- [ ] Copiar o signing secret live para `STRIPE_WEBHOOK_SECRET` no hosting.
- [ ] Confirmar que `PAYMENTS_TEST_MODE=false` recusa chaves test e aceita chaves live.

## 5. Métodos de pagamento

- [ ] Confirmar no checkout que aparecem apenas métodos operacionais:
  - MB WAY via Stripe Checkout
  - Cartão de crédito via Stripe Checkout
  - Transferência bancária manual
- [ ] Manter Referência Multibanco desativada até existir integração real.
- [ ] Fazer uma compra real de baixo valor.
- [ ] Confirmar que a encomenda só passa para `pago` depois do webhook Stripe.

## 6. Emails

- [ ] Verificar domínio remetente no Resend.
- [ ] Enviar encomenda teste e confirmar email para a loja.
- [ ] Confirmar email de encomenda recebida para cliente quando o cliente fornece email.
- [ ] Confirmar email de pagamento confirmado após webhook Stripe.
- [ ] Confirmar que falhas de email ficam em `notification_error`.

## 7. Stock

- [ ] Definir stock inicial por produto em `product_inventory`.
- [ ] Testar produto com stock 0.
- [ ] Confirmar que o checkout bloqueia produto sem stock.
- [ ] Confirmar que pagamento Stripe pago reduz stock uma só vez.
- [ ] Reenviar evento webhook de teste e confirmar que o stock não reduz duas vezes.

## 8. Operação

- [ ] Confirmar páginas legais acessíveis no footer.
- [ ] Confirmar política de devolução: 30 dias, portes de devolução a cargo do comprador.
- [ ] Confirmar informação DPD: Portugal e Europa.
- [ ] Confirmar processo manual para etiquetas DPD.
- [ ] Confirmar processo operacional de reembolso/devolução antes do primeiro anúncio público.

## 9. Últimos testes

- [ ] `npm.cmd run lint`
- [ ] `npm.cmd run typecheck`
- [ ] `npm.cmd run build`
- [ ] Testar compra completa em Stripe test mode.
- [ ] Depois de configurar live, fazer uma compra real de baixo valor e reembolsar manualmente no Stripe.
