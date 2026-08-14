import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { constructStripeWebhookEvent } from "@/lib/stripe/server";
import { sendOrderNotification } from "@/lib/orders/send-order-notification";
import type { StripeCheckoutPaymentMethod } from "@/config/payments";
import type { OrderItem, StoreOrder } from "@/types/order";

export const runtime = "nodejs";

type StripePaymentStatus = "pago" | "falhado" | "reembolsado";

type StripeOrder = {
  id: number;
  order_number: string;
  total: number;
  items: OrderItem[];
  payment_status: string | null;
  email: string | null;
  customer_name: string;
  phone: string;
  created_at: string;
  subtotal: number | null;
  shipping_total: number;
  status: StoreOrder["status"];
  updated_at: string;
  email_sent_at: string | null;
  notification_error: string | null;
  delivery_method: string | null;
  delivery_region: string | null;
  delivery_country: string | null;
  delivery_address: string | null;
  delivery_postal_code: string | null;
  delivery_city: string | null;
  delivery_notes: string | null;
  shipping_carrier: string | null;
  shipping_estimate: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  payment_notes: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_payment_method: string | null;
  stripe_last_event_id: string | null;
  privacy_accepted: boolean;
  customer_locale: string | null;
  internal_notes: string | null;
};

function paymentIntentId(value: Stripe.Checkout.Session["payment_intent"] | Stripe.PaymentIntent | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function cents(value: number | null | undefined) {
  return Math.round(Number(value ?? 0) * 100);
}

function normalizeStripePaymentMethod(value: string | null | undefined): StripeCheckoutPaymentMethod | null {
  return value === "card" || value === "mb_way" ? value : null;
}

function paymentMethodFromSession(session: Stripe.Checkout.Session) {
  return normalizeStripePaymentMethod(session.payment_method_types?.[0] ?? session.metadata?.stripe_payment_method);
}

function paymentMethodFromIntent(paymentIntent: Stripe.PaymentIntent) {
  return normalizeStripePaymentMethod(paymentIntent.payment_method_types?.[0] ?? paymentIntent.metadata?.stripe_payment_method);
}

function paymentMethodFromCharge(charge: Stripe.Charge) {
  return normalizeStripePaymentMethod(charge.payment_method_details?.type);
}

async function claimWebhookEvent(event: Stripe.Event) {
  const { error } = await createAdminClient().from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    processed_at: new Date().toISOString(),
  });

  if (!error) return { duplicate: false, error: null };
  if (error.code === "23505") return { duplicate: true, error: null };
  return { duplicate: false, error: error.message };
}

async function releaseWebhookEvent(eventId: string) {
  await createAdminClient().from("stripe_webhook_events").delete().eq("stripe_event_id", eventId);
}

async function failWebhook(eventId: string, message: string, status = 500) {
  await releaseWebhookEvent(eventId);
  return NextResponse.json({ error: message }, { status });
}

async function findOrder(input: { orderId?: string | null; sessionId?: string | null; paymentIntentId?: string | null }) {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("id,order_number,customer_name,phone,email,items,total,status,created_at,updated_at,email_sent_at,notification_error,internal_notes,subtotal,shipping_total,delivery_method,delivery_region,delivery_country,delivery_address,delivery_postal_code,delivery_city,delivery_notes,shipping_carrier,shipping_estimate,payment_method,payment_status,payment_reference,paid_at,payment_notes,stripe_checkout_session_id,stripe_payment_intent_id,stripe_payment_method,stripe_last_event_id,privacy_accepted,customer_locale")
    .limit(1);

  if (input.orderId) {
    query = query.eq("id", Number(input.orderId));
  } else if (input.sessionId) {
    query = query.eq("stripe_checkout_session_id", input.sessionId);
  } else if (input.paymentIntentId) {
    query = query.eq("stripe_payment_intent_id", input.paymentIntentId);
  } else {
    return { order: null, error: "Evento Stripe sem order_id, session id ou payment_intent." };
  }

  const { data, error } = await query.maybeSingle();
  if (error) return { order: null, error: error.message };
  if (!data) return { order: null, error: "Encomenda Stripe não encontrada." };
  return { order: data as StripeOrder, error: null };
}

