"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, Mail, MessageCircle, Printer, Search, X } from "lucide-react";
import {
  resendOrderNotification,
  updateOrderInternalNote,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "@/app/admin/(private)/encomendas/actions";
import { orderStatuses, paymentStatuses, type OrderStatus, type PaymentStatus, type StoreOrder } from "@/types/order";

const money = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
const date = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" });

const statusStyles: Record<string, string> = {
  Pendente: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  Confirmada: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  Enviada: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  "Concluída": "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  Cancelada: "border-rose-300/30 bg-rose-300/10 text-rose-100",
};

const paymentStyles: Record<string, string> = {
  pendente: "border-white/15 bg-white/5 text-white/70",
  "aguardando pagamento": "border-amber-300/30 bg-amber-300/10 text-amber-100",
  pago: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  falhado: "border-rose-300/30 bg-rose-300/10 text-rose-100",
  reembolsado: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  cancelado: "border-rose-300/30 bg-rose-300/10 text-rose-100",
};

function whatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("351") ? digits : digits.length === 9 ? `351${digits}` : digits;
}

function line(label: string, value: string | number | null | undefined) {
  return `${label}: ${value || "-"}`;
}

function orderSummary(order: StoreOrder) {
  return [
    `Encomenda ${order.order_number}`,
    line("Cliente", order.customer_name),
    line("Telefone", order.phone),
    line("Email", order.email),
    line("Idioma", order.customer_locale ?? "pt"),
    line("Criada em", date.format(new Date(order.created_at))),
    line("Estado", order.status),
    line("Pagamento", `${order.payment_method ?? "-"} · ${order.payment_status ?? "-"}`),
    line("Entrega", order.delivery_method),
    line("Destino", [order.delivery_country, order.delivery_region].filter(Boolean).join(" · ")),
    line("Morada", [order.delivery_address, order.delivery_postal_code, order.delivery_city].filter(Boolean).join(", ")),
    line("Transportadora", order.shipping_carrier),
    line("Prazo estimado", order.shipping_estimate),
    line("Observações", order.delivery_notes),
    "",
    "Produtos:",
    ...order.items.map((item) => `${item.quantity} x ${item.name} - ${money.format(item.unit_price)} cada - ${money.format(item.subtotal)}`),
    "",
    line("Subtotal", money.format(order.subtotal ?? order.total)),
    line("Portes", money.format(order.shipping_total ?? 0)),
    line("Total", money.format(order.total)),
  ].join("\n");
}

function whatsappUrl(order: StoreOrder) {
  return `https://wa.me/${whatsappPhone(order.phone)}?text=${encodeURIComponent(`Olá ${order.customer_name}, estamos a contactar sobre a sua encomenda ${order.order_number} na Andrea's Mystery.`)}`;
}

function badge(style: Record<string, string>, value: string | null | undefined) {
  return `inline-flex min-h-7 items-center border px-2.5 text-[11px] font-bold uppercase tracking-[0.16em] ${style[value ?? ""] ?? "border-white/15 bg-white/5 text-white/70"}`;
}

function csvCell(value: string | number | null | undefined) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function Dashboard({ orders }: { orders: StoreOrder[] }) {
  const stats = useMemo(() => {
    const countByStatus = new Map<OrderStatus, number>(orderStatuses.map((item) => [item, 0]));
    for (const order of orders) countByStatus.set(order.status, (countByStatus.get(order.status) ?? 0) + 1);
    const gross = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const active = orders.filter((order) => order.status !== "Cancelada").reduce((sum, order) => sum + Number(order.total || 0), 0);
    return [
      { label: "Total", value: String(orders.length), tone: "text-white" },
      { label: "Pendentes", value: String(countByStatus.get("Pendente") ?? 0), tone: "text-amber-100" },
      { label: "Confirmadas", value: String(countByStatus.get("Confirmada") ?? 0), tone: "text-sky-100" },
      { label: "Enviadas", value: String(countByStatus.get("Enviada") ?? 0), tone: "text-violet-100" },
      { label: "Concluídas", value: String(countByStatus.get("Concluída") ?? 0), tone: "text-emerald-100" },
      { label: "Canceladas", value: String(countByStatus.get("Cancelada") ?? 0), tone: "text-rose-100" },
      { label: "Receita total", value: money.format(gross), tone: "text-[#e4c37d]" },
      { label: "Sem canceladas", value: money.format(active), tone: "text-[#e4c37d]" },
    ];
  }, [orders]);

  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <article key={item.label} className="border border-white/10 bg-white/[.035] p-5 shadow-[0_22px_70px_rgba(0,0,0,.18)]"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">{item.label}</p><strong className={`mt-4 block font-serif text-3xl leading-none ${item.tone}`}>{item.value}</strong></article>)}</div>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="border border-white/10 bg-white/[.025] p-4"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35">{label}</p><div className="mt-2 text-sm text-white/85">{value || "-"}</div></div>;
}

