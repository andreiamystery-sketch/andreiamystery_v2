import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { catalogProducts } from "@/data/products";
import type { Product, ProductBusiness } from "@/types/product";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ManagedProductRow = {
  id: number | string;
  business: ProductBusiness;
  slug: string;
  name: string;
  category: Product["categoria"];
  category_name: string;
  price: number | string;
  description: string;
  images: string[] | null;
  details: string[] | null;
  materials: string[] | null;
  created_at: string;
  updated_at: string;
};

export function toManagedProduct(row: ManagedProductRow): Product {
  const images = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
  const id = Number(row.id);
  const price = Number(row.price);
  return {
    id,
    business: row.business,
    slug: row.slug,
    nome: row.name,
    categoria: row.category,
    categoryName: row.category_name,
    preco: price,
    priceMultiplier: 1,
    price,
    currency: "EUR",
    descricao: row.description,
    capa: images[0] ?? "/images/hero/andreas-mystery-hero.jpg",
    imagens: images,
    detalhes: Array.isArray(row.details) ? row.details : [],
    materiais: Array.isArray(row.materials) ? row.materials : [],
    stableId: `managed-${id}`,
    sku: `AM-${id}`,
    isPublished: false,
    isFeatured: false,
    supplier: "Andrea's Mystery",
    supplierUrl: "",
    importedAt: row.created_at,
    updatedAt: row.updated_at,
    featured: false,
    novidade: false,
  };
}

export async function getManagedProducts(): Promise<Product[]> {
  noStore();
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  try {
    const { data, error } = await createAdminClient()
      .from("managed_products")
      .select("id,business,slug,name,category,category_name,price,description,images,details,materials,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []).map((row) => toManagedProduct(row as ManagedProductRow));
  } catch {
    return [];
  }
}

export async function getCatalogProducts(): Promise<Product[]> {
  return [...catalogProducts, ...await getManagedProducts()];
}
