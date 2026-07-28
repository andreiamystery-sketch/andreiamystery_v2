"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderStatuses, type OrderStatus } from "@/types/order";

export type OrderStatusResult = { ok: boolean; message: string };

export async function updateOrderStatus(
  orderId: unknown,
  status: unknown
): Promise<OrderStatusResult> {
  await requireAdmin();
  const id = Number(orderId);

  if (!Number.isInteger(id) || id < 1 || !orderStatuses.includes(status as OrderStatus)) {
    return { ok: false, message: "Estado ou encomenda inválidos." };
  }

  const { error } = await createAdminClient()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, message: "Não foi possível atualizar a encomenda." };
  }

  revalidatePath("/admin/encomendas");
  return { ok: true, message: "Estado atualizado." };
}