function OrderDrawer({ order, copiedId, pending, noteDraft, onNoteChange, onClose, onCopy, onPrint, onResendEmail, onSaveNote, onStatusChange, onPaymentStatusChange }: {
  order: StoreOrder | null;
  copiedId: number | null;
  pending: boolean;
  noteDraft: string;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onCopy: (order: StoreOrder) => void;
  onPrint: (order: StoreOrder) => void;
  onResendEmail: (order: StoreOrder) => void;
  onSaveNote: (order: StoreOrder) => void;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  onPaymentStatusChange: (orderId: number, status: PaymentStatus) => void;
}) {
  useEffect(() => {
    if (!order) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKeyDown); };
  }, [order, onClose]);

  return <>
    <div className={`fixed inset-0 z-50 bg-black/60 transition ${order ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
    <aside className={`fixed right-0 top-0 z-50 grid h-dvh w-full max-w-3xl grid-rows-[auto_1fr_auto] border-l border-[#c9a45c]/20 bg-[#080806] shadow-[0_0_90px_rgba(0,0,0,.5)] transition duration-300 ${order ? "translate-x-0" : "translate-x-full"}`} aria-label="Detalhes da encomenda" role="dialog" aria-modal="true">
      {order && <>
        <header className="border-b border-white/10 p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.28em] text-[#c9a45c]">Encomenda</p><h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">{order.order_number}</h2><p className="mt-2 text-sm text-white/45">Criada em {date.format(new Date(order.created_at))}</p></div><button type="button" className="grid h-11 w-11 place-items-center border border-white/10 text-white/70" onClick={onClose} aria-label="Fechar detalhes"><X size={20} /></button></div></header>
        <div className="overflow-y-auto p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Nome" value={order.customer_name} /><Info label="Telefone" value={order.phone} /><Info label="Email" value={order.email ?? "Sem email"} />
            <Info label="Idioma" value={order.customer_locale ?? "pt"} /><Info label="Estado" value={<span className={badge(statusStyles, order.status)}>{order.status}</span>} /><Info label="Pagamento" value={<span className={badge(paymentStyles, order.payment_status)}>{order.payment_status ?? "-"}</span>} />
            <Info label="Método de pagamento" value={order.payment_method ?? "-"} /><Info label="Referência" value={order.payment_reference ?? "-"} /><Info label="Pago em" value={order.paid_at ? date.format(new Date(order.paid_at)) : "-"} />
            <Info label="Entrega" value={order.delivery_method ?? "-"} /><Info label="Destino" value={[order.delivery_country, order.delivery_region].filter(Boolean).join(" · ")} /><Info label="Transportadora" value={order.shipping_carrier ?? "-"} />
            <Info label="Prazo estimado" value={order.shipping_estimate ?? "-"} /><Info label="Data de criação" value={date.format(new Date(order.created_at))} /><Info label="Última atualização" value={date.format(new Date(order.updated_at))} />
            <Info label="Estado do email" value={order.email_sent_at ? "Enviado" : order.notification_error ? "Erro" : "Ainda não enviado"} /><Info label="Envio do email" value={order.email_sent_at ? date.format(new Date(order.email_sent_at)) : "Sem registo"} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2"><Info label="Morada" value={[order.delivery_address, order.delivery_postal_code, order.delivery_city].filter(Boolean).join(", ")} /><Info label="Observações do cliente" value={order.delivery_notes ?? "-"} /></div>
          {order.notification_error && <p className="mt-5 border border-amber-300/20 bg-amber-300/10 p-4 text-xs text-amber-100">Erro de notificação: {order.notification_error}</p>}
          <div className="mt-7 border border-white/10"><div className="grid grid-cols-[1fr_80px_110px_110px] gap-3 border-b border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 max-sm:hidden"><span>Produto</span><span>Qtd.</span><span>Unitário</span><span className="text-right">Subtotal</span></div><div className="divide-y divide-white/10">{order.items.map((item) => <div key={`${item.stable_id}-${item.sku}`} className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[1fr_80px_110px_110px] sm:items-center"><div><strong className="block font-serif text-lg text-white">{item.name}</strong><small className="text-white/35">{item.sku ?? item.stable_id}</small></div><span className="text-white/70">{item.quantity}</span><span className="text-white/70">{money.format(item.unit_price)}</span><strong className="text-right font-serif text-lg text-[#e4c37d] max-sm:text-left">{money.format(item.subtotal)}</strong></div>)}</div></div>
          <div className="mt-6 grid gap-2 border-t border-[#c9a45c]/20 pt-5 text-sm"><div className="flex items-center justify-between"><span className="text-white/45">Subtotal</span><strong>{money.format(order.subtotal ?? order.total)}</strong></div><div className="flex items-center justify-between"><span className="text-white/45">Portes</span><strong>{money.format(order.shipping_total ?? 0)}</strong></div><div className="flex items-center justify-between font-serif text-3xl text-[#e4c37d]"><span>Total</span><strong>{money.format(order.total)}</strong></div></div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2"><label><span className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Estado logístico</span><select value={order.status} disabled={pending} onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)} className="mt-3 min-h-12 w-full border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]">{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label><span className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Estado de pagamento</span><select value={order.payment_status ?? "aguardando pagamento"} disabled={pending} onChange={(event) => onPaymentStatusChange(order.id, event.target.value as PaymentStatus)} className="mt-3 min-h-12 w-full border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]">{paymentStatuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="sm:col-span-2"><span className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Nota interna</span><textarea value={noteDraft} onChange={(event) => onNoteChange(event.target.value)} rows={4} maxLength={2000} className="mt-3 w-full border border-white/15 bg-black p-4 text-white outline-none focus:border-[#c9a45c]" placeholder="Nota visível apenas no admin" /></label></div>
          <button type="button" disabled={pending} onClick={() => onSaveNote(order)} className="mt-3 min-h-11 border border-[#c9a45c]/40 px-4 text-sm font-bold text-[#e4c37d] transition hover:bg-[#c9a45c] hover:text-black disabled:opacity-50">Guardar nota interna</button>
          <div className="mt-8"><h3 className="font-serif text-2xl text-white">Histórico de estados</h3><div className="mt-4 grid gap-3 border-l border-[#c9a45c]/25 pl-4">{(order.order_status_history ?? []).length > 0 ? [...(order.order_status_history ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((entry) => <div key={entry.id} className="relative text-sm text-white/65 before:absolute before:-left-[21px] before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-[#c9a45c]"><strong className="text-white">{entry.previous_status ?? "Sem estado"} → {entry.new_status}</strong><span className="block text-xs text-white/40">{date.format(new Date(entry.created_at))}{entry.changed_by ? ` · ${entry.changed_by}` : ""}</span></div>) : <p className="text-sm text-white/40">Ainda não existe histórico registado.</p>}</div></div>
        </div>
        <footer className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-4 sm:p-7"><a href={whatsappUrl(order)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 border border-emerald-300/35 px-4 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300 hover:text-black"><MessageCircle size={17} /> WhatsApp</a><button type="button" onClick={() => onCopy(order)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-4 text-sm font-bold text-white/75 transition hover:border-[#c9a45c] hover:text-[#e4c37d]">{copiedId === order.id ? <Check size={17} /> : <Copy size={17} />}{copiedId === order.id ? "Copiado" : "Copiar"}</button><button type="button" onClick={() => onPrint(order)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-4 text-sm font-bold text-white/75 transition hover:border-[#c9a45c] hover:text-[#e4c37d]"><Printer size={17} /> Imprimir</button><button type="button" disabled={pending} onClick={() => onResendEmail(order)} className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/15 px-4 text-sm font-bold text-white/75 transition hover:border-[#c9a45c] hover:text-[#e4c37d] disabled:opacity-50"><Mail size={17} /> Reenviar email</button></footer>
      </>}
    </aside>
  </>;
}

export function AdminOrders({ orders }: { orders: StoreOrder[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [region, setRegion] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  useEffect(() => { setNoteDraft(selectedOrder?.internal_note ?? ""); }, [selectedOrder]);

  const paymentMethods = useMemo(() => [...new Set(orders.map((order) => order.payment_method).filter(Boolean))] as string[], [orders]);
  const regions = useMemo(() => [...new Set(orders.map((order) => order.delivery_region || order.delivery_country).filter(Boolean))] as string[], [orders]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-PT");
    const min = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const max = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
    return orders.filter((order) => {
      const created = new Date(order.created_at).getTime();
      const haystack = [order.order_number, order.customer_name, order.phone, order.email, order.delivery_country, order.delivery_city, order.payment_method].filter(Boolean);
      return (status === "all" || order.status === status) && (paymentStatus === "all" || order.payment_status === paymentStatus) && (paymentMethod === "all" || order.payment_method === paymentMethod) && (region === "all" || order.delivery_region === region || order.delivery_country === region) && (min === null || created >= min) && (max === null || created <= max) && (!needle || haystack.some((value) => String(value).toLocaleLowerCase("pt-PT").includes(needle)));
    });
  }, [orders, query, status, paymentStatus, paymentMethod, region, startDate, endDate]);

  function resetFilters() { setQuery(""); setStatus("all"); setPaymentStatus("all"); setPaymentMethod("all"); setRegion("all"); setStartDate(""); setEndDate(""); }
  function changeStatus(orderId: number, nextStatus: OrderStatus) { if (nextStatus === "Cancelada" && !window.confirm("Tem a certeza que pretende cancelar esta encomenda?")) return; setMessage(""); startTransition(async () => { const result = await updateOrderStatus(orderId, nextStatus); setMessage(result.message); if (result.ok) router.refresh(); }); }
  function changePaymentStatus(orderId: number, nextStatus: PaymentStatus) { if (nextStatus === "cancelado" && !window.confirm("Tem a certeza que pretende cancelar o estado de pagamento?")) return; setMessage(""); startTransition(async () => { const result = await updateOrderPaymentStatus(orderId, nextStatus); setMessage(result.message); if (result.ok) router.refresh(); }); }
  function saveNote(order: StoreOrder) { setMessage(""); startTransition(async () => { const result = await updateOrderInternalNote(order.id, noteDraft); setMessage(result.message); if (result.ok) router.refresh(); }); }
  function resendEmail(order: StoreOrder) { setMessage(""); startTransition(async () => { const result = await resendOrderNotification(order.id); setMessage(result.message); if (result.ok) router.refresh(); }); }
  async function copy(order: StoreOrder) { try { await navigator.clipboard.writeText(orderSummary(order)); setCopiedId(order.id); window.setTimeout(() => setCopiedId(null), 1800); } catch { setMessage("Não foi possível copiar o resumo."); } }
  function print(order: StoreOrder) { const printWindow = window.open("", "_blank", "width=760,height=900"); if (!printWindow) return setMessage("Não foi possível abrir a janela de impressão."); printWindow.document.body.style.fontFamily = "Georgia, serif"; printWindow.document.body.style.padding = "32px"; const title = printWindow.document.createElement("h1"); title.textContent = `Andrea's Mystery - ${order.order_number}`; const pre = printWindow.document.createElement("pre"); pre.textContent = orderSummary(order); pre.style.whiteSpace = "pre-wrap"; pre.style.font = "16px/1.6 Georgia, serif"; printWindow.document.body.append(title, pre); printWindow.focus(); printWindow.print(); }
  function exportCsv() { const rows = [["Número", "Data", "Cliente", "Telefone", "Email", "Idioma", "Estado", "Pagamento", "Estado pagamento", "Destino", "Envio", "Portes", "Produtos", "Subtotal", "Total"]]; for (const order of filtered) rows.push([order.order_number, date.format(new Date(order.created_at)), order.customer_name, order.phone, order.email ?? "", order.customer_locale ?? "pt", order.status, order.payment_method ?? "", order.payment_status ?? "", [order.delivery_country, order.delivery_city].filter(Boolean).join(" - "), order.delivery_method ?? "", money.format(order.shipping_total ?? 0), order.items.map((item) => `${item.quantity} x ${item.name}`).join("; "), money.format(order.subtotal ?? order.total), money.format(order.total)]); const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`; const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `encomendas-andreas-mystery-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url); }

  return <div className="mt-8"><Dashboard orders={orders} />
    <div className="mt-8 grid gap-3 border border-white/10 bg-white/[.03] p-4 lg:grid-cols-[1fr_160px_170px_170px_150px] xl:grid-cols-[1fr_150px_170px_170px_140px_150px_150px_auto]">
      <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} /><span className="sr-only">Pesquisar encomendas</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Número, nome, telefone, email ou destino" className="min-h-12 w-full border border-white/15 bg-black pl-12 pr-4 text-white outline-none focus:border-[#c9a45c]" /></label>
      <select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]"><option value="all">Estados</option>{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Filtrar por pagamento" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]"><option value="all">Estado pagamento</option>{paymentStatuses.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Filtrar por método de pagamento" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]"><option value="all">Pagamento</option>{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Filtrar por região" value={region} onChange={(event) => setRegion(event.target.value)} className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]"><option value="all">Região</option>{regions.map((item) => <option key={item}>{item}</option>)}</select>
      <input aria-label="Data inicial" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]" />
      <input aria-label="Data final" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="min-h-12 border border-white/15 bg-black px-4 text-white outline-none focus:border-[#c9a45c]" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-1"><button type="button" onClick={resetFilters} className="min-h-12 border border-white/15 px-4 text-sm font-bold text-white/70 transition hover:border-[#c9a45c] hover:text-[#e4c37d]">Limpar</button><button type="button" onClick={exportCsv} className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#c9a45c]/40 px-4 text-sm font-bold text-[#e4c37d] transition hover:bg-[#c9a45c] hover:text-black"><Download size={16} /> CSV</button></div>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><strong>{filtered.length} encomenda{filtered.length === 1 ? "" : "s"}</strong><p aria-live="polite" className="min-h-6 text-sm text-[#e4c37d]">{pending ? "A atualizar..." : message}</p></div>
    <div className="mt-4 overflow-hidden border border-white/10 bg-[#0d0d0d] max-lg:hidden"><table className="w-full border-collapse text-left text-sm"><thead className="bg-white/[.035] text-[11px] font-bold uppercase tracking-[0.18em] text-white/45"><tr><th className="px-5 py-4">Encomenda</th><th className="px-5 py-4">Cliente</th><th className="px-5 py-4">Destino</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Pagamento</th><th className="px-5 py-4 text-right">Total</th><th className="px-5 py-4">Alterar</th></tr></thead><tbody className="divide-y divide-white/10">{filtered.map((order) => <tr key={order.id} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") setSelectedOrderId(order.id); }} onClick={() => setSelectedOrderId(order.id)} className="cursor-pointer transition hover:bg-white/[.045] focus:bg-white/[.045]"><td className="px-5 py-5"><strong className="font-serif text-xl text-white">{order.order_number}</strong><small className="block text-white/40">{date.format(new Date(order.created_at))}</small></td><td className="px-5 py-5"><span className="block text-white/85">{order.customer_name}</span><small className="text-white/40">{order.phone}{order.email ? ` · ${order.email}` : ""}</small></td><td className="px-5 py-5 text-white/55">{order.delivery_country ?? "-"}<small className="block">{order.delivery_city ?? order.delivery_region ?? ""}</small></td><td className="px-5 py-5"><span className={badge(statusStyles, order.status)}>{order.status}</span></td><td className="px-5 py-5"><span className={badge(paymentStyles, order.payment_status)}>{order.payment_status ?? "-"}</span><small className="mt-1 block text-white/40">{order.payment_method ?? ""}</small></td><td className="px-5 py-5 text-right font-serif text-xl text-[#e4c37d]">{money.format(order.total)}</td><td className="px-5 py-5" onClick={(event) => event.stopPropagation()}><select aria-label={`Estado da encomenda ${order.order_number}`} value={order.status} disabled={pending} onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)} className="min-h-11 border border-white/15 bg-black px-3 text-white outline-none focus:border-[#c9a45c]">{orderStatuses.map((item) => <option key={item}>{item}</option>)}</select></td></tr>)}</tbody></table></div>
    <div className="mt-4 grid gap-4 lg:hidden">{filtered.map((order) => <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} className="border border-white/10 bg-[#0d0d0d] p-5 text-left"><div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-2xl text-white">{order.order_number}</h2><p className="mt-2 text-sm text-white/65">{order.customer_name}</p><p className="mt-1 text-xs text-white/40">{date.format(new Date(order.created_at))}</p></div><strong className="font-serif text-2xl text-[#e4c37d]">{money.format(order.total)}</strong></div><div className="mt-4 flex flex-wrap items-center gap-3"><span className={badge(statusStyles, order.status)}>{order.status}</span><span className={badge(paymentStyles, order.payment_status)}>{order.payment_status ?? "-"}</span><span className="text-xs text-white/45">{order.delivery_country ?? order.delivery_method ?? "-"}</span></div></button>)}</div>
    {filtered.length === 0 && <p className="mt-4 border border-white/10 p-10 text-center text-white/50">Nenhuma encomenda encontrada.</p>}
    <OrderDrawer order={selectedOrder} copiedId={copiedId} pending={pending} noteDraft={noteDraft} onNoteChange={setNoteDraft} onClose={() => setSelectedOrderId(null)} onCopy={copy} onPrint={print} onResendEmail={resendEmail} onSaveNote={saveNote} onStatusChange={changeStatus} onPaymentStatusChange={changePaymentStatus} />
  </div>;
}
