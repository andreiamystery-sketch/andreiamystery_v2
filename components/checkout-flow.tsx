"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createCheckoutOrder } from "@/app/checkout/actions";
import { useI18n } from "@/components/i18n/i18n-provider";
import { getEnabledPaymentMethods, getStripeCheckoutPaymentMethod, paymentConfig } from "@/config/payments";
import { shippingConfig } from "@/config/shipping";
import { useStore } from "@/hooks/use-store";
import { calculateOrderTotals, getDeliveryShipping, type CustomerDetails, type DeliveryDetails, type PaymentDetails, validateCustomer, validateDelivery, validatePayment } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { getPaymentText } from "@/lib/i18n/payment-texts";

const emptyCustomer: CustomerDetails = { name: "", phone: "", email: "" };
const emptyDelivery: DeliveryDetails = { method: "Envio", region: "PT", country: "Portugal", address: "", postalCode: "", city: "", notes: "" };
const emptyPayment: PaymentDetails = { method: paymentConfig.defaultMethod, privacyAccepted: false };

export function CheckoutFlow({ paymentsTestMode = false }: { paymentsTestMode?: boolean }) {
  const router = useRouter();
  const { dictionary: t, locale, localizePath } = useI18n();
  const { addToCart, cart, cartNotice, clearCart, decreaseCartQuantity, removeFromCart } = useStore();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer);
  const [delivery, setDelivery] = useState<DeliveryDetails>(emptyDelivery);
  const [payment, setPayment] = useState<PaymentDetails>(emptyPayment);
  const enabledPaymentMethods = useMemo(() => getEnabledPaymentMethods({ testMode: paymentsTestMode }), [paymentsTestMode]);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [deliveryErrors, setDeliveryErrors] = useState<Partial<Record<keyof DeliveryDetails, string>>>({});
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof PaymentDetails, string>>>({});
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const processingRef = useRef(false);
  const totals = useMemo(() => calculateOrderTotals(cart, delivery), [cart, delivery]);
  const shippingInfo = useMemo(() => getDeliveryShipping(delivery), [delivery]);
  const selectedPayment = enabledPaymentMethods.find((method) => method.id === payment.method) ?? enabledPaymentMethods[0];
  const selectedPaymentText = selectedPayment ? getPaymentText(selectedPayment.id, locale, selectedPayment.customerText) : "";
  const fields = [
    { key: "name" as const, label: t.checkout.name, type: "text", autoComplete: "name", required: true },
    { key: "phone" as const, label: t.checkout.phone, type: "tel", autoComplete: "tel", required: true },
    { key: "email" as const, label: t.checkout.email, type: "email", autoComplete: "email", required: false },
  ];

  function updateCustomer(field: keyof CustomerDetails, value: string) { setCustomer((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setSubmitError(""); }
  function updateDelivery(field: keyof DeliveryDetails, value: string) { setDelivery((current) => { const next = { ...current, [field]: value }; if (field === "region") next.country = value === "PT" ? "Portugal" : ""; if (field === "method" && value === "Recolha em mão") next.country = "Portugal"; return next as DeliveryDetails; }); setDeliveryErrors((current) => ({ ...current, [field]: undefined })); setSubmitError(""); }
  function updatePayment(value: PaymentDetails["method"]) { setPayment((current) => ({ ...current, method: value })); setPaymentErrors((current) => ({ ...current, method: undefined })); setSubmitError(""); }

  function validateStep() {
    const nextErrors = validateCustomer(customer);
    const nextDeliveryErrors = validateDelivery(delivery);
    const nextPaymentErrors = validatePayment(payment, { testMode: paymentsTestMode });
    setErrors(nextErrors); setDeliveryErrors(nextDeliveryErrors); setPaymentErrors(nextPaymentErrors);
    if (Object.keys(nextErrors).length > 0) { const first = fields.find((field) => nextErrors[field.key]); window.setTimeout(() => document.getElementById(`checkout-${first?.key}`)?.focus(), 0); return false; }
    if (Object.keys(nextDeliveryErrors).length > 0) return false;
    if (Object.keys(nextPaymentErrors).length > 0) { setSubmitError(nextPaymentErrors.privacyAccepted ?? nextPaymentErrors.method ?? t.checkout.errors.privacy); return false; }
    return true;
  }

  function continueCheckout() { if (step === 0) { if (cart.length > 0) setStep(1); return; } if (validateStep()) setStep(2); }

  async function finalizeOrder() {
    if (processingRef.current || cart.length === 0) return;
    if (!validateStep()) { setStep(1); return; }
    processingRef.current = true; setProcessing(true); setSubmitError("");
    try {
      const result = await createCheckoutOrder({ customer, delivery, payment, locale, items: cart.map((item) => ({ stableId: item.stableId, quantity: item.quantity })) });
      if (!result.ok) { setSubmitError(result.message); return; }
      if (result.checkoutUrl) { window.location.assign(result.checkoutUrl); return; }
      clearCart(); router.push(`${localizePath("/obrigado")}?pedido=${encodeURIComponent(result.orderNumber)}`);
    } catch { setSubmitError(t.checkout.errors.submit); }
    finally { setProcessing(false); processingRef.current = false; }
  }

  return <div className="mx-auto max-w-5xl"><ol className="grid grid-cols-3 gap-2 border-y border-champagne/25 py-5 text-center text-xs font-bold uppercase tracking-[0.12em]">{t.checkout.steps.map((label, index) => <li key={label} className={index === step ? "text-champagne" : "text-smoke"}>{index + 1}. {label}</li>)}</ol><div className="mt-8 border border-champagne/25 bg-pearl p-5 md:p-10">
    {step === 0 && <section aria-labelledby="checkout-cart-title"><h2 id="checkout-cart-title" className="font-serif text-4xl">{t.checkout.cartTitle}</h2>{cartNotice && <p role="status" className="mt-5 border border-champagne/30 p-4 text-sm text-gold-light">{cartNotice}</p>}{cart.length === 0 ? <p className="mt-6 font-serif text-lg text-smoke">{t.cart.empty}</p> : <div className="mt-7 grid gap-5">{cart.map((item) => <article key={`${item.stableId}-${item.variantId ?? "default"}`} className="grid grid-cols-[72px_1fr] gap-4 border-b border-champagne/20 pb-5 sm:grid-cols-[88px_1fr_auto]"><div className="relative aspect-square overflow-hidden bg-porcelain"><Image src={item.capa} alt="" fill sizes="88px" className="object-cover" /></div><div><h3 className="font-serif text-xl">{item.nome}</h3><p className="mt-1 text-xs text-smoke">{t.product.reference}: {item.sku ?? item.stableId}</p><p className="mt-2 text-sm text-smoke">{t.product.unitPrice}: {formatPrice(item.price, locale)}</p><div className="mt-3 flex items-center gap-1"><button className="grid h-11 w-11 place-items-center border border-champagne/30" type="button" onClick={() => decreaseCartQuantity(item.id, item.variantId)} aria-label={`${t.cart.decrease}: ${item.nome}`}><Minus size={15} /></button><span className="grid h-11 min-w-11 place-items-center">{item.quantity}</span><button className="grid h-11 w-11 place-items-center border border-champagne/30" type="button" onClick={() => addToCart(item, 1, item.variantId)} aria-label={`${t.cart.increase}: ${item.nome}`}><Plus size={15} /></button><button className="ml-2 grid h-11 w-11 place-items-center text-velvet" type="button" onClick={() => removeFromCart(item.id)} aria-label={`${t.cart.remove}: ${item.nome}`}><Trash2 size={16} /></button></div></div><strong className="col-start-2 font-serif text-xl text-velvet sm:col-start-3">{formatPrice(item.price * item.quantity, locale)}</strong></article>)}<OrderTotals subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} shippingLabel={t.cart.shipping} totalLabel={t.cart.total} subtotalLabel={t.product.subtotal} locale={locale} /></div>}</section>}
    {step === 1 && <section aria-labelledby="customer-title"><p className="eyebrow">{t.checkout.contactEyebrow}</p><h2 id="customer-title" className="mt-3 font-serif text-4xl">{t.checkout.customerTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">{t.checkout.customerText}</p><div className="mt-7 grid gap-5 md:grid-cols-2">{fields.map((field) => <label key={field.key} className={field.key === "email" ? "md:col-span-2" : ""} htmlFor={`checkout-${field.key}`}><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{field.label}</span><input id={`checkout-${field.key}`} type={field.type} required={field.required} inputMode={field.key === "phone" ? "tel" : field.key === "email" ? "email" : undefined} autoComplete={field.autoComplete} aria-invalid={Boolean(errors[field.key])} className="min-h-12 w-full border border-champagne/35 bg-porcelain px-4 outline-none focus:border-champagne" value={customer[field.key]} onChange={(event) => updateCustomer(field.key, event.target.value)} />{errors[field.key] && <span role="alert" className="mt-2 block text-sm text-velvet">{errors[field.key]}</span>}</label>)}</div><div className="mt-8 border-t border-champagne/20 pt-7"><p className="eyebrow">{t.checkout.delivery}</p><div className="mt-5 grid gap-5 md:grid-cols-2"><label htmlFor="checkout-delivery-method" className="md:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{t.checkout.deliveryMethod}</span><select id="checkout-delivery-method" value={delivery.method} onChange={(event) => updateDelivery("method", event.target.value)} className="min-h-12 w-full border border-champagne/35 bg-porcelain px-4 outline-none focus:border-champagne"><option value="Envio">{t.checkout.shipping}</option><option value="Recolha em mão">{t.checkout.pickup}</option></select></label>{delivery.method === "Envio" && <><label htmlFor="checkout-region"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{t.checkout.region}</span><select id="checkout-region" value={delivery.region} onChange={(event) => updateDelivery("region", event.target.value)} className="min-h-12 w-full border border-champagne/35 bg-porcelain px-4 outline-none focus:border-champagne">{shippingConfig.regions.map((region) => <option key={region.id} value={region.id}>{region.label} · {formatPrice(region.price, locale)}</option>)}</select>{deliveryErrors.region && <span role="alert" className="mt-2 block text-sm text-velvet">{deliveryErrors.region}</span>}</label><Field id="checkout-country" label={t.checkout.country} value={delivery.country} error={deliveryErrors.country} onChange={(value) => updateDelivery("country", value)} /><Field id="checkout-address" label={t.checkout.address} value={delivery.address} error={deliveryErrors.address} onChange={(value) => updateDelivery("address", value)} className="md:col-span-2" /><Field id="checkout-postal" label={t.checkout.postalCode} value={delivery.postalCode} error={deliveryErrors.postalCode} onChange={(value) => updateDelivery("postalCode", value)} placeholder={delivery.region === "PT" ? "0000-000" : ""} /><Field id="checkout-city" label={t.checkout.city} value={delivery.city} error={deliveryErrors.city} onChange={(value) => updateDelivery("city", value)} /><p className="md:col-span-2 border border-champagne/25 p-4 text-sm text-smoke">{t.checkout.shipping} {shippingInfo.carrier}. {t.checkout.estimated}: {shippingInfo.estimatedDelivery}, {t.checkout.shippingNote}.</p></>}<label htmlFor="checkout-notes" className="md:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{t.checkout.notes}</span><textarea id="checkout-notes" rows={3} value={delivery.notes} onChange={(event) => updateDelivery("notes", event.target.value)} className="w-full border border-champagne/35 bg-porcelain p-4 outline-none focus:border-champagne" /></label></div></div><div className="mt-8 border-t border-champagne/20 pt-7"><p className="eyebrow">{t.checkout.payment}</p><div className="mt-5 grid gap-3 md:grid-cols-2">{enabledPaymentMethods.map((method) => <label key={method.id} className={`border p-4 transition ${payment.method === method.id ? "border-champagne bg-champagne/10" : "border-champagne/25"}`}><span className="flex items-center gap-3 font-serif text-xl"><input type="radio" name="payment-method" checked={payment.method === method.id} onChange={() => updatePayment(method.id)} /> {method.label}</span>{paymentsTestMode && getStripeCheckoutPaymentMethod(method.id) && <span className="mt-3 inline-flex border border-amber-300/40 bg-amber-300/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">Pagamento de teste via Stripe</span>}<span className="mt-2 block text-sm leading-relaxed text-smoke">{getPaymentText(method.id, locale, method.customerText)}</span></label>)}</div>{paymentErrors.method && <p role="alert" className="mt-3 text-sm text-velvet">{paymentErrors.method}</p>}<label className="mt-5 flex gap-3 text-sm leading-relaxed text-smoke"><input type="checkbox" checked={payment.privacyAccepted} onChange={(event) => { setPayment((current) => ({ ...current, privacyAccepted: event.target.checked })); setPaymentErrors((current) => ({ ...current, privacyAccepted: undefined })); setSubmitError(""); }} /> {t.checkout.privacy}</label>{submitError && <p role="alert" className="mt-4 border border-velvet/30 bg-velvet/5 p-4 text-sm text-velvet">{submitError}</p>}</div></section>}
    {step === 2 && <section aria-labelledby="review-title"><p className="eyebrow">{t.checkout.reviewEyebrow}</p><h2 id="review-title" className="mt-3 font-serif text-4xl">{t.checkout.reviewTitle}</h2><div className="mt-7 grid gap-3 text-sm sm:text-base">{cart.map((item) => <div key={item.stableId} className="grid grid-cols-[1fr_auto] gap-4 border-b border-champagne/15 pb-3"><span>{item.quantity} × {item.nome}<small className="block text-sm text-smoke">{formatPrice(item.price, locale)} {t.product.unitPrice.toLowerCase()}</small></span><strong>{formatPrice(item.price * item.quantity, locale)}</strong></div>)}<OrderTotals subtotal={totals.subtotal} shipping={totals.shipping} total={totals.total} shippingLabel={t.cart.shipping} totalLabel={t.cart.total} subtotalLabel={t.product.subtotal} locale={locale} /></div><div className="mt-8 grid gap-2 border-y border-champagne/20 py-6 text-sm leading-relaxed"><p><strong>{t.checkout.name}:</strong> {customer.name}</p><p><strong>{t.checkout.phone}:</strong> {customer.phone}</p>{customer.email && <p><strong>Email:</strong> {customer.email}</p>}<p><strong>{t.checkout.delivery}:</strong> {delivery.method}</p>{delivery.method === "Envio" && <><p><strong>{t.checkout.country}:</strong> {delivery.country} ({shippingInfo.regionLabel})</p><p><strong>{t.checkout.address}:</strong> {delivery.address}, {delivery.postalCode}, {delivery.city}</p><p><strong>{t.checkout.carrier}:</strong> {shippingInfo.carrier} · {t.checkout.estimated} {shippingInfo.estimatedDelivery}</p></>}{delivery.notes && <p><strong>{t.checkout.notes}:</strong> {delivery.notes}</p>}<p><strong>{t.checkout.payment}:</strong> {payment.method}</p><p className="text-smoke">{selectedPaymentText}</p></div><p className="mt-5 text-sm leading-relaxed text-smoke">{t.checkout.secure}</p>{submitError && <p role="alert" className="mt-4 border border-velvet/30 bg-velvet/5 p-4 text-sm text-velvet">{submitError}</p>}</section>}
    {step < 2 ? <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-champagne/20 pt-6">{step > 0 ? <button className="ghost-button" type="button" onClick={() => setStep((current) => current - 1)}>{t.checkout.back}</button> : <span />}<button className="premium-button" type="button" disabled={step === 0 && cart.length === 0} onClick={continueCheckout}>{t.checkout.continue}</button></div> : <div className="mt-7 flex flex-wrap gap-3"><button className="ghost-button" type="button" disabled={processing} onClick={() => setStep(1)}>{t.checkout.edit}</button><button className="premium-button disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={processing || cart.length === 0} onClick={finalizeOrder}>{processing ? t.checkout.submitting : t.checkout.submit}</button></div>}
  </div></div>;
}

function Field({ id, label, value, error, onChange, className = "", placeholder }: { id: string; label: string; value: string; error?: string; onChange: (value: string) => void; className?: string; placeholder?: string }) {
  return <label htmlFor={id} className={className}><span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{label}</span><input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 w-full border border-champagne/35 bg-porcelain px-4 outline-none focus:border-champagne" />{error && <span role="alert" className="mt-2 block text-sm text-velvet">{error}</span>}</label>;
}

function OrderTotals({ subtotal, shipping, total, subtotalLabel, shippingLabel, totalLabel, locale }: { subtotal: number; shipping: number; total: number; subtotalLabel: string; shippingLabel: string; totalLabel: string; locale: Parameters<typeof formatPrice>[1] }) {
  return <div className="mt-3 grid gap-2 text-sm text-smoke"><div className="flex justify-between"><span>{subtotalLabel}</span><strong>{formatPrice(subtotal, locale)}</strong></div><div className="flex justify-between"><span>{shippingLabel}</span><strong>{formatPrice(shipping, locale)}</strong></div><div className="flex justify-between font-serif text-xl text-velvet"><span>{totalLabel}</span><strong>{formatPrice(total, locale)}</strong></div></div>;
}


