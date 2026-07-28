"use server";

import { getPublishedProducts } from "@/lib/product-visibility";

export async function validateCheckoutProducts(productIds: unknown) {
  if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== "string")) {
    return { ok: false, unavailable: [] as string[] };
  }
  const requested = [...new Set(productIds)];
  const published = new Set((await getPublishedProducts()).map((product) => product.stableId));
  const unavailable = requested.filter((id) => !published.has(id));
  return { ok: unavailable.length === 0, unavailable };
}
