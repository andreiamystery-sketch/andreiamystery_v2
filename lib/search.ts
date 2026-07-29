import { products as defaultProducts } from "@/data/products";
import type { Product } from "@/types/product";

export function searchProducts(query: string, products: Product[] = defaultProducts) {
  const value = query.trim().toLocaleLowerCase();
  if (!value) return products;
  return products.filter((product) =>
    [
      product.nome,
      product.name_pt,
      product.name_en,
      product.name_es,
      product.name_fr,
      product.name_de,
      product.name_zh,
      product.categoria,
      product.descricao,
      product.description_pt,
      product.description_en,
      product.description_es,
      product.description_fr,
      product.description_de,
      product.description_zh,
      ...product.detalhes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(value),
  );
}
