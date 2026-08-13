import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItem } from "@/types/order";

type InventoryRow = {
  stable_id: string;
  stock_quantity: number;
};

function requestedQuantities(items: OrderItem[]) {
  const quantities = new Map<string, number>();

  for (const item of items) {
    quantities.set(item.stable_id, (quantities.get(item.stable_id) ?? 0) + item.quantity);
  }

  return quantities;
}

export async function validateInventoryForOrder(items: OrderItem[]) {
  const quantities = requestedQuantities(items);
  const stableIds = [...quantities.keys()];

  if (stableIds.length === 0) {
    return { ok: false as const, message: "O carrinho está vazio." };
  }

  const { data, error } = await createAdminClient()
    .from("product_inventory")
    .select("stable_id,stock_quantity")
    .in("stable_id", stableIds);

  if (error) {
    return {
      ok: false as const,
      message: "Não foi possível validar o stock. Confirma se a migration de inventário foi aplicada no Supabase.",
    };
  }

  const stockByStableId = new Map((data ?? []).map((row) => {
    const inventory = row as InventoryRow;
    return [inventory.stable_id, Number(inventory.stock_quantity)];
  }));

  for (const [stableId, quantity] of quantities) {
    const stock = stockByStableId.get(stableId);

    if (stock === undefined) {
      return { ok: false as const, message: "Um produto ainda não tem stock configurado. Contacta-nos antes de finalizar." };
    }

    if (stock < quantity) {
      return { ok: false as const, message: "Um produto já não tem stock suficiente para a quantidade escolhida." };
    }
  }

  return { ok: true as const };
}

export async function decrementInventoryForPaidOrder(orderId: number, items: OrderItem[], stripeEventId: string) {
  const { data, error } = await createAdminClient().rpc("decrement_order_inventory_once", {
    input_order_id: orderId,
    input_items: items,
    input_stripe_event_id: stripeEventId,
  });

  return {
    ok: !error,
    decremented: Boolean(data),
    error: error?.message ?? null,
  };
}
