# 01 - Architecture

## Estrutura real

- `app`: rotas Next.js App Router.
- `components`: UI reutilizável do storefront, checkout, admin e consentimento.
- `config`: configuração central de empresa, envios, pagamentos, SEO, idiomas e features.
- `data`: dados editoriais, produtos locais/fallback e conteúdo legal.
- `hooks`: estado client-side de carrinho/favoritos.
- `lib`: regras de negócio, Supabase, checkout, pesquisa, visibilidade e emails.
- `supabase`: SQL idempotente para schema/policies.
- `types`: tipos partilhados.

## Princípios

Server Actions validam dados sensíveis. O browser nunca decide preço final. Service role só é usada no servidor.