function validateAmount(order: StripeOrder, currency: string | null | undefined, amount: number | null | undefined) {
  if ((currency ?? "").toLowerCase() !== "eur") return "Moeda Stripe inválida.";
  if (amount !== cents(order.total)) return "Valor Stripe não corresponde ao total da encomenda.";
  return null;
}

function validatePaymentMethod(order: StripeOrder, method: StripeCheckoutPaymentMethod | null) {
  if (!method) return "Método de pagamento Stripe inválido ou ausente.";
  if (order.stripe_payment_method && order.stripe_payment_method !== method) return "Método de pagamento Stripe não corresponde à encomenda.";
  return null;
}

async function updateOrderPayment(input: {
  order: StripeOrder;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  stripePaymentMethod?: StripeCheckoutPaymentMethod | null;
  status: StripePaymentStatus;
  eventId: string;
}) {
  const patch: Record<string, string | null> = {
    payment_status: input.status,
    paid_at: input.status === "pago" ? new Date().toISOString() : input.status === "reembolsado" ? input.order.paid_at : null,
    updated_at: new Date().toISOString(),
    stripe_last_event_id: input.eventId,
  };

  if (input.status === "pago" && input.order.payment_status === "pago") {
    delete patch.payment_status;
    delete patch.paid_at;
  }

  if (input.sessionId) patch.stripe_checkout_session_id = input.sessionId;
  if (input.paymentIntentId) patch.stripe_payment_intent_id = input.paymentIntentId;
  if (input.stripePaymentMethod) patch.stripe_payment_method = input.stripePaymentMethod;

  const { error } = await createAdminClient().from("orders").update(patch).eq("id", input.order.id);
  return { error: error?.message ?? null };
}

async function handleAwaiting(input: {
  eventId: string;
  orderId?: string | null;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  stripePaymentMethod?: StripeCheckoutPaymentMethod | null;
  currency?: string | null;
  amount?: number | null;
}) {
  const { order, error } = await findOrder(input);
  if (error || !order) return { error: error ?? "Encomenda não encontrada." };

  const amountError = validateAmount(order, input.currency, input.amount);
  if (amountError) return { error: amountError };

  const paymentMethodError = validatePaymentMethod(order, input.stripePaymentMethod ?? null);
  if (paymentMethodError) return { error: paymentMethodError };

  const patch: Record<string, string> = {
    updated_at: new Date().toISOString(),
    stripe_last_event_id: input.eventId,
  };
  if (input.sessionId) patch.stripe_checkout_session_id = input.sessionId;
  if (input.paymentIntentId) patch.stripe_payment_intent_id = input.paymentIntentId;
  if (input.stripePaymentMethod) patch.stripe_payment_method = input.stripePaymentMethod;

  const { error: updateError } = await createAdminClient().from("orders").update(patch).eq("id", order.id);
  return { error: updateError?.message ?? null };
}

async function handleRefunded(input: {
  eventId: string;
  paymentIntentId?: string | null;
  stripePaymentMethod?: StripeCheckoutPaymentMethod | null;
  currency?: string | null;
  amount?: number | null;
}) {
  const { order, error } = await findOrder(input);
  if (error || !order) return { error: error ?? "Encomenda não encontrada." };

  const amountError = validateAmount(order, input.currency, input.amount);
  if (amountError) return { error: amountError };

  const paymentMethodError = validatePaymentMethod(order, input.stripePaymentMethod ?? null);
  if (paymentMethodError) return { error: paymentMethodError };

  return updateOrderPayment({
    order,
    paymentIntentId: input.paymentIntentId,
    stripePaymentMethod: input.stripePaymentMethod,
    status: "reembolsado",
    eventId: input.eventId,
  });
}

