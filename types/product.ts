export type Category = "Anéis" | "Brincos" | "Colares" | "Pulseiras";

export type Product = {
  id: number;
  slug: string;
  nome: string;
  categoria: Category;
  preco: number;
  supplierPrice?: number;
  priceMultiplier: number;
  price: number;
  currency: "EUR";
  descricao: string;
  capa: string;
  imagens: string[];
  detalhes: string[];
  stableId: string;
  supplierProductId?: string;
  materiais: string[];
  sku?: string;
  categoriaOriginal?: string;
  urlOriginal?: string;
  sourceImageUrls?: string[];
  isPublished: boolean;
  isFeatured: boolean;
  supplier: "Andrea's Mystery" | "Grupo Belle";
  supplierUrl: string;
  importedAt: string;
  updatedAt: string;
  featured?: boolean;
  novidade?: boolean;
};

export type CategoryFilter = {
  id: "Todos" | Category;
  label: string;
  description: string;
  imagem?: string;
};
