import { products as defaultProducts } from "@/data/products";
import type { Product } from "@/types/product";

export function searchProducts(query: string, products: Product[] = defaultProducts) {
  const value = query.trim().toLowerCase();

  if (!value) return products;

  return products.filter((product) =>
    [product.nome, product.categoria, product.descricao, ...product.detalhes]
      .join(" ")
      .toLowerCase()
      .includes(value),
  );
}
