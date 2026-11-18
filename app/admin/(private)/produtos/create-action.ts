"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductBusiness } from "@/types/product";

export type CreateManagedProductResult = { ok: boolean; message: string };

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const MAX_TOTAL_IMAGE_BYTES = 3.5 * 1024 * 1024;
const jewelryCategories = ["Anéis", "Brincos", "Colares", "Pulseiras"] as const;

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function splitList(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean).slice(0, 12);
}

function createSlug(value: string) {
  const base = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "produto";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createManagedProduct(formData: FormData): Promise<CreateManagedProductResult> {
  const admin = await requireAdmin();
  const name = textField(formData, "name");
  const description = textField(formData, "description");
  const business = textField(formData, "business") as ProductBusiness;
  const selectedCategory = textField(formData, "category");
  const categoryName = business === "gravacoes" ? textField(formData, "format") : selectedCategory;
  const priceText = textField(formData, "price").replace(",", ".");
  const price = Number(priceText);
  const details = splitList(textField(formData, "details"));
  const materials = splitList(textField(formData, "materials"));
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);

  if (business !== "bijuteria" && business !== "gravacoes") return { ok: false, message: "Escolhe Bijuteria ou Gravações." };
  if (!name || name.length > 120) return { ok: false, message: "Indica um nome até 120 caracteres." };
  if (!description || description.length > 2000) return { ok: false, message: "Indica uma descrição até 2.000 caracteres." };
  if (!Number.isFinite(price) || price < 0 || price > 100000) return { ok: false, message: "Indica um preço válido." };
  if (business === "bijuteria" && !jewelryCategories.includes(selectedCategory as typeof jewelryCategories[number])) return { ok: false, message: "Escolhe uma categoria de bijuteria." };
  if (business === "gravacoes" && (!categoryName || categoryName.length > 80)) return { ok: false, message: "Indica o formato da peça personalizada." };
  if (!files.length || files.length > 8) return { ok: false, message: "Adiciona entre 1 e 8 fotografias." };
  if (files.some((file) => !allowedTypes.has(file.type))) return { ok: false, message: "Usa imagens JPG, PNG ou WebP." };
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_IMAGE_BYTES) return { ok: false, message: "O total das fotografias tem de ser inferior a 3,5 MB. Reduz o tamanho das imagens e tenta novamente." };

  const supabase = createAdminClient();
  const category = business === "gravacoes" ? "Gravações" : selectedCategory;
  const { data: created, error: createError } = await supabase.from("managed_products").insert({
    business,
    slug: createSlug(name),
    name,
    category,
    category_name: categoryName,
    price,
    description,
    images: [],
    details,
    materials,
    created_by: admin.id,
  }).select("id").single();

  if (createError || !created) {
    return { ok: false, message: "Não foi possível criar o produto. Confirma que a tabela de produtos próprios já foi preparada no Supabase." };
  }

  const productId = String(created.id);
  const uploadedPaths: string[] = [];
  const imageUrls: string[] = [];
  try {
    for (const [index, file] of files.entries()) {
      const extension = allowedTypes.get(file.type)!;
      const path = `${productId}/${String(index + 1).padStart(2, "0")}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("managed-product-images").upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw new Error("Não foi possível guardar uma das fotografias.");
      uploadedPaths.push(path);
      imageUrls.push(supabase.storage.from("managed-product-images").getPublicUrl(path).data.publicUrl);
    }

    const { error: imageUpdateError } = await supabase.from("managed_products").update({ images: imageUrls, updated_at: new Date().toISOString() }).eq("id", created.id);
    if (imageUpdateError) throw new Error("As fotografias foram enviadas, mas não foi possível associá-las ao produto.");

    const { error: stateError } = await supabase.from("product_visibility").upsert({
      product_id: productId,
      is_visible: formData.get("visible") === "on",
      is_best_seller: formData.get("bestSeller") === "on",
      is_new_arrival: formData.get("newArrival") === "on",
      updated_at: new Date().toISOString(),
      updated_by: admin.id,
    }, { onConflict: "product_id" });
    if (stateError) throw new Error("Produto criado, mas não foi possível guardar os estados de publicação.");

    await supabase.from("admin_audit_log").insert({
      admin_user_id: admin.id,
      action: "managed_product_create",
      product_ids: [productId],
      metadata: { business, category, name },
    });
  } catch (error) {
    if (uploadedPaths.length) await supabase.storage.from("managed-product-images").remove(uploadedPaths);
    await supabase.from("managed_products").delete().eq("id", created.id);
    return { ok: false, message: error instanceof Error ? error.message : "Não foi possível guardar o produto." };
  }

  ["/", "/bijuteria", "/gravacoes", "/admin/produtos"].forEach((path) => revalidatePath(path));
  revalidatePath("/[locale]/bijuteria", "page");
  revalidatePath("/[locale]/gravacoes", "page");
  revalidatePath("/[locale]/produto/[slug]", "page");
  return { ok: true, message: "Produto criado e guardado com sucesso." };
}
