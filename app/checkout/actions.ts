"use server";

import { createOrderNumber, validateCustomer } from "@/lib/checkout";
import { sendOrderNotification } from "@/lib/orders/send-order-notification";
import { getPublishedProducts } from "@/lib/product-visibility";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItem, StoreOrder } from "@/types/order";

type CheckoutInput = {
  customer?: { name?: unknown; phone?: unknown; email?: unknown };
  items?: unknown;
};

type RequestedItem = { stableId: string; quantity: number };

export type CheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; message: string };

function parseItems(value: unknown): RequestedItem[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;

  const quantities = new Map<string, number>();
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const stableId = String((item as { stableId?: unknown }).stableId ?? "").trim();
    const quantity = Number((item as { quantity?: unknown }).quantity);
    if (!stableId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    quantities.set(stableId, (quantities.get(stableId) ?? 0) + quantity);
  }

  return [...quantities].map(([stableId, quantity]) => ({ stableId, quantity }));
}

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const customer = {
    name: typeof input.customer?.name === "string" ? input.customer.name.trim() : "",
    phone: typeof input.customer?.phone === "string" ? input.customer.phone.trim() : "",
    email: typeof input.customer?.email === "string" ? input.customer.email.trim().toLowerCase() : "",
  };
  if (Object.keys(validateCustomer(customer)).length > 0) {
    return { ok: false, message: "Confirma o nome, o telefone e o email introduzidos." };
  }

  const requestedItems = parseItems(input.items);
  if (!requestedItems) {
    return { ok: false, message: "O carrinho está vazio ou contém quantidades inválidas." };
  }

  const products = await getPublishedProducts();
  const productByStableId = new Map(products.map((product) => [product.stableId, product]));
  const storedItems: OrderItem[] = [];
  let totalCents = 0;

  for (const requested of requestedItems) {
    const product = productByStableId.get(requested.stableId);
    if (!product) {
      return { ok: false, message: "Um produto deixou de estar disponível. Atualiza o carrinho e tenta novamente." };
    }

    const unitPriceCents = Math.round(product.price * 100);
    const subtotalCents = unitPriceCents * requested.quantity;
    totalCents += subtotalCents;
    storedItems.push({
      product_id: String(product.id),
      stable_id: product.stableId,
      sku: product.sku ?? null,
      name: product.nome,
      quantity: requested.quantity,
      unit_price: unitPriceCents / 100,
      subtotal: subtotalCents / 100,
    });
  }

  const orderNumber = createOrderNumber();
  const total = totalCents / 100;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      items: storedItems,
      total,
      status: "Pendente",
      created_at: new Date().toISOString(),
    })
    .select("id,order_number,customer_name,phone,email,items,total,status,created_at,updated_at,email_sent_at,notification_error")
    .single();

  if (error) {
  console.error("Checkout order insert failed", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });

  return {
    ok: false,
    message:
      process.env.NODE_ENV === "development"
        ? `${error.code}: ${error.message}${error.details ? ` | ${error.details}` : ""}${error.hint ? ` | ${error.hint}` : ""}`
        : "Não foi possível guardar a encomenda. Tenta novamente dentro de alguns instantes.",
  };
}

  const order = data as StoreOrder;
  const notification = await sendOrderNotification(order);
  if (notification.ok) {
    await supabase
      .from("orders")
      .update({ email_sent_at: new Date().toISOString(), notification_error: null })
      .eq("id", order.id);
  } else {
    console.error("Order notification failed", {
      orderNumber,
      error: notification.error,
    });
    await supabase
      .from("orders")
      .update({ notification_error: notification.error })
      .eq("id", order.id);
  }

  return { ok: true, orderNumber };
}
