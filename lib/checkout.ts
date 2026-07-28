import type { CartLine } from "@/hooks/use-store";

export type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
};

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

export function calculateOrderTotals(cart: CartLine[]) {
  const subtotalCents = cart.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );
  return {
    subtotalCents,
    subtotal: subtotalCents / 100,
    totalCents: subtotalCents,
    total: subtotalCents / 100,
  };
}

export function createOrderNumber(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `AM-${date}-${suffix}`;
}
