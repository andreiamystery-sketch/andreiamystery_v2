# 02 - Database

Tabelas principais esperadas:

- `product_visibility`: visibilidade, best sellers e novidades por produto.
- `product_translations`: traduções manuais por produto, preparado para PT/EN/ES/FR.
- `orders`: encomendas públicas, dados de cliente, envio, pagamento, totais e notificação.
- `order_status_history`: histórico de estado logístico.
- `admin_users`: autorização de administradores.
- `admin_audit_log`: registo de ações administrativas em produtos.

## Migrations

Executar por ordem:

1. `supabase/orders.sql`
2. `supabase/admin-products.sql`
3. `supabase/checkout-delivery-fields.sql`
4. `supabase/admin-orders-management.sql`
5. `supabase/product-translations.sql`

As migrations novas são idempotentes e não apagam dados.
