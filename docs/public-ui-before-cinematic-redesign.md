# Estrutura pública anterior ao redesenho cinematográfico

Registo criado em 2026-07-27 para permitir reverter a organização visual.

- `app/layout.tsx`: `StoreProvider` > `Header` > página > `Footer`.
- `app/page.tsx`: Hero, Coleção, Novidades, Best-sellers, Presenças, Pontos de venda, Testemunhos.
- `components/header.tsx`: header sticky, monograma textual AM, navegação e ícones.
- `components/hero.tsx`: fotografia de fundo integral com texto à esquerda.
- `components/product-grid.tsx`: filtros, pesquisa e grelha completa dos produtos publicados.
- `components/product-card.tsx`: imagem, categoria, nome, descrição, preço e três ações.
- `components/cart-drawer.tsx` e `components/checkout-flow.tsx`: carrinho persistente e checkout em cinco passos.
- `components/footer.tsx`: marca, navegação e contacto em três colunas.
- `styles/globals.css` e `tailwind.config.ts`: paleta clara predominante, serif Georgia e sans Segoe UI.

Os dados e regras comerciais ficam separados em `data/`, `hooks/`, `lib/` e `types/` e não fazem parte do redesenho visual.
