"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, MessageCircle, Search } from "lucide-react";
import { updateOrderStatus } from "@/app/admin/(private)/encomendas/actions";
import { orderStatuses, type StoreOrder, type OrderStatus } from "@/types/order";

const money = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
const date = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" });

function whatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("351") ? digits : digits.length === 9 ? `351${digits}` : digits;
}

function orderSummary(order: StoreOrder) {
  return [
    `Encomenda ${order.order_number}`,
    `Cliente: ${order.customer_name}`,
    `Telefone: ${order.phone}`,
    ...(order.email ? [`Email: ${order.email}`] : []),
    "",
    ...order.items.map(
      (item) => `${item.quantity} × ${item.name} — ${money.format(item.unit_price)} — ${money.format(item.subtotal)}`
    ),
    "",
    `Total: ${money.format(order.total)}`,
    `Estado: ${order.status}`,
  ].join("\n");
}

export function AdminOrders({ orders }: { orders: StoreOrder[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-PT");
    return orders.filter(
      (order) =>
        (status === "all" || order.status === status) &&
        (!needle ||
          [order.order_number, order.customer_name, order.phone, order.email]
            .filter(Boolean)
            .some((value) => String(value).toLocaleLowerCase("pt-PT").includes(needle)))
    );
  }, [orders, query, status]);

  function changeStatus(orderId: number, nextStatus: OrderStatus) {
    setMessage("");
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      setMessage(result.message);
      if (result.ok) router.refresh();
    });
  }

  async function copy(order: StoreOrder) {
    try {
      await navigator.clipboard.writeText(orderSummary(order));
      setCopiedId(order.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setMessage("Não foi possível copiar o resumo.");
    }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-3 border border-white/10 bg-white/[.03] p-4 md:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
          <span className="sr-only">Pesquisar encomendas</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cliente, telefone, email ou número da encomenda"
            className="min-h-12 w-full border border-white/15 bg-black pl-12 pr-4 text-white outline-none focus:border-[#c9a45c]"
          />
        </label>
        <select
          aria-label="Filtrar por estado"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]"
        >
          <option value="all">Todos os estados</option>
          {orderStatuses.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <strong>{filtered.length} encomenda{filtered.length === 1 ? "" : "s"}</strong>
        <p aria-live="polite" className="min-h-6 text-sm text-[#e4c37d]">{pending ? "A atualizar…" : message}</p>
      </div>

      <div className="mt-4 grid gap-4">
        {filtered.map((order) => {
          const whatsappUrl = `https://wa.me/${whatsappPhone(order.phone)}?text=${encodeURIComponent(
            `Olá ${order.customer_name}, estamos a contactar sobre a sua encomenda ${order.order_number} na Andrea's Mystery.`
          )}`;

          return (
            <article key={order.id} className="border border-white/10 bg-[#0d0d0d]">
              <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-2xl text-white">{order.order_number}</h2>
                    <span className="border border-[#c9a45c]/30 px-2 py-1 text-xs text-[#e4c37d]">{order.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/65">{order.customer_name} · {order.phone}{order.email ? ` · ${order.email}` : ""}</p>
                  <p className="mt-1 text-xs text-white/40">{date.format(new Date(order.created_at))} · {order.items.length} produto{order.items.length === 1 ? "" : "s"}</p>
                </div>
                <strong className="font-serif text-2xl text-[#e4c37d]">{money.format(order.total)}</strong>
                <select
                  aria-label={`Estado da encomenda ${order.order_number}`}
                  value={order.status}
                  disabled={pending}
                  onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)}
                  className="min-h-11 border border-white/15 bg-black px-3 text-white outline-none focus:border-[#c9a45c]"
                >
                  {orderStatuses.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              <details className="border-t border-white/10">
                <summary className="cursor-pointer px-5 py-4 text-sm font-bold uppercase tracking-[.14em] text-white/70">
                  Ver detalhes
                </summary>
                <div className="grid gap-5 border-t border-white/10 p-5 lg:grid-cols-[1fr_auto]">
                  <div className="grid gap-3">
                    {order.items.map((item) => (
                      <div key={`${item.stable_id}-${item.sku}`} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 pb-3 text-sm">
                        <span>{item.quantity} × {item.name}<small className="block text-white/40">{item.sku ?? item.stable_id} · {money.format(item.unit_price)} por unidade</small></span>
                        <strong>{money.format(item.subtotal)}</strong>
                      </div>
                    ))}
                    {order.notification_error && <p className="text-xs text-amber-200">Aviso de email: {order.notification_error}</p>}
                    {order.email_sent_at && <p className="text-xs text-emerald-300">Notificação enviada em {date.format(new Date(order.email_sent_at))}</p>}
                  </div>
                  <div className="flex flex-wrap content-start gap-2">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 border border-emerald-300/40 px-4 text-sm text-emerald-200">
                      <MessageCircle size={17} /> Abrir WhatsApp
                    </a>
                    <button type="button" onClick={() => copy(order)} className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 text-sm text-white/75">
                      {copiedId === order.id ? <Check size={17} /> : <Copy size={17} />}
                      {copiedId === order.id ? "Copiado" : "Copiar resumo"}
                    </button>
                  </div>
                </div>
              </details>
            </article>
          );
        })}
        {filtered.length === 0 && <p className="border border-white/10 p-10 text-center text-white/50">Nenhuma encomenda encontrada.</p>}
      </div>
    </div>
  );
}
