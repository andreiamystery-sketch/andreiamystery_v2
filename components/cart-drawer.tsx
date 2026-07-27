"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { formatPrice } from "@/lib/format";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addToCart, cart, cartTotal, decreaseCartQuantity, removeFromCart } = useStore();

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-obsidian/55 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 grid h-dvh w-full max-w-md grid-rows-[auto_1fr_auto] border-l border-gold/20 bg-black-warm text-ivory shadow-premium transition duration-300 ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-champagne/20 p-6">
          <h2 className="font-serif text-4xl">Carrinho</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar carrinho">
            <X size={21} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {cart.length === 0 ? (
            <p className="font-serif text-lg leading-relaxed text-smoke">O teu carrinho esta vazio.</p>
          ) : (
            <div className="grid gap-5">
              {cart.map((item) => (
                <div key={`${item.id}-${item.variantId ?? "default"}`} className="grid grid-cols-[76px_1fr] gap-4 border-b border-champagne/15 pb-5">
                  <div className="relative aspect-square overflow-hidden bg-porcelain">
                    <Image src={item.capa} alt="" fill sizes="76px" className="object-cover" />
                  </div>
                  <div>
                    <Link href={`/produto/${item.slug}`} className="font-serif text-xl leading-tight" onClick={onClose}>
                      {item.nome}
                    </Link>
                    <p className="mt-2 text-sm text-smoke">
                      Referência: {item.sku ?? item.stableId}
                    </p>
                    <p className="mt-1 text-sm text-smoke">Preço unitário: {formatPrice(item.price)}</p>
                    <strong className="mt-2 block font-serif text-velvet">
                      Subtotal: {formatPrice(item.price * item.quantity)}
                    </strong>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" className="grid h-11 w-11 place-items-center border border-champagne/30" onClick={() => decreaseCartQuantity(item.id, item.variantId)} aria-label={`Diminuir quantidade de ${item.nome}`}>
                        <Minus size={15} />
                      </button>
                      <span className="grid h-11 min-w-11 place-items-center font-serif">{item.quantity}</span>
                      <button type="button" className="grid h-11 w-11 place-items-center border border-champagne/30" onClick={() => addToCart(item, 1, item.variantId)} aria-label={`Aumentar quantidade de ${item.nome}`}>
                        <Plus size={15} />
                      </button>
                      <button type="button" className="ml-2 grid h-11 w-11 place-items-center text-velvet" onClick={() => removeFromCart(item.id)} aria-label={`Remover ${item.nome}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-champagne/20 p-6">
          <div className="mb-5 flex justify-between font-serif text-xl">
            <span>Total</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
          {cart.length > 0 ? (
            <Link className="premium-button w-full" href="/checkout" onClick={onClose}>
              Finalizar encomenda
            </Link>
          ) : (
            <button className="premium-button w-full opacity-50" type="button" disabled>
              Finalizar encomenda
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
