"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCatalogProducts } from "@/lib/managed-products";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getProductStateOverrides,
  resolveProductState,
  type ProductState,
} from "@/lib/product-visibility";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminFilters = {
  query?: string;
  supplier?: string;
  category?: string;
  visibility?: string;
};
export type ActionResult = { ok: boolean; updated: number; message: string };
type ProductStatePatch = Partial<ProductState>;

const MAX_IDS = 5000;
const BATCH_SIZE = 100;
const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function idsForFilters(
  filters: AdminFilters,
  states: Awaited<ReturnType<typeof getProductStateOverrides>>,
  products: Awaited<ReturnType<typeof getCatalogProducts>>,
) {
  const query = normalize(filters.query ?? "");

  return products
    .filter((product) => {
      const haystack = normalize(
        [product.nome, product.id, product.sku, product.supplierProductId, product.stableId]
          .filter(Boolean)
          .join(" ")
      );
      const state = resolveProductState(product, states);

      return (
        (!query || haystack.includes(query)) &&
        (!filters.supplier || product.supplier === filters.supplier) &&
        (!filters.category || product.categoria === filters.category) &&
        (!filters.visibility ||
          filters.visibility === "all" ||
          (filters.visibility === "visible" ? state.isVisible : !state.isVisible))
      );
    })
    .map((product) => String(product.id));
}

async function performUpdate(
  rawIds: unknown,
  patch: ProductStatePatch,
  action: string,
  metadata: Record<string, unknown>
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const patchEntries = Object.entries(patch);

  if (
    patchEntries.length !== 1 ||
    typeof patchEntries[0]?.[1] !== "boolean"
  ) {
    return { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
  }

  if (!Array.isArray(rawIds)) {
    return { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
  }

  const ids = [
    ...new Set(
      rawIds
        .filter((id): id is string | number => typeof id === "string" || typeof id === "number")
        .map(String)
    ),
  ];

  if (!ids.length) {
    return { ok: false, updated: 0, message: "Seleciona pelo menos um produto." };
  }

  if (ids.length > MAX_IDS) {
    return { ok: false, updated: 0, message: `O limite por operaÃ§Ã£o Ã© ${MAX_IDS} produtos.` };
  }

  const catalog = await getCatalogProducts();
  const productById = new Map(catalog.map((product) => [String(product.id), product]));

  if (ids.some((id) => !productById.has(id))) {
    return { ok: false, updated: 0, message: "A seleÃ§Ã£o contÃ©m IDs de produto inexistentes." };
  }

  const states = await getProductStateOverrides();
  const supabase = createAdminClient();
  let updated = 0;

  for (let index = 0; index < ids.length; index += BATCH_SIZE) {
    const batch = ids.slice(index, index + BATCH_SIZE);
    const now = new Date().toISOString();
    const rows = batch.map((productId) => {
      const product = productById.get(productId)!;
      const current = resolveProductState(product, states);
      const next = { ...current, ...patch };

      return {
        product_id: productId,
        is_visible: next.isVisible,
        is_best_seller: next.isBestSeller,
        is_new_arrival: next.isNewArrival,
        updated_at: now,
        updated_by: admin.id,
      };
    });

    const { error } = await supabase
      .from("product_visibility")
      .upsert(rows, { onConflict: "product_id" });

    if (error) {
      return {
        ok: false,
        updated,
        message: "NÃ£o foi possÃ­vel atualizar todos os produtos.",
      };
    }

    rows.forEach((row) => {
      states.set(row.product_id, {
        isVisible: row.is_visible,
        isBestSeller: row.is_best_seller,
        isNewArrival: row.is_new_arrival,
      });
    });
    updated += batch.length;
  }

  await supabase.from("admin_audit_log").insert({
    admin_user_id: admin.id,
    action,
    product_ids: ids,
    metadata: { ...metadata, ...patch, quantity: ids.length },
  });

  ["/", "/produtos", "/admin/produtos", "/checkout", "/gravacoes"].forEach((path) =>
    revalidatePath(path)
  );
  revalidatePath("/[locale]/bijuteria", "page");
  revalidatePath("/[locale]/gravacoes", "page");
  revalidatePath("/produto/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");

  return { ok: true, updated, message: "Produtos atualizados com sucesso." };
}

export async function setProductsVisibility(productIds: unknown, value: unknown) {
  return typeof value === "boolean"
    ? performUpdate(productIds, { isVisible: value }, value ? "publish" : "hide", {})
    : { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
}

export async function setProductsBestSeller(productIds: unknown, value: unknown) {
  return typeof value === "boolean"
    ? performUpdate(productIds, { isBestSeller: value }, value ? "best_seller_add" : "best_seller_remove", {})
    : { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
}

export async function setProductsNewArrival(productIds: unknown, value: unknown) {
  return typeof value === "boolean"
    ? performUpdate(productIds, { isNewArrival: value }, value ? "new_arrival_add" : "new_arrival_remove", {})
    : { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
}

async function setFilteredState(
  filters: AdminFilters,
  patch: ProductStatePatch,
  action: string
) {
  await requireAdmin();
  const states = await getProductStateOverrides();
  const products = await getCatalogProducts();
  return performUpdate(idsForFilters(filters, states, products), patch, action, { filters });
}

export async function setFilteredProductsVisibility(filters: AdminFilters, value: unknown) {
  return typeof value === "boolean"
    ? setFilteredState(filters, { isVisible: value }, value ? "publish_filtered" : "hide_filtered")
    : { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
}

export async function setFilteredProductsBestSeller(filters: AdminFilters, value: unknown) {
  return typeof value === "boolean"
    ? setFilteredState(filters, { isBestSeller: value }, value ? "best_seller_add_filtered" : "best_seller_remove_filtered")
    : { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
}

export async function setFilteredProductsNewArrival(filters: AdminFilters, value: unknown) {
  return typeof value === "boolean"
    ? setFilteredState(filters, { isNewArrival: value }, value ? "new_arrival_add_filtered" : "new_arrival_remove_filtered")
    : { ok: false, updated: 0, message: "Dados invÃ¡lidos." };
}

export async function logout() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveProductTranslations(_productId?: unknown, _translations?: unknown) {
  void _productId;
  void _translations;
  await requireAdmin();
  return { ok: false, message: "As traduções de produto são carregadas do catálogo local em data/product-translations.ts." };
}
