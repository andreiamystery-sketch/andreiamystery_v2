# Andrea's Mystery

Loja online premium de bijuteria construída com Next.js App Router, TypeScript, Tailwind, Supabase e Resend.

Projeto local: `C:\Users\lalves\OneDrive\Desktop\Andrea`.

## Comandos

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Áreas principais

- Storefront público com homepage, catálogo, produto, carrinho, favoritos e checkout.
- Backoffice protegido em `/admin` para produtos e encomendas.
- Supabase para produtos, encomendas, autenticação admin e histórico.
- Resend para notificação interna de novas encomendas.

## Produção

Aplicar migrations em `/supabase`, configurar variáveis na Vercel e rever páginas legais antes de publicar.
