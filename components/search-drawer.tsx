"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { searchProducts } from "@/lib/search";

export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchProducts(query).slice(0, 5), [query]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-obsidian/55 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Pesquisa de produtos"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 grid h-dvh w-full max-w-lg grid-rows-[auto_1fr] border-l border-gold/20 bg-black-warm text-ivory shadow-premium transition duration-300 ${
          open ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="border-b border-champagne/20 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-4xl">Pesquisa</h2>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar pesquisa">
              <X size={21} />
            </button>
          </div>
          <label className="flex items-center gap-3 border border-champagne/35 bg-porcelain px-4 py-3">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Brincos, perola, dourado..."
              className="w-full bg-transparent text-base outline-none"
            />
          </label>
        </div>

        <div className="overflow-y-auto p-6">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-champagne">
            {query ? `${results.length} resultados` : `${products.length} sugestoes`}
          </p>
          <div className="grid gap-4">
            {results.map((product) => (
              <Link key={product.id} href={`/produto/${product.slug}`} onClick={onClose} className="grid grid-cols-[82px_1fr] gap-4">
                <div className="relative aspect-square overflow-hidden bg-porcelain">
                  <Image src={product.capa} alt="" fill sizes="82px" className="object-cover" />
                </div>
                <div>
                  <h3 className="font-serif text-xl">{product.nome}</h3>
                  <p className="mt-1 text-sm text-smoke">{product.descricao}</p>
                  <strong className="mt-2 block font-serif text-velvet">{formatPrice(product.price)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
