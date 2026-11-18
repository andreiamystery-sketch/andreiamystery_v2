import type { AppLocale } from "@/config/locales";

export type Category = "Anéis" | "Brincos" | "Colares" | "Pulseiras" | "Gravações";
export type ProductBusiness = "bijuteria" | "gravacoes";

export type ProductTranslationContent = {
  name?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  categoryName?: string | null;
  materials?: string[] | null;
  details?: string[] | null;
  availability?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type ProductTranslations = {
  translations?: Partial<Record<AppLocale, ProductTranslationContent>>;
  name_pt?: string;
  name_en?: string | null;
  name_es?: string | null;
  name_fr?: string | null;
  name_de?: string | null;
  name_zh?: string | null;
  description_pt?: string;
  description_en?: string | null;
  description_es?: string | null;
  description_fr?: string | null;
  description_de?: string | null;
  description_zh?: string | null;
};

export type Product = ProductTranslations & {
  id: number;
  slug: string;
  nome: string;
  categoria: Category;
  categoryName?: string;
  preco: number;
  supplierPrice?: number;
  priceMultiplier: number;
  price: number;
  currency: "EUR";
  descricao: string;
  fullDescription?: string;
  availabilityText?: string;
  seoTitle?: string;
  seoDescription?: string;
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
  business?: ProductBusiness;
};

export type CategoryFilter = {
  id: "Todos" | Category;
  label: string;
  description: string;
  imagem?: string;
};
