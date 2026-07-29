import "server-only";

import Stripe from "stripe";
import { seoConfig } from "@/config/seo";
import type { LocaleCode } from "@/config/locales";
import type { StripeCheckoutPaymentMethod } from "@/config/payments";
import type { OrderItem } from "@/types/order";

const apiVersion = "2026-06-24.dahlia";

export function assertStripeTestModeConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  if (!secretKey) throw new Error("STRIPE_SECRET_KEY não está configurada.");
  if (secretKey.startsWith("sk_live_")) throw new Error("Chaves live da Stripe não são permitidas nesta integração.");
  if (!secretKey.startsWith("sk_test_")) throw new Error("STRIPE_SECRET_KEY tem de ser uma chave de teste sk_test_.");
  if (publishableKey && !publishableKey.startsWith("pk_test_")) throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY tem de ser uma chave de teste pk_test_.");
}

export function getStripeClient() {
  assertStripeTestModeConfig();
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
        product_data: { name: "Portes" },
      },
    });
  }

  const metadata = {
    order_id: String(input.orderId),
    order_number: input.orderNumber,
    payments_test_mode: "true",
    expected_total_cents: expectedTotalCents,
    stripe_payment_method: input.stripePaymentMethod,
  };

  const baseUrl = siteUrl();
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: [input.stripePaymentMethod],
    line_items: lineItems,
    success_url: `${baseUrl}/${input.locale}/obrigado?pedido=${encodeURIComponent(input.orderNumber)}&stripe=success`,
    cancel_url: `${baseUrl}/${input.locale}/checkout?stripe=cancelled&pedido=${encodeURIComponent(input.orderNumber)}`,
    client_reference_id: String(input.orderId),
    metadata,
    payment_intent_data: { metadata },
  });
}

export function constructStripeWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET não está configurado.");
  if (webhookSecret.startsWith("whsec_live")) throw new Error("Webhook live da Stripe não é permitido nesta integração.");
  return getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
}
