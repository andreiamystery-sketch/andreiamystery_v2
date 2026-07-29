# Deployment

## Vercel

Configurar variáveis:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Supabase

Aplicar migrations em `/supabase` e confirmar que o público não consegue ler/alterar encomendas.

## Resend

Confirmar domínio remetente e testar envio interno antes de lançamento.
