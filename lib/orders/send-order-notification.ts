import "server-only";

import { companyConfig } from "@/config/company";
import type { StoreOrder } from "@/types/order";

const recipient = companyConfig.email;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function euros(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function field(label: string, value: string | number | null | undefined) {
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value || "Não indicado"))}</p>`;
}

export async function sendOrderNotification(order: StoreOrder) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false as const, error: "RESEND_API_KEY ou RESEND_FROM_EMAIL não configurado." };
  }

  const formattedDate = new Intl.DateTimeFormat("pt-PT", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Lisbon" }).format(new Date(order.created_at));
  const destination = [order.delivery_country, order.delivery_region].filter(Boolean).join(" · ");
  const address = [order.delivery_address, order.delivery_postal_code, order.delivery_city].filter(Boolean).join(", ");

  const itemRows = order.items.map((item) => `<tr><td style="padding:12px;border-bottom:1px solid #eadfca">${escapeHtml(item.name)}</td><td style="padding:12px;border-bottom:1px solid #eadfca;text-align:center">${item.quantity}</td><td style="padding:12px;border-bottom:1px solid #eadfca;text-align:right">${euros(item.unit_price)}</td><td style="padding:12px;border-bottom:1px solid #eadfca;text-align:right">${euros(item.subtotal)}</td></tr>`).join("");
  const textItems = order.items.map((item) => `${item.quantity} × ${item.name} — ${euros(item.unit_price)} — ${euros(item.subtotal)}`).join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `order-notification/${order.order_number}` },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: order.email || undefined,
      subject: `Nova encomenda ${order.order_number} — ${order.customer_name}`,
      html: `<div style="background:#f6f1e8;padding:32px;font-family:Arial,sans-serif;color:#241d17"><div style="max-width:760px;margin:auto;background:#fff;padding:32px;border:1px solid #d9c39a"><p style="letter-spacing:.18em;text-transform:uppercase;color:#9a7634">Andrea's Mystery</p><h1 style="font-family:Georgia,serif;font-size:32px">Nova encomenda</h1>${field("Número", order.order_number)}${field("Data", formattedDate)}${field("Idioma", order.customer_locale ?? "pt")}<h2 style="font-family:Georgia,serif">Cliente</h2>${field("Nome", order.customer_name)}${field("Telefone", order.phone)}${field("Email", order.email)}<h2 style="font-family:Georgia,serif">Entrega</h2>${field("Método", order.delivery_method)}${field("Destino", destination)}${field("Morada", address)}${field("Transportadora", order.shipping_carrier)}${field("Prazo estimado", order.shipping_estimate)}${field("Observações", order.delivery_notes)}<h2 style="font-family:Georgia,serif">Pagamento</h2>${field("Método", order.payment_method)}${field("Estado", order.payment_status)}${field("Notas", order.payment_notes)}<table style="width:100%;border-collapse:collapse;margin-top:24px"><thead><tr><th style="padding:12px;text-align:left">Produto</th><th>Qtd.</th><th style="text-align:right">Preço</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${itemRows}</tbody></table><p style="text-align:right"><strong>Subtotal: ${euros(order.subtotal ?? order.total)}</strong></p><p style="text-align:right"><strong>Portes: ${euros(order.shipping_total ?? 0)}</strong></p><p style="font-size:22px;text-align:right"><strong>Total: ${euros(order.total)}</strong></p></div></div>`,
      text: [`Nova encomenda ${order.order_number}`, `Data: ${formattedDate}`, `Idioma: ${order.customer_locale ?? "pt"}`, `Nome: ${order.customer_name}`, `Telefone: ${order.phone}`, `Email: ${order.email || "Não indicado"}`, `Entrega: ${order.delivery_method || "A confirmar"}`, `Destino: ${destination || "Não indicado"}`, `Morada: ${address || "Não indicada"}`, `Transportadora: ${order.shipping_carrier || "Não indicada"}`, `Prazo estimado: ${order.shipping_estimate || "Não indicado"}`, `Observações: ${order.delivery_notes || "Sem observações"}`, `Pagamento: ${order.payment_method || "Não indicado"}`, `Estado de pagamento: ${order.payment_status || "Não indicado"}`, `Notas de pagamento: ${order.payment_notes || "Sem notas"}`, "", textItems, "", `Subtotal: ${euros(order.subtotal ?? order.total)}`, `Portes: ${euros(order.shipping_total ?? 0)}`, `Total: ${euros(order.total)}`].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false as const, error: `Resend ${response.status}: ${body.slice(0, 300)}` };
  }

  return { ok: true as const };
}
