import type { CartLine } from "@/hooks/use-store";
export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  locality: string;
  district: string;
  notes: string;
};

export type DeliverySelection =
  | { method: "shipping" }
  | { method: "location-pickup"; locationId: string }
  | { method: "event-pickup"; eventId: string };

export function validateCustomer(details: CustomerDetails, requireShippingAddress = true) {
  const errors: Partial<Record<keyof CustomerDetails, string>> = {};
  if (details.name.trim().length < 2) errors.name = "Indica o teu nome.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) errors.email = "Indica um email válido.";
  if (!/^(?:\+351\s?)?9\d{8}$/.test(details.phone.replace(/\s/g, ""))) errors.phone = "Indica um telefone português válido.";
  if (requireShippingAddress) {
    if (!details.address.trim()) errors.address = "Indica a morada.";
    if (!/^\d{4}-\d{3}$/.test(details.postalCode)) errors.postalCode = "Usa o formato 0000-000.";
    if (!details.locality.trim()) errors.locality = "Indica a localidade.";
  }
  return errors;
}

export function calculateOrderTotals(cart: CartLine[], shippingPrice: number | null) {
  const subtotalCents = cart.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  const shippingCents = shippingPrice === null ? null : Math.round(shippingPrice * 100);
  const totalCents = shippingCents === null ? null : subtotalCents + shippingCents;
  return {
    subtotalCents,
    shippingCents,
    discountCents: 0,
    totalCents,
    subtotal: subtotalCents / 100,
    shipping: shippingCents === null ? null : shippingCents / 100,
    discount: 0,
    total: totalCents === null ? null : totalCents / 100,
  };
}

export function createOrderNumber(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `AM-${date}-${suffix}`;
}
