import "server-only";

import Stripe from "stripe";
import { seoConfig } from "@/config/seo";
import type { LocaleCode } from "@/config/locales";
import type { StripeCheckoutPaymentMethod } from "@/config/payments";
import { isPaymentsTestModeEnabled } from "@/lib/payments-test-mode";
import type { OrderItem } from "@/types/order";

const apiVersion = "2026-06-24.dahlia";

export function assertStripeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const testMode = isPaymentsTestModeEnabled();

  if (!secretKey) throw new Error("STRIPE_SECRET_KEY não está configurada.");

  if (testMode) {
    if (!secretKey.startsWith("sk_test_")) throw new Error("Em modo teste, STRIPE_SECRET_KEY tem de ser uma chave sk_test_.");
    if (publishableKey && !publishableKey.startsWith("pk_test_")) throw new Error("Em modo teste, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY tem de ser uma chave pk_test_.");
    return;
  }

  if (!secretKey.startsWith("sk_live_")) throw new Error("Em modo real, STRIPE_SECRET_KEY tem de ser uma chave sk_live_.");
  if (publishableKey && !publishableKey.startsWith("pk_live_")) throw new Error("Em modo real, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY tem de ser uma chave pk_live_.");
}

export const assertStripeTestModeConfig = assertStripeConfig;

export function getStripeClient() {
  assertStripeConfig();
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion });
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || seoConfig.siteUrl).replace(/\/$/, "");
}

export async function createStripeCheckoutSession(input: {
  orderId: number;
  orderNumber: string;
  locale: LocaleCode;
  items: OrderItem[];
  shippingTotal: number;
  total: number;
  stripePaymentMethod: StripeCheckoutPaymentMethod;
}) {
  if (input.stripePaymentMethod === "mb_way" && (input.total < 0.5 || input.total > 5000)) {
    throw new Error("MB WAY aceita pagamentos entre 0,50 € e 5.000 €.");
  }

  const stripe = getStripeClient();
  const currency = "eur";
  const expectedTotalCents = String(Math.round(input.total * 100));
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency,
      unit_amount: Math.round(item.unit_price * 100),
      product_data: {
        name: item.name,
        metadata: {
          product_id: item.product_id,
          stable_id: item.stable_id,
          sku: item.sku ?? "",
        },
      },
    },
  }));

  if (input.shippingTotal > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: Math.round(input.shippingTotal * 100),
        product_data: { name: "Shipping" },
      },
    });
  }

  const metadata = {
    order_id: String(input.orderId),
    order_number: input.orderNumber,
    payments_test_mode: String(isPaymentsTestModeEnabled()),
    expected_total_cents: expectedTotalCents,
    stripe_payment_method: input.stripePaymentMethod,
  };

  const baseUrl = siteUrl();
  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      payment_method_types: [input.stripePaymentMethod],
      line_items: lineItems,
      success_url: `${baseUrl}/${input.locale}/obrigado?pedido=${encodeURIComponent(input.orderNumber)}&stripe=success`,
      cancel_url: `${baseUrl}/${input.locale}/checkout?stripe=cancelled&pedido=${encodeURIComponent(input.orderNumber)}`,
      client_reference_id: String(input.orderId),
      metadata,
      payment_intent_data: { metadata },
    },
    { idempotencyKey: `checkout-order-${input.orderId}` },
  );
}

export function constructStripeWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET não está configurado.");
  return getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
}
