import type { CartLine } from "@/hooks/use-store";
import { getEnabledPaymentMethods, isEnabledPaymentMethod, paymentConfig, type PaymentMethodId } from "@/config/payments";
import { getShippingRegion, shippingConfig, type ShippingRegionId } from "@/config/shipping";

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
};

export type DeliveryMethod = "Envio" | "Recolha em mão";

export type DeliveryDetails = {
  method: DeliveryMethod;
  region: ShippingRegionId;
  country: string;
  address: string;
  postalCode: string;
  city: string;
  notes: string;
};

export type PaymentDetails = {
  method: PaymentMethodId;
  privacyAccepted: boolean;
};

export const enabledPaymentMethods = getEnabledPaymentMethods();

export function validateCustomer(details: CustomerDetails) {
  const errors: Partial<Record<keyof CustomerDetails, string>> = {};
  if (details.name.trim().length < 2) errors.name = "Indica o teu nome.";
  if (details.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
    errors.email = "Indica um email válido.";
  }
  if (!/^(?:\+351\s?)?9\d{8}$/.test(details.phone.replace(/\s/g, ""))) {
    errors.phone = "Indica um telefone português válido.";
  }
  return errors;
}

export function validateDelivery(details: DeliveryDetails) {
  const errors: Partial<Record<keyof DeliveryDetails, string>> = {};
  if (details.method === "Envio") {
    if (!shippingConfig.regions.some((region) => region.id === details.region)) errors.region = "Seleciona a região de entrega.";
    if (details.country.trim().length < 2) errors.country = "Indica o país de entrega.";
    if (details.address.trim().length < 5) errors.address = "Indica a morada de entrega.";
    if (details.region === "PT" && !/^\d{4}-\d{3}$/.test(details.postalCode.trim())) {
      errors.postalCode = "Indica um código postal no formato 0000-000.";
    } else if (details.postalCode.trim().length < 3) {
      errors.postalCode = "Indica o código postal.";
    }
    if (details.city.trim().length < 2) errors.city = "Indica a localidade.";
  }
  return errors;
}

export function validatePayment(details: PaymentDetails) {
  const errors: Partial<Record<keyof PaymentDetails, string>> = {};
  if (!isEnabledPaymentMethod(details.method)) errors.method = "Seleciona um método de pagamento disponível.";
  if (!details.privacyAccepted) errors.privacyAccepted = "Confirma a aceitação da política de privacidade.";
  return errors;
}

export function getDeliveryShipping(delivery?: DeliveryDetails) {
  if (!delivery || delivery.method !== "Envio") {
    return { price: 0, carrier: "A combinar", estimatedDelivery: "A combinar", regionLabel: "Recolha em mão" };
  }
  const region = getShippingRegion(delivery.region);
  return {
    price: region.price,
    carrier: region.carrier,
    estimatedDelivery: region.estimatedDelivery,
    regionLabel: region.label,
  };
}

export function calculateOrderTotals(cart: CartLine[], delivery?: DeliveryDetails) {
  const subtotalCents = cart.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );
  const shipping = getDeliveryShipping(delivery);
  const shippingCents = Math.round(shipping.price * 100);
  return {
    subtotalCents,
    subtotal: subtotalCents / 100,
    shippingCents,
    shipping: shippingCents / 100,
    totalCents: subtotalCents + shippingCents,
    total: (subtotalCents + shippingCents) / 100,
    shippingInfo: shipping,
  };
}

export function createOrderNumber(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `AM-${date}-${suffix}`;
}

export function normalizePaymentMethod(value: unknown): PaymentMethodId {
  return typeof value === "string" && isEnabledPaymentMethod(value) ? value : paymentConfig.defaultMethod;
}
