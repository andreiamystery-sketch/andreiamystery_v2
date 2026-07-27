import { products } from "@/data/products";

export function searchProducts(query: string) {
  const value = query.trim().toLowerCase();

  if (!value) return products;

  return products.filter((product) =>
    [product.nome, product.categoria, product.descricao, ...product.detalhes]
      .join(" ")
      .toLowerCase()
      .includes(value),
  );
}
