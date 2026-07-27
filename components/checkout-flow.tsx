"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { upcomingEventPresences } from "@/data/events";
import { pickupSalesLocations } from "@/data/sales-locations";
import { storeSettings } from "@/data/store-settings";
import { useStore } from "@/hooks/use-store";
import {
  calculateOrderTotals,
  createOrderNumber,
  type CustomerDetails,
  type DeliverySelection,
  validateCustomer,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
} from "@/lib/orders/build-whatsapp-order-message";

const steps = ["Carrinho", "Dados do cliente", "Entrega", "Revisão", "Finalização"];
const emptyCustomer: CustomerDetails = {
  name: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  locality: "",
  district: "",
  notes: "",
};
const checkoutFields = [
  { key: "name", label: "Nome completo", type: "text", autoComplete: "name" },
  { key: "email", label: "Email", type: "email", autoComplete: "email" },
  { key: "phone", label: "Telefone", type: "tel", autoComplete: "tel" },
  { key: "address", label: "Morada", type: "text", autoComplete: "street-address", wide: true },
  { key: "postalCode", label: "Código postal", type: "text", autoComplete: "postal-code" },
  { key: "locality", label: "Localidade", type: "text", autoComplete: "address-level2" },
  { key: "district", label: "Distrito (opcional)", type: "text", autoComplete: "address-level1" },
] as const;

