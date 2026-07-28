"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const favorite = favorites.includes(product.id);
  const [added, setAdded] = useState(false);
  const isNew = Boolean(product.novidade);
  const isBestSeller = Boolean(product.featured ?? product.isFeatured);

  return (
    <article className="group border border-gold/15 bg-black-warm transition duration-500 hover:-translate-y-1 hover:border-gold/45">
      <Link href={`/produto/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-porcelain">
        <Image
          src={product.capa}
          alt={product.nome}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        {(isNew || isBestSeller) && (
          <span className="absolute left-3 top-3 border border-gold/50 bg-obsidian/90 px-3 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-gold-light">
            {isNew ? "Novo" : "Best-seller"}
          </span>
        )}
        <button
          className={`absolute right-3 top-3 grid h-11 w-11 place-items-center border backdrop-blur ${favorite ? "border-gold bg-gold text-obsidian" : "border-gold/40 bg-obsidian/75 text-ivory"}`}
          type="button"
          onClick={(event) => {
            event.preventDefault();
            toggleFavorite(product.id);
          }}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
      </Link>
      <div className="grid min-h-56 p-5">
        <p className="eyebrow mb-2">{product.categoria}</p>
        <Link href={`/produto/${product.slug}`} className="font-serif text-2xl leading-tight text-ivory transition hover:text-gold-light">
          {product.nome}
        </Link>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-warm-gray">{product.descricao}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gold/15 pt-4">
          <strong className="font-serif text-2xl font-semibold text-gold-light">{formatPrice(product.price)}</strong>
          <button
            className="grid h-11 w-11 place-items-center border border-gold/45 text-gold transition hover:bg-gold hover:text-obsidian disabled:border-gold disabled:bg-gold disabled:text-obsidian"
            type="button"
            disabled={added}
            onClick={() => {
              if (added) return;
              addToCart(product);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1600);
            }}
            aria-label={`Adicionar ${product.nome} ao carrinho`}
          >
            {added ? <Check size={17} /> : <ShoppingBag size={17} />}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">{added ? `${product.nome} adicionado ao carrinho` : ""}</span>
      </div>
    </article>
  );
}
