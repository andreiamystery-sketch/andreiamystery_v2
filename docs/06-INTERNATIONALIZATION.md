# 06 - Internationalization

Implementado em 2026-07-29.

## Idiomas públicos

- `/pt` - Português de Portugal, fallback principal.
- `/en` - English.
- `/es` - Español.
- `/fr` - Français.

A raiz `/` redireciona para `/pt`. O admin permanece fora das rotas localizadas em `/admin`.

## Arquitetura

- `config/locales.ts`: lista de idiomas e locale de formatação.
- `lib/i18n/messages.ts`: traduções centralizadas de UI.
- `components/i18n/i18n-provider.tsx`: provider client que lê o idioma pelo pathname.
- `lib/i18n/products.ts`: fallback de nomes/descrições de produtos para português.
- `lib/i18n/legal.ts`: páginas legais localizadas.

## Produtos

Nomes e descrições atuais continuam como fallback português. Não foram geradas traduções automáticas definitivas.

O admin de produtos inclui painel para editar manualmente:

- nome PT/EN/ES/FR;
- descrição PT/EN/ES/FR.

As traduções são guardadas em `product_translations`, criada por `supabase/product-translations.sql`.

## SEO

As páginas localizadas têm canonical e alternates/hreflang. O sitemap inclui homepage, checkout, produtos e páginas legais por idioma.