export function CheckoutFlow() {
  const { addToCart, cart, cartNotice, clearCart, decreaseCartQuantity, removeFromCart } = useStore();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [delivery, setDelivery] = useState<DeliverySelection>({ method: "shipping" });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [preparedUrl, setPreparedUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const processingRef = useRef(false);

  const pickupEvents = upcomingEventPresences.filter((event) => event.allowsPickup);
  const shippingPrice = delivery.method === "shipping" ? storeSettings.shippingPrice : 0;
  const totals = useMemo(() => calculateOrderTotals(cart, shippingPrice), [cart, shippingPrice]);
  const whatsappConfigured = /^\d{8,15}$/.test(storeSettings.whatsappNumber);

  const deliveryIsValid =
    delivery.method === "shipping" ||
    (delivery.method === "location-pickup" &&
      pickupSalesLocations.some((location) => location.id === delivery.locationId)) ||
    (delivery.method === "event-pickup" && pickupEvents.some((event) => event.id === delivery.eventId));

  const deliveryLabel =
    delivery.method === "shipping"
      ? "Envio para morada"
      : delivery.method === "location-pickup"
        ? `Levantamento em ${pickupSalesLocations.find((item) => item.id === delivery.locationId)?.name ?? ""}`
        : `Levantamento no evento ${pickupEvents.find((item) => item.id === delivery.eventId)?.name ?? ""}`;

  const updateCustomer = (field: keyof CustomerDetails, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const focusFirstError = (nextErrors: Partial<Record<keyof CustomerDetails, string>>) => {
    const first = checkoutFields.find((field) => nextErrors[field.key]);
    window.setTimeout(() => document.getElementById(`checkout-${first?.key}`)?.focus(), 0);
  };

  const next = () => {
    if (step === 0 && cart.length === 0) return;
    if (step === 1) {
      const nextErrors = validateCustomer(customer, false);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        focusFirstError(nextErrors);
        return;
      }
    }
    if (step === 2) {
      if (!deliveryIsValid) {
        setSubmitError("Seleciona um método e um local de levantamento válido.");
        return;
      }
      const nextErrors = validateCustomer(customer, delivery.method === "shipping");
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        setStep(1);
        focusFirstError(nextErrors);
        return;
      }
    }
    setSubmitError("");
    setStep((current) => Math.min(steps.length - 1, current + 1));
  };

  const finalizeOrder = () => {
    if (processingRef.current || !confirmed || !whatsappConfigured || cart.length === 0 || !deliveryIsValid) return;
    const nextErrors = validateCustomer(customer, delivery.method === "shipping");
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStep(1);
      focusFirstError(nextErrors);
      return;
    }

    processingRef.current = true;
    setProcessing(true);
    setSubmitError("");
    const stableOrderNumber = orderNumber || createOrderNumber();
    const message = buildWhatsAppOrderMessage({
      orderNumber: stableOrderNumber,
      cart,
      customer,
      delivery,
      deliveryLabel,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    });
    const url = buildWhatsAppOrderUrl(storeSettings.whatsappNumber, message);
    if (!url) {
      setSubmitError("O número de WhatsApp da loja ainda não está configurado.");
      setProcessing(false);
      processingRef.current = false;
      return;
    }

    setOrderNumber(stableOrderNumber);
    setPreparedUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
    setStep(4);
    setProcessing(false);
    window.setTimeout(() => {
      processingRef.current = false;
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <ol className="grid grid-cols-2 gap-2 border-y border-champagne/25 py-5 text-xs font-bold uppercase tracking-[0.12em] sm:grid-cols-5">
        {steps.map((label, index) => (
          <li key={label} className={index === step ? "text-champagne" : "text-smoke"}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 border border-champagne/25 bg-pearl p-5 md:p-10">
        {step === 0 && (
          <section aria-labelledby="checkout-cart-title">
            <h2 id="checkout-cart-title" className="font-serif text-4xl">O teu carrinho</h2>
            {cartNotice && <p role="status" className="mt-5 border border-champagne/30 p-4 text-sm text-gold-light">{cartNotice}</p>}
            {cart.length === 0 ? (
              <p className="mt-6 font-serif text-lg text-smoke">O carrinho está vazio.</p>
            ) : (
              <div className="mt-7 grid gap-5">
                {cart.map((item) => (
                  <article key={`${item.stableId}-${item.variantId ?? "default"}`} className="grid grid-cols-[72px_1fr] gap-4 border-b border-champagne/20 pb-5 sm:grid-cols-[88px_1fr_auto]">
                    <div className="relative aspect-square overflow-hidden bg-porcelain">
                      <Image src={item.capa} alt="" fill sizes="88px" className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl">{item.nome}</h3>
                      <p className="mt-1 text-xs text-smoke">Referência: {item.sku ?? item.stableId}</p>
                      <p className="mt-2 text-sm text-smoke">Preço unitário: {formatPrice(item.price)}</p>
                      <div className="mt-3 flex items-center gap-1">
                        <button className="grid h-11 w-11 place-items-center border border-champagne/30" type="button" onClick={() => decreaseCartQuantity(item.id, item.variantId)} aria-label={`Diminuir quantidade de ${item.nome}`}><Minus size={15} /></button>
                        <span className="grid h-11 min-w-11 place-items-center">{item.quantity}</span>
                        <button className="grid h-11 w-11 place-items-center border border-champagne/30" type="button" onClick={() => addToCart(item, 1, item.variantId)} aria-label={`Aumentar quantidade de ${item.nome}`}><Plus size={15} /></button>
                        <button className="ml-2 grid h-11 w-11 place-items-center text-velvet" type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remover ${item.nome}`}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <strong className="col-start-2 font-serif text-xl text-velvet sm:col-start-3">{formatPrice(item.price * item.quantity)}</strong>
                  </article>
                ))}
                <div className="flex justify-between font-serif text-xl"><span>Subtotal</span><strong>{formatPrice(totals.subtotal)}</strong></div>
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="customer-title">
            <h2 id="customer-title" className="font-serif text-4xl">Dados do cliente</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {checkoutFields.map((field) => (
                <label key={field.key} className={"wide" in field && field.wide ? "md:col-span-2" : ""} htmlFor={`checkout-${field.key}`}>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{field.label}</span>
                  <input
                    id={`checkout-${field.key}`}
                    type={field.type}
                    inputMode={field.key === "phone" ? "tel" : field.key === "postalCode" ? "numeric" : field.key === "email" ? "email" : undefined}
                    autoComplete={field.autoComplete}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={errors[field.key] ? `checkout-${field.key}-error` : undefined}
                    className="min-h-12 w-full border border-champagne/35 bg-porcelain px-4 outline-none focus:border-champagne"
                    value={customer[field.key]}
                    onChange={(event) => updateCustomer(field.key, event.target.value)}
                  />
                  {errors[field.key] && <span id={`checkout-${field.key}-error`} role="alert" className="mt-2 block text-sm text-velvet">{errors[field.key]}</span>}
                </label>
              ))}
              <label className="md:col-span-2" htmlFor="checkout-notes">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">Observações (opcional)</span>
                <textarea id="checkout-notes" maxLength={500} className="min-h-28 w-full border border-champagne/35 bg-porcelain p-4 outline-none focus:border-champagne" value={customer.notes} onChange={(event) => updateCustomer("notes", event.target.value)} />
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="delivery-title">
            <h2 id="delivery-title" className="font-serif text-4xl">Entrega ou levantamento</h2>
            <div className="mt-7 grid gap-4">
              {storeSettings.activeDeliveryMethods.shipping && (
                <label className="flex min-h-16 gap-3 border border-champagne/25 p-5">
                  <input type="radio" name="delivery" checked={delivery.method === "shipping"} onChange={() => setDelivery({ method: "shipping" })} />
                  <span><strong className="font-serif text-lg">Envio para morada</strong><small className="mt-1 block text-sm text-smoke">{storeSettings.shippingPrice === null ? "Portes a confirmar" : formatPrice(storeSettings.shippingPrice)}{storeSettings.shippingEstimate ? ` · ${storeSettings.shippingEstimate}` : ""}</small></span>
                </label>
              )}
              {storeSettings.activeDeliveryMethods.locationPickup && pickupSalesLocations.map((location) => (
                <label key={location.id} className="flex min-h-16 gap-3 border border-champagne/25 p-5">
                  <input type="radio" name="delivery" checked={delivery.method === "location-pickup" && delivery.locationId === location.id} onChange={() => setDelivery({ method: "location-pickup", locationId: location.id })} />
                  <span><strong className="font-serif text-lg">Levantamento — {location.name}</strong><small className="mt-1 block text-sm leading-relaxed text-smoke">{location.address}, {location.postalCode} {location.locality}{location.schedule ? ` · ${location.schedule}` : ""}</small></span>
                </label>
              ))}
              {storeSettings.activeDeliveryMethods.eventPickup && pickupEvents.map((event) => (
                <label key={event.id} className="flex min-h-16 gap-3 border border-champagne/25 p-5">
                  <input type="radio" name="delivery" checked={delivery.method === "event-pickup" && delivery.eventId === event.id} onChange={() => setDelivery({ method: "event-pickup", eventId: event.id })} />
                  <span><strong className="font-serif text-lg">Levantamento — {event.name}</strong><small className="mt-1 block text-sm text-smoke">{event.location}{event.schedule ? ` · ${event.schedule}` : ""}</small></span>
                </label>
              ))}
            </div>
            {submitError && <p role="alert" className="mt-4 text-sm text-velvet">{submitError}</p>}
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="review-title">
            <h2 id="review-title" className="font-serif text-4xl">Revisão da encomenda</h2>
            <div className="mt-7 grid gap-3 text-sm sm:text-base">
              {cart.map((item) => <div key={item.stableId} className="grid grid-cols-[1fr_auto] gap-4 border-b border-champagne/15 pb-3"><span>{item.quantity} × {item.nome}<small className="block text-sm text-smoke">{formatPrice(item.price)} por unidade</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}
              <div className="mt-3 flex justify-between"><span>Subtotal</span><strong>{formatPrice(totals.subtotal)}</strong></div>
              <div className="flex justify-between"><span>Portes</span><strong>{totals.shipping === null ? "A confirmar" : formatPrice(totals.shipping)}</strong></div>
              <div className="flex justify-between text-xl text-velvet"><span>Total</span><strong>{totals.total === null ? "A confirmar" : formatPrice(totals.total)}</strong></div>
            </div>
            <div className="mt-8 grid gap-4 border-y border-champagne/20 py-6 text-sm leading-relaxed">
              <p><strong>Cliente:</strong> {customer.name} · {customer.phone} · {customer.email}</p>
              <p><strong>Entrega:</strong> {deliveryLabel}</p>
              {delivery.method === "shipping" && <p><strong>Morada:</strong> {customer.address}, {customer.postalCode} {customer.locality}{customer.district ? `, ${customer.district}` : ""}</p>}
              {customer.notes && <p><strong>Observações:</strong> {customer.notes}</p>}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="ghost-button" type="button" onClick={() => setStep(0)}>Editar carrinho</button>
              <button className="ghost-button" type="button" onClick={() => setStep(1)}>Editar dados</button>
              <button className="ghost-button" type="button" onClick={() => setStep(2)}>Editar entrega</button>
            </div>
            <label className="mt-7 flex min-h-12 items-start gap-3 border border-champagne/25 p-4">
              <input className="mt-1 h-5 w-5" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              <span>Confirmo que os dados da encomenda estão corretos.</span>
            </label>
            <p className="mt-5 text-sm leading-relaxed text-smoke">Os dados introduzidos serão usados apenas para processar esta encomenda.</p>
            <p className="mt-2 text-sm leading-relaxed text-smoke">Disponibilidade e preços foram novamente confirmados com o catálogo publicado atual.</p>
            {!whatsappConfigured && <p role="status" className="mt-4 border border-champagne/30 p-4 text-sm text-gold-light">O WhatsApp da loja ainda não está configurado. Adiciona o número internacional em <code>data/store-settings.ts</code>.</p>}
            {submitError && <p role="alert" className="mt-4 text-sm text-velvet">{submitError}</p>}
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="confirmation-title">
            <p className="eyebrow">A aguardar confirmação</p>
            <h2 id="confirmation-title" className="mt-4 font-serif text-4xl">Encomenda preparada</h2>
            <p className="mt-3 font-serif text-xl text-velvet">N.º {orderNumber}</p>
            <p className="mt-6 font-serif text-lg leading-relaxed text-smoke">A sua encomenda foi preparada e o WhatsApp foi aberto. Envie a mensagem para que possamos confirmar disponibilidade, entrega e pagamento.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="premium-button" href={preparedUrl} target="_blank" rel="noopener noreferrer">Abrir novamente o WhatsApp</a>
              <Link className="ghost-button" href="/#colecao">Continuar a comprar</Link>
              <button className="ghost-button" type="button" onClick={() => { clearCart(); setStep(0); }}>Limpar carrinho</button>
            </div>
          </section>
        )}

        {step < 3 && (
          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-champagne/20 pt-6">
            {step > 0 ? <button className="ghost-button" type="button" onClick={() => setStep((current) => current - 1)}>Voltar</button> : <span />}
            <button className="premium-button" type="button" disabled={step === 0 && cart.length === 0} onClick={next}>Continuar</button>
          </div>
        )}
        {step === 3 && (
          <button className="premium-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto" type="button" disabled={processing || !confirmed || !whatsappConfigured || cart.length === 0 || !deliveryIsValid} onClick={finalizeOrder}>
            {processing ? "A preparar encomenda…" : "Finalizar encomenda no WhatsApp"}
          </button>
        )}
      </div>
    </div>
  );
}
