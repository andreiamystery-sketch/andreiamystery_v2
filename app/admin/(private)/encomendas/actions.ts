"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { sendOrderNotification } from "@/lib/orders/send-order-notification";
import { createAdminClient } from "@/lib/supabase/admin";
import { orderStatuses, paymentStatuses, type OrderStatus, type PaymentStatus, type StoreOrder } from "@/types/order";

export type OrderActionResult = { ok: boolean; message: string };

const orderSelect = "id,order_number,customer_name,phone,email,items,total,status,created_at,updated_at,email_sent_at,notification_error,internal_notes,subtotal,shipping_total,delivery_method,delivery_region,delivery_country,delivery_address,delivery_postal_code,delivery_city,delivery_notes,shipping_carrier,shipping_estimate,payment_method,payment_status,payment_reference,paid_at,payment_notes,stripe_checkout_session_id,stripe_payment_intent_id,stripe_payment_method,stripe_last_event_id,privacy_accepted,customer_locale";

export async function updateOrderStatus(orderId: unknown, status: unknown): Promise<OrderActionResult> {
  await requireAdmin();
  const id = Number(orderId);
  const nextStatus = status as OrderStatus;

  if (!Number.isInteger(id) || id < 1 || !orderStatuses.includes(nextStatus)) {
    return { ok: false, message: "Estado ou encomenda inválidos." };
  }

  const supabase = createAdminClient();
  const { data: current, error: readError } = await supabase.from("orders").select("id,status").eq("id", id).single();

  if (readError || !current) return { ok: false, message: "Não foi possível encontrar a encomenda." };
  if ((current.status as OrderStatus) === nextStatus) return { ok: true, message: "O estado já estava atualizado." };

  const { error } = await supabase.from("orders").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, message: "Não foi possível atualizar a encomenda." };

  await supabase.from("order_status_history").insert({ order_id: id, previous_status: current.status, new_status: nextStatus, created_at: new Date().toISOString(), changed_by: "admin" });
  revalidatePath("/admin/encomendas");
  return { ok: true, message: "Estado atualizado." };
}

export async function updateOrderPaymentStatus(orderId: unknown, status: unknown): Promise<OrderActionResult> {
  await requireAdmin();
  const id = Number(orderId);
  const paymentStatus = status as PaymentStatus;

  if (!Number.isInteger(id) || id < 1 || !paymentStatuses.includes(paymentStatus)) {
    return { ok: false, message: "Estado de pagamento inválido." };
  }

  const patch = {
    payment_status: paymentStatus,
    paid_at: paymentStatus === "pago" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await createAdminClient().from("orders").update(patch).eq("id", id);
  if (error) return { ok: false, message: "Não foi possível atualizar o pagamento." };

  revalidatePath("/admin/encomendas");
  return { ok: true, message: "Estado de pagamento atualizado." };
}

export async function updateOrderInternalNote(orderId: unknown, note: unknown): Promise<OrderActionResult> {
  await requireAdmin();
  const id = Number(orderId);
  const internalNote = typeof note === "string" ? note.trim().slice(0, 2000) : "";

  if (!Number.isInteger(id) || id < 1) return { ok: false, message: "Encomenda inválida." };

  const { error } = await createAdminClient().from("orders").update({ internal_notes: internalNote || null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, message: "Não foi possível guardar a nota interna." };

  revalidatePath("/admin/encomendas");
  return { ok: true, message: "Nota interna guardada." };
}

export async function resendOrderNotification(orderId: unknown): Promise<OrderActionResult> {
  await requireAdmin();
  const id = Number(orderId);

  if (!Number.isInteger(id) || id < 1) return { ok: false, message: "Encomenda inválida." };

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("orders").select(orderSelect).eq("id", id).single();
  if (error || !data) return { ok: false, message: "Não foi possível carregar a encomenda." };

  const notification = await sendOrderNotification(data as StoreOrder);
  if (notification.ok) {
    await supabase.from("orders").update({ email_sent_at: new Date().toISOString(), notification_error: null, updated_at: new Date().toISOString() }).eq("id", id);
    revalidatePath("/admin/encomendas");
    return { ok: true, message: "Notificação reenviada." };
  }

  await supabase.from("orders").update({ notification_error: notification.error, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/encomendas");
  return { ok: false, message: "Não foi possível reenviar a notificação." };
}



