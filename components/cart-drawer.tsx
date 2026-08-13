"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useMemo } from "react";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useStore } from "@/hooks/use-store";
import { formatPrice } from "@/lib/format";
import { getLocalizedProduct } from "@/lib/i18n/products";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToCart, cart, cartTotal, decreaseCartQuantity, removeFromCart } = useStore();
  const { dictionary: t, locale, localizePath } = useI18n();
  const localizedCart = useMemo(() => cart.map((item) => ({ ...getLocalizedProduct(item, locale), quantity: item.quantity, variantId: item.variantId })), [cart, locale]);

  return <><div className={`fixed inset-0 z-50 bg-obsidian/55 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} /><aside role="dialog" aria-modal="true" aria-label={t.cart.title} aria-hidden={!open} className={`fixed right-0 top-0 z-50 grid h-dvh w-full max-w-md grid-rows-[auto_1fr_auto] border-l border-gold/20 bg-black-warm text-ivory shadow-premium transition duration-300 ${open ? "translate-x-0" : "pointer-events-none translate-x-full"}`}>
    <div className="flex items-center justify-between border-b border-champagne/20 p-6"><h2 className="font-serif text-4xl">{t.cart.title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label={`${t.actions.close} ${t.cart.title}`}><X size={21} /></button></div>
    <div className="overflow-y-auto p-6">{localizedCart.length === 0 ? <p className="font-serif text-lg leading-relaxed text-smoke">{t.cart.empty}</p> : <div className="grid gap-5">{localizedCart.map((item) => <div key={`${item.id}-${item.variantId ?? "default"}`} className="grid grid-cols-[76px_1fr] gap-4 border-b border-champagne/15 pb-5"><div className="relative aspect-square overflow-hidden bg-porcelain"><Image src={item.capa} alt="" fill sizes="76px" className="object-cover" /></div><div><Link href={localizePath(`/produto/${item.slug}`)} className="font-serif text-xl leading-tight" onClick={onClose}>{item.nome}</Link><p className="mt-2 text-sm text-smoke">{t.product.reference}: {item.sku ?? item.stableId}</p><p className="mt-1 text-sm text-smoke">{t.product.unitPrice}: {formatPrice(item.price, locale)}</p><strong className="mt-2 block font-serif text-velvet">{t.product.subtotal}: {formatPrice(item.price * item.quantity, locale)}</strong><div className="mt-3 flex items-center gap-2"><button type="button" className="grid h-11 w-11 place-items-center border border-champagne/30" onClick={() => decreaseCartQuantity(item.id, item.variantId)} aria-label={`${t.cart.decrease}: ${item.nome}`}><Minus size={15} /></button><span className="grid h-11 min-w-11 place-items-center font-serif">{item.quantity}</span><button type="button" className="grid h-11 w-11 place-items-center border border-champagne/30" onClick={() => addToCart(item, 1, item.variantId)} aria-label={`${t.cart.increase}: ${item.nome}`}><Plus size={15} /></button><button type="button" className="ml-2 grid h-11 w-11 place-items-center text-velvet" onClick={() => removeFromCart(item.id)} aria-label={`${t.cart.remove}: ${item.nome}`}><Trash2 size={16} /></button></div></div></div>)}</div>}</div>
    <div className="border-t border-champagne/20 p-6"><div className="mb-5 flex justify-between font-serif text-xl"><span>{t.cart.total}</span><strong>{formatPrice(cartTotal, locale)}</strong></div>{localizedCart.length > 0 ? <Link className="premium-button w-full" href={localizePath("/checkout")} onClick={onClose}>{t.actions.checkout}</Link> : <button className="premium-button w-full opacity-50" type="button" disabled>{t.actions.checkout}</button>}</div>
  </aside></>;
}
