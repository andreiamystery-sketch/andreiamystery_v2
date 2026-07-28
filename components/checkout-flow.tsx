"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createCheckoutOrder } from "@/app/checkout/actions";
import { useStore } from "@/hooks/use-store";
import {
  calculateOrderTotals,
  type CustomerDetails,
  validateCustomer,
} from "@/lib/checkout";
import { formatPrice } from "@/lib/format";

const steps = ["Carrinho", "Dados do cliente", "Revisão"];
const emptyCustomer: CustomerDetails = { name: "", phone: "", email: "" };

const fields = [
  { key: "name", label: "Nome", type: "text", autoComplete: "name", required: true },
  { key: "phone", label: "Telefone", type: "tel", autoComplete: "tel", required: true },
  { key: "email", label: "Email (opcional)", type: "email", autoComplete: "email", required: false },
] as const;

export function CheckoutFlow() {
  const router = useRouter();
  const { addToCart, cart, cartNotice, clearCart, decreaseCartQuantity, removeFromCart } = useStore();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const processingRef = useRef(false);
  const totals = useMemo(() => calculateOrderTotals(cart), [cart]);

  function updateCustomer(field: keyof CustomerDetails, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  }

  function focusFirstError(nextErrors: Partial<Record<keyof CustomerDetails, string>>) {
    const first = fields.find((field) => nextErrors[field.key]);
    window.setTimeout(() => document.getElementById(`checkout-${first?.key}`)?.focus(), 0);
  }

  function continueCheckout() {
    if (step === 0) {
      if (cart.length > 0) setStep(1);
      return;
    }

    const nextErrors = validateCustomer(customer);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstError(nextErrors);
      return;
    }
    setStep(2);
  }

  async function finalizeOrder() {
    if (processingRef.current || cart.length === 0) return;

    const nextErrors = validateCustomer(customer);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStep(1);
      focusFirstError(nextErrors);
      return;
    }

    processingRef.current = true;
    setProcessing(true);
    setSubmitError("");

    try {
      const result = await createCheckoutOrder({
        customer,
        items: cart.map((item) => ({
          stableId: item.stableId,
          quantity: item.quantity,
        })),
      });

      if (!result.ok) {
        setSubmitError(result.message);
        return;
      }

      clearCart();
      router.push(`/obrigado?pedido=${encodeURIComponent(result.orderNumber)}`);
    } catch {
      setSubmitError(
        "Não foi possível concluir a encomenda. Verifica a ligação e tenta novamente."
      );
    } finally {
      setProcessing(false);
      processingRef.current = false;
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <ol className="grid grid-cols-3 gap-2 border-y border-champagne/25 py-5 text-center text-xs font-bold uppercase tracking-[0.12em]">
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
                <div className="flex justify-between font-serif text-xl">
                  <span>Total</span>
                  <strong>{formatPrice(totals.total)}</strong>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="customer-title">
            <p className="eyebrow">Contacto</p>
            <h2 id="customer-title" className="mt-3 font-serif text-4xl">Os seus dados</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-smoke">
              Usaremos estes dados apenas para processar e confirmar a sua encomenda.
            </p>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className={field.key === "email" ? "md:col-span-2" : ""} htmlFor={`checkout-${field.key}`}>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]">{field.label}</span>
                  <input
                    id={`checkout-${field.key}`}
                    type={field.type}
                    required={field.required}
                    inputMode={field.key === "phone" ? "tel" : field.key === "email" ? "email" : undefined}
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
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="review-title">
            <p className="eyebrow">Último passo</p>
            <h2 id="review-title" className="mt-3 font-serif text-4xl">Revisão da encomenda</h2>
            <div className="mt-7 grid gap-3 text-sm sm:text-base">
              {cart.map((item) => (
                <div key={item.stableId} className="grid grid-cols-[1fr_auto] gap-4 border-b border-champagne/15 pb-3">
                  <span>
                    {item.quantity} × {item.nome}
                    <small className="block text-sm text-smoke">{formatPrice(item.price)} por unidade</small>
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
              <div className="mt-3 flex justify-between text-xl text-velvet">
                <span>Total</span>
                <strong>{formatPrice(totals.total)}</strong>
              </div>
            </div>
            <div className="mt-8 grid gap-2 border-y border-champagne/20 py-6 text-sm leading-relaxed">
              <p><strong>Nome:</strong> {customer.name}</p>
              <p><strong>Telefone:</strong> {customer.phone}</p>
              {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-smoke">
              Ao finalizar, a encomenda é guardada com segurança e recebe um número único para acompanhamento.
            </p>
            {submitError && <p role="alert" className="mt-4 border border-velvet/30 bg-velvet/5 p-4 text-sm text-velvet">{submitError}</p>}
          </section>
        )}

        {step < 2 && (
          <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-champagne/20 pt-6">
            {step > 0 ? <button className="ghost-button" type="button" onClick={() => setStep((current) => current - 1)}>Voltar</button> : <span />}
            <button className="premium-button" type="button" disabled={step === 0 && cart.length === 0} onClick={continueCheckout}>Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="ghost-button" type="button" disabled={processing} onClick={() => setStep(1)}>Editar dados</button>
            <button className="premium-button disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={processing || cart.length === 0} onClick={finalizeOrder}>
              {processing ? "A guardar encomenda…" : "Finalizar Encomenda"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
