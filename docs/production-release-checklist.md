# Andrea's Mystery - checklist de produção

Última atualização: 2026-07-29

## 1. Migrations Supabase a aplicar

Executar no SQL Editor do Supabase, por esta ordem:

1. `supabase/admin-orders-management.sql`
   - cria `order_status_history`;
   - adiciona `orders.internal_notes`;
   - adiciona constraints de estados;
   - restringe acesso direto ao histórico.

2. `supabase/checkout-delivery-fields.sql`
   - adiciona subtotal, portes, método de entrega, morada, código postal, localidade, observações, método de pagamento e consentimento de privacidade;
   - mantém compatibilidade com encomendas antigas.

## 2. Variáveis de ambiente

Confirmar em produção, sem expor valores:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## 3. Admin de encomendas

Validar manualmente em `/admin/encomendas`:

- dashboard com totais por estado;
- filtros por pesquisa, estado e intervalo de datas;
- exportação CSV dos resultados filtrados;
- abertura do drawer ao clicar numa encomenda;
- alteração de estado, incluindo confirmação antes de cancelar;
- gravação de notas internas;
- histórico de estados;
- ações WhatsApp, copiar resumo, imprimir e reenviar email.

## 4. Checkout

Validar manualmente:

- carrinho vazio não avança;
- dados de cliente obrigatórios;
- envio exige morada, código postal e localidade;
- recolha em mão não exige morada;
- consentimento de privacidade é obrigatório;
- encomenda criada contém subtotal, portes, entrega, pagamento e consentimento;
- notificação interna por email continua ativa.

## 5. Conteúdo legal pendente

As páginas legais existem, mas têm placeholders marcados com `[PREENCHER/VALIDAR COM APOIO JURÍDICO ANTES DE PUBLICAR EM PRODUÇÃO]`.

Preencher/validar:

- nome legal da entidade;
- NIF;
- morada fiscal/comercial;
- horários de atendimento;
- prazos de envio;
- valores de portes;
- regras de trocas/devoluções;
- cookies reais usados em produção;
- política final de privacidade.

## 6. Comandos de validação

Executados com sucesso nesta fase:

```bash
npm run typecheck
npm run lint
npm run build
```

Antes de publicar, executar novamente depois de aplicar migrations e preencher textos legais.

