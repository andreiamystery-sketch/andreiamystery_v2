import "server-only";

import type { StoreOrder } from "@/types/order";

const recipient = "andreiamystery@gmail.com";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[
        character
      ] ?? character
  );
}

function euros(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export async function sendOrderNotification(order: StoreOrder) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return {
      ok: false as const,
      error: "RESEND_API_KEY ou RESEND_FROM_EMAIL não configurado.",
    };
  }

  const date = new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Lisbon",
  }).format(new Date(order.created_at));
  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eadfca">${escapeHtml(item.name)}</td>
          <td style="padding:12px;border-bottom:1px solid #eadfca;text-align:center">${item.quantity}</td>
          <td style="padding:12px;border-bottom:1px solid #eadfca;text-align:right">${euros(item.unit_price)}</td>
          <td style="padding:12px;border-bottom:1px solid #eadfca;text-align:right">${euros(item.subtotal)}</td>
        </tr>`
    )
    .join("");
  const textItems = order.items
    .map(
      (item) =>
        `${item.quantity} × ${item.name} — ${euros(item.unit_price)} — ${euros(item.subtotal)}`
    )
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `order-notification/${order.order_number}`,
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: order.email || undefined,
      subject: `Nova encomenda ${order.order_number} — ${order.customer_name}`,
      html: `
        <div style="background:#f6f1e8;padding:32px;font-family:Arial,sans-serif;color:#241d17">
          <div style="max-width:720px;margin:auto;background:#fff;padding:32px;border:1px solid #d9c39a">
            <p style="letter-spacing:.18em;text-transform:uppercase;color:#9a7634">Andrea's Mystery</p>
            <h1 style="font-family:Georgia,serif;font-size:32px">Nova encomenda</h1>
            <p><strong>Número:</strong> ${escapeHtml(order.order_number)}</p>
            <p><strong>Data:</strong> ${escapeHtml(date)}</p>
            <p><strong>Nome:</strong> ${escapeHtml(order.customer_name)}</p>
            <p><strong>Telefone:</strong> ${escapeHtml(order.phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(order.email || "Não indicado")}</p>
            <table style="width:100%;border-collapse:collapse;margin-top:24px">
              <thead><tr><th style="padding:12px;text-align:left">Produto</th><th>Qtd.</th><th style="text-align:right">Preço</th><th style="text-align:right">Subtotal</th></tr></thead>
              <tbody>${itemRows}</tbody>
            </table>
            <p style="font-size:22px;text-align:right"><strong>Total: ${euros(order.total)}</strong></p>
          </div>
        </div>`,
      text: [
        `Nova encomenda ${order.order_number}`,
        `Data: ${date}`,
        `Nome: ${order.customer_name}`,
        `Telefone: ${order.phone}`,
        `Email: ${order.email || "Não indicado"}`,
        "",
        textItems,
        "",
        `Total: ${euros(order.total)}`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false as const,
      error: `Resend ${response.status}: ${body.slice(0, 300)}`,
    };
  }

  return { ok: true as const };
}
