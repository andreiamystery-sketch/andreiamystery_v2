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
      "Não foi possível carregar o estado dos produtos."
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
  const overrides = await getProductStateOverrides();

  return catalogProducts.flatMap((product) => {
    const state = resolveProductState(product, overrides);

    if (!state.isVisible) {
      return [];
    }

    return [{
      ...product,
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
