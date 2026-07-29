"use server";

import {
  createOrderNumber,
  getDeliveryShipping,
  normalizePaymentMethod,
  validateCustomer,
  validateDelivery,
  validatePayment,
  type DeliveryDetails,
  type PaymentDetails,
} from "@/lib/checkout";
import { getStripeCheckoutPaymentMethod, paymentConfig, stripeTestPaymentMethodId } from "@/config/payments";
import { defaultLocale, type LocaleCode } from "@/config/locales";
import { sendOrderNotification } from "@/lib/orders/send-order-notification";
import { isPaymentsTestModeEnabled } from "@/lib/payments-test-mode";
import { createStripeCheckoutSession } from "@/lib/stripe/server";
import { getPublishedProducts } from "@/lib/product-visibility";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItem, StoreOrder } from "@/types/order";

const orderSelect = "id,order_number,customer_name,phone,email,items,total,status,created_at,updated_at,email_sent_at,notification_error,internal_notes,subtotal,shipping_total,delivery_method,delivery_region,delivery_country,delivery_address,delivery_postal_code,delivery_city,delivery_notes,shipping_carrier,shipping_estimate,payment_method,payment_status,payment_reference,paid_at,payment_notes,stripe_checkout_session_id,stripe_payment_intent_id,stripe_payment_method,stripe_last_event_id,privacy_accepted,customer_locale";

type CheckoutInput = {
  customer?: { name?: unknown; phone?: unknown; email?: unknown };
  delivery?: { method?: unknown; region?: unknown; country?: unknown; address?: unknown; postalCode?: unknown; city?: unknown; notes?: unknown };
  payment?: { method?: unknown; privacyAccepted?: unknown };
  locale?: unknown;
  items?: unknown;
};

type RequestedItem = { stableId: string; quantity: number };

export type CheckoutResult =
  | { ok: true; orderNumber: string; checkoutUrl?: string }
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

function normalizeDelivery(input: CheckoutInput["delivery"]): DeliveryDetails {
  const method = input?.method === "Recolha em mão" ? "Recolha em mão" : "Envio";
  const region = input?.region === "EU" ? "EU" : "PT";
  return {
    method,
    region,
    country: typeof input?.country === "string" ? input.country.trim().slice(0, 80) : region === "PT" ? "Portugal" : "",
    address: typeof input?.address === "string" ? input.address.trim().slice(0, 240) : "",
    postalCode: typeof input?.postalCode === "string" ? input.postalCode.trim().slice(0, 24) : "",
    city: typeof input?.city === "string" ? input.city.trim().slice(0, 80) : "",
    notes: typeof input?.notes === "string" ? input.notes.trim().slice(0, 1000) : "",
  };
}

function normalizePayment(input: CheckoutInput["payment"], testMode: boolean): PaymentDetails {
  return {
    method: normalizePaymentMethod(input?.method, { testMode }),
    privacyAccepted: input?.privacyAccepted === true,
  };
}

function normalizeLocale(value: unknown): LocaleCode {
  return value === "pt" || value === "en" || value === "es" || value === "fr" || value === "de" || value === "zh" ? value : defaultLocale;
}