async function handlePaid(input: {
  eventId: string;
  orderId?: string | null;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  stripePaymentMethod?: StripeCheckoutPaymentMethod | null;
  currency?: string | null;
  amount?: number | null;
}) {
  const { order, error } = await findOrder(input);
  if (error || !order) return { error: error ?? "Encomenda não encontrada." };

  const amountError = validateAmount(order, input.currency, input.amount);
  if (amountError) return { error: amountError };

  const paymentMethodError = validatePaymentMethod(order, input.stripePaymentMethod ?? null);
  if (paymentMethodError) return { error: paymentMethodError };

  if (order.payment_status === "pago") {
    return updateOrderPayment({
      order,
      sessionId: input.sessionId,
      paymentIntentId: input.paymentIntentId,
      stripePaymentMethod: input.stripePaymentMethod,
      status: "pago",
      eventId: input.eventId,
    });
  }

  const payment = await updateOrderPayment({
    order,
    sessionId: input.sessionId,
    paymentIntentId: input.paymentIntentId,
    stripePaymentMethod: input.stripePaymentMethod,
    status: "pago",
    eventId: input.eventId,
  });

  if (payment.error) return payment;

  const notification = await sendOrderNotification({ ...order, payment_status: "pago", paid_at: new Date().toISOString() }, { kind: "paid" });
  if (!notification.ok) {
    await createAdminClient().from("orders").update({ notification_error: notification.error, updated_at: new Date().toISOString() }).eq("id", order.id);
    return { error: null };
  }

  await createAdminClient().from("orders").update({ payment_email_sent_at: new Date().toISOString(), notification_error: null, updated_at: new Date().toISOString() }).eq("id", order.id);
  return { error: null };
}

async function handleFailed(input: {
  eventId: string;
  orderId?: string | null;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  stripePaymentMethod?: StripeCheckoutPaymentMethod | null;
}) {
  const { order, error } = await findOrder(input);
  if (error || !order) return { error: error ?? "Encomenda não encontrada." };
  return updateOrderPayment({
    order,
    sessionId: input.sessionId,
    paymentIntentId: input.paymentIntentId,
    stripePaymentMethod: input.stripePaymentMethod,
    status: "falhado",
    eventId: input.eventId,
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(await request.text(), signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const claimed = await claimWebhookEvent(event);
  if (claimed.error) return NextResponse.json({ error: claimed.error }, { status: 500 });
  if (claimed.duplicate) return NextResponse.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const handler = session.payment_status === "paid" ? handlePaid : handleAwaiting;
    const result = await handler({
      eventId: event.id,
      orderId: session.metadata?.order_id ?? session.client_reference_id,
      sessionId: session.id,
      paymentIntentId: paymentIntentId(session.payment_intent),
      stripePaymentMethod: paymentMethodFromSession(session),
      currency: session.currency,
      amount: session.amount_total,
    });

    if (result.error) return failWebhook(event.id, result.error);
  }

  if (event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await handlePaid({
      eventId: event.id,
      orderId: session.metadata?.order_id ?? session.client_reference_id,
      sessionId: session.id,
      paymentIntentId: paymentIntentId(session.payment_intent),
      stripePaymentMethod: paymentMethodFromSession(session),
      currency: session.currency,
      amount: session.amount_total,
    });

    if (result.error) return failWebhook(event.id, result.error);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const result = await handlePaid({
      eventId: event.id,
      orderId: paymentIntent.metadata?.order_id,
      paymentIntentId: paymentIntent.id,
      stripePaymentMethod: paymentMethodFromIntent(paymentIntent),
      currency: paymentIntent.currency,
      amount: paymentIntent.amount_received,
    });

    if (result.error) return failWebhook(event.id, result.error);
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await handleFailed({
      eventId: event.id,
      orderId: session.metadata?.order_id ?? session.client_reference_id,
      sessionId: session.id,
      paymentIntentId: paymentIntentId(session.payment_intent),
      stripePaymentMethod: paymentMethodFromSession(session),
    });

    if (result.error) return failWebhook(event.id, result.error);
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const result = await handleFailed({
      eventId: event.id,
      orderId: paymentIntent.metadata?.order_id,
      paymentIntentId: paymentIntent.id,
      stripePaymentMethod: paymentMethodFromIntent(paymentIntent),
    });

    if (result.error) return failWebhook(event.id, result.error);
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.refunded) {
      const result = await handleRefunded({
        eventId: event.id,
        paymentIntentId: paymentIntentId(charge.payment_intent),
        stripePaymentMethod: paymentMethodFromCharge(charge),
        currency: charge.currency,
        amount: charge.amount,
      });

      if (result.error) return failWebhook(event.id, result.error);
    }
  }

  return NextResponse.json({ received: true });
}
