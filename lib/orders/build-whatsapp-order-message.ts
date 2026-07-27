import type { CartLine } from "@/hooks/use-store";
import type { CustomerDetails, DeliverySelection } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

type OrderMessageInput = {
  orderNumber: string;
  cart: CartLine[];
  customer: CustomerDetails;
  delivery: DeliverySelection;
  deliveryLabel: string;
  subtotal: number;
  shipping: number | null;
  total: number | null;
};

function cleanText(value: string, maxLength = 500) {
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function buildWhatsAppOrderMessage(input: OrderMessageInput) {
  const productLines = input.cart.flatMap((item, index) => [
    `${index + 1}. ${cleanText(item.nome, 120)}`,
    `Referência: ${cleanText(item.sku ?? item.stableId, 80)}`,
    `Quantidade: ${item.quantity}`,
    `Preço unitário: ${formatPrice(item.price)}`,
    `Subtotal: ${formatPrice(item.price * item.quantity)}`,
    "",
  ]);

  const customerLines = [
    `Nome: ${cleanText(input.customer.name, 120)}`,
    `Telefone: ${cleanText(input.customer.phone, 30)}`,
    `Email: ${cleanText(input.customer.email, 160)}`,
  ];

  const deliveryLines = [`Método: ${cleanText(input.deliveryLabel, 200)}`];
  if (input.delivery.method === "shipping") {
    deliveryLines.push(
      `Morada: ${cleanText(input.customer.address, 180)}`,
      `Código postal: ${cleanText(input.customer.postalCode, 20)}`,
      `Localidade: ${cleanText(input.customer.locality, 100)}`,
    );
    if (input.customer.district.trim()) deliveryLines.push(`Distrito: ${cleanText(input.customer.district, 100)}`);
  }

  return [
    "Olá! Gostaria de fazer a seguinte encomenda na Andrea's Mystery.",
    "",
    "ENCOMENDA",
    `N.º: ${input.orderNumber}`,
    "",
    "PRODUTOS",
    "",
    ...productLines,
    "RESUMO",
    "",
    `Subtotal: ${formatPrice(input.subtotal)}`,
    `Portes: ${input.shipping === null ? "A confirmar" : formatPrice(input.shipping)}`,
    `Total: ${input.total === null ? "A confirmar" : formatPrice(input.total)}`,
    "",
    "CLIENTE",
    "",
    ...customerLines,
    "",
    "ENTREGA",
    "",
    ...deliveryLines,
    ...(input.customer.notes.trim() ? ["", "OBSERVAÇÕES", "", cleanText(input.customer.notes)] : []),
    "",
    "Estado: A aguardar confirmação.",
  ].join("\n");
}

export function buildWhatsAppOrderUrl(whatsappNumber: string, message: string) {
  if (!/^\d{8,15}$/.test(whatsappNumber)) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
