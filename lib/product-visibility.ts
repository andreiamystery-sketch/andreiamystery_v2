import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { catalogProducts } from "@/data/products";
import type { Product } from "@/types/product";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ProductState = {
  isVisible: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
};

export type ProductStateOverrides = Map<string, ProductState>;
export type VisibilityOverrides = Map<string, boolean>;
type ProductTranslationRow = {
  product_id: string;
  locale: string;
  name: string | null;
  description: string | null;
};

type ProductTranslationFields = Pick<Product, "name_pt" | "name_en" | "name_es" | "name_fr" | "name_de" | "name_zh" | "description_pt" | "description_en" | "description_es" | "description_fr" | "description_de" | "description_zh">;

const localeFieldMap: Record<string, { name: keyof ProductTranslationFields; description: keyof ProductTranslationFields }> = {
  "pt-PT": { name: "name_pt", description: "description_pt" },
  "en-GB": { name: "name_en", description: "description_en" },
  "es-ES": { name: "name_es", description: "description_es" },
  "fr-FR": { name: "name_fr", description: "description_fr" },
  "de-DE": { name: "name_de", description: "description_de" },
  "zh-CN": { name: "name_zh", description: "description_zh" },
};

async function getProductTranslations() {
  noStore();
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return new Map<string, Partial<ProductTranslationFields>>();
  const { data, error } = await createAdminClient().from("product_translations").select("product_id,locale,name,description");
  if (error) return new Map<string, Partial<ProductTranslationFields>>();
  const translations = new Map<string, Partial<ProductTranslationFields>>();
  for (const row of (data ?? []) as ProductTranslationRow[]) {
    const fields = localeFieldMap[row.locale];
    if (!fields) continue;
    const current = translations.get(String(row.product_id)) ?? {};
    current[fields.name] = row.name ?? undefined;
    current[fields.description] = row.description ?? undefined;
    translations.set(String(row.product_id), current);
  }
  return translations;
}

export function toPublicProduct(product: Product): Product {
  const {
    supplierPrice: _supplierPrice,
    sourceImageUrls: _sourceImageUrls,
    ...publicProduct
  } = product;

  void _supplierPrice;
  void _sourceImageUrls;

  return publicProduct;
}

export async function getProductStateOverrides(): Promise<ProductStateOverrides> {
  noStore();

  if (
    !isSupabaseConfigured() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return new Map();
  }

  const { data, error } = await createAdminClient()
    .from("product_visibility")
    .select(
      "product_id,is_visible,is_best_seller,is_new_arrival"
    );

  if (error) {
    throw new Error(
      "NÃ£o foi possÃ­vel carregar o estado dos produtos."
    );
  }

  return new Map(
    (data ?? []).map((row) => [
      String(row.product_id),
      {
        isVisible: Boolean(row.is_visible),
        isBestSeller: Boolean(row.is_best_seller),
        isNewArrival: Boolean(row.is_new_arrival),
      },
    ])
  );
}

export async function getVisibilityOverrides(): Promise<VisibilityOverrides> {
  const states = await getProductStateOverrides();

  return new Map(
    [...states.entries()].map(([productId, state]) => [
      productId,
      state.isVisible,
    ])
  );
}

export function resolveProductVisibility(
  product: Product,
  overrides: VisibilityOverrides
) {
  const override = overrides.get(String(product.id));

  if (override !== undefined) {
    return override;
  }

  return product.isPublished ?? false;
}

export function resolveProductState(
  product: Product,
  overrides: ProductStateOverrides
): ProductState {
  const override = overrides.get(String(product.id));

  return {
    isVisible:
      override?.isVisible ??
      product.isPublished ??
      false,

    isBestSeller:
      override?.isBestSeller ??
      product.featured ??
      product.isFeatured ??
      false,

    isNewArrival:
      override?.isNewArrival ??
      product.novidade ??
      false,
  };
}

export async function getProductVisibility(product: Product) {
  return resolveProductVisibility(
    product,
    await getVisibilityOverrides()
  );
}

export async function getPublishedProducts() {
  const [overrides, translations] = await Promise.all([getProductStateOverrides(), getProductTranslations()]);

  return catalogProducts.flatMap((product) => {
    const state = resolveProductState(product, overrides);

    if (!state.isVisible) {
      return [];
    }

    const translation = translations.get(String(product.id));
    return [{
      ...product,
      name_pt: translation?.name_pt ?? product.name_pt ?? product.nome,
      name_en: translation?.name_en ?? product.name_en ?? null,
      name_es: translation?.name_es ?? product.name_es ?? null,
      name_fr: translation?.name_fr ?? product.name_fr ?? null,
      name_de: translation?.name_de ?? product.name_de ?? null,
      name_zh: translation?.name_zh ?? product.name_zh ?? null,
      description_pt: translation?.description_pt ?? product.description_pt ?? product.descricao,
      description_en: translation?.description_en ?? product.description_en ?? null,
      description_es: translation?.description_es ?? product.description_es ?? null,
      description_fr: translation?.description_fr ?? product.description_fr ?? null,
      description_de: translation?.description_de ?? product.description_de ?? null,
      description_zh: translation?.description_zh ?? product.description_zh ?? null,
      isPublished: true,
      isFeatured: state.isBestSeller,
      featured: state.isBestSeller,
      novidade: state.isNewArrival,
    }];
  });
}

export async function getPublishedProductById(
  id: number | string
) {
  const products = await getPublishedProducts();

  return products.find(
    (product) => String(product.id) === String(id)
  );
}

export async function getPublishedProductBySlug(slug: string) {
  const products = await getPublishedProducts();

  return products.find((product) => product.slug === slug);
}