function stripePaymentNote(method: string) {
  if (method === stripeTestPaymentMethodId) return "Pagamento de teste por cartão via Stripe Checkout. Aguarda confirmação por webhook.";
  if (method === "MB Way") return "Pagamento de teste por MB Way via Stripe Checkout. Aguarda confirmação por webhook.";
  return "Dados bancários enviados após confirmação.";
}

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const customer = {
    name: typeof input.customer?.name === "string" ? input.customer.name.trim().slice(0, 120) : "",
    phone: typeof input.customer?.phone === "string" ? input.customer.phone.trim().slice(0, 40) : "",
    email: typeof input.customer?.email === "string" ? input.customer.email.trim().toLowerCase().slice(0, 160) : "",
  };
  if (Object.keys(validateCustomer(customer)).length > 0) {
    return { ok: false, message: "Confirma o nome, o telefone e o email introduzidos." };
  }

  const delivery = normalizeDelivery(input.delivery);
  if (Object.keys(validateDelivery(delivery)).length > 0) {
    return { ok: false, message: "Confirma os dados de entrega introduzidos." };
  }

  const paymentsTestMode = isPaymentsTestModeEnabled();
  const payment = normalizePayment(input.payment, paymentsTestMode);
  if (Object.keys(validatePayment(payment, { testMode: paymentsTestMode })).length > 0) {
    return { ok: false, message: "Confirma o método de pagamento e a política de privacidade." };
  }

  const stripePaymentMethod = getStripeCheckoutPaymentMethod(payment.method);
  if (stripePaymentMethod && !paymentsTestMode) {
    return { ok: false, message: "Este pagamento automático só está disponível em modo de teste." };
  }

  const requestedItems = parseItems(input.items);
  if (!requestedItems) {
    return { ok: false, message: "O carrinho está vazio ou contém quantidades inválidas." };
  }

  const products = await getPublishedProducts();
  const productByStableId = new Map(products.map((product) => [product.stableId, product]));
  const storedItems: OrderItem[] = [];
  let subtotalCents = 0;

  for (const requested of requestedItems) {
    const product = productByStableId.get(requested.stableId);
    if (!product) {
      return { ok: false, message: "Um produto deixou de estar disponível. Atualiza o carrinho e tenta novamente." };
    }

    const unitPriceCents = Math.round(product.price * 100);
    const subtotal = unitPriceCents * requested.quantity;
    subtotalCents += subtotal;
    storedItems.push({
      product_id: String(product.id),
      stable_id: product.stableId,
      sku: product.sku ?? null,
      name: product.nome,
      quantity: requested.quantity,
      unit_price: unitPriceCents / 100,
      subtotal: subtotal / 100,
    });
  }

  const shipping = getDeliveryShipping(delivery);
  const shippingCents = Math.round(shipping.price * 100);
  const subtotal = subtotalCents / 100;
  const shippingTotal = shippingCents / 100;
  const total = (subtotalCents + shippingCents) / 100;
  const orderNumber = createOrderNumber();
  const createdAt = new Date().toISOString();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      items: storedItems,
      subtotal,
      shipping_total: shippingTotal,
      total,
      delivery_method: delivery.method,
      delivery_region: delivery.method === "Envio" ? delivery.region : null,
      delivery_country: delivery.method === "Envio" ? delivery.country : "Portugal",
      delivery_address: delivery.method === "Envio" ? delivery.address : null,
      delivery_postal_code: delivery.method === "Envio" ? delivery.postalCode : null,
      delivery_city: delivery.method === "Envio" ? delivery.city : null,
      delivery_notes: delivery.notes || null,
      shipping_carrier: delivery.method === "Envio" ? shipping.carrier : null,
      shipping_estimate: delivery.method === "Envio" ? shipping.estimatedDelivery : null,
      payment_method: payment.method,
      payment_status: paymentConfig.defaultStatus,
      payment_reference: null,
      paid_at: null,
      payment_notes: stripePaymentNote(payment.method),
      stripe_payment_method: stripePaymentMethod,
      privacy_accepted: payment.privacyAccepted,
      customer_locale: normalizeLocale(input.locale),
      status: "Pendente",
      created_at: createdAt,
      updated_at: createdAt,
    })
    .select(orderSelect)
    .single();

  if (error) {
    console.error("Checkout order insert failed", { code: error.code, message: error.message, details: error.details, hint: error.hint });
    return {
      ok: false,
      message:
        process.env.NODE_ENV === "development"
          ? `${error.code}: ${error.message}${error.details ? ` | ${error.details}` : ""}${error.hint ? ` | ${error.hint}` : ""}`
          : "Não foi possível guardar a encomenda. Tenta novamente dentro de alguns instantes.",
    };
  }

  const order = data as StoreOrder;

  if (stripePaymentMethod) {
    try {
      const session = await createStripeCheckoutSession({
        orderId: order.id,
        orderNumber,
        locale: normalizeLocale(input.locale),
        items: storedItems,
        shippingTotal,
        total,
        stripePaymentMethod,
      });

      await supabase
        .from("orders")
        .update({
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          stripe_payment_method: stripePaymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (!session.url) throw new Error("Stripe Checkout não devolveu URL.");
      return { ok: true, orderNumber, checkoutUrl: session.url };
    } catch (stripeError) {
      console.error("Stripe Checkout session failed", stripeError);
      return { ok: false, message: "Não foi possível iniciar o pagamento de teste Stripe. Confirma as chaves de teste e o método selecionado." };
    }
  }

  const notification = await sendOrderNotification(order);
  if (notification.ok) {
    await supabase.from("orders").update({ email_sent_at: new Date().toISOString(), notification_error: null }).eq("id", order.id);
  } else {
    console.error("Order notification failed", { orderNumber, error: notification.error });
    await supabase.from("orders").update({ notification_error: notification.error }).eq("id", order.id);
  }

  return { ok: true, orderNumber };
}
