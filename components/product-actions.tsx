"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/hooks/use-store";
import type { Product } from "@/types/product";

export function ProductActions({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const favorite = favorites.includes(product.id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addQuantityToCart = () => {
    if (added) return;
    addToCart(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mt-8 grid gap-4">
      <div className="flex w-fit items-center border border-champagne/35 bg-pearl">
        <button className="h-11 w-11 text-xl" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuir quantidade">
          -
        </button>
        <span className="grid h-11 min-w-12 place-items-center border-x border-champagne/20 font-serif text-lg">{quantity}</span>
        <button className="h-11 w-11 text-xl" type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Aumentar quantidade">
          +
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
      <button className="premium-button min-w-52" type="button" onClick={addQuantityToCart} disabled={added}>
        <ShoppingBag size={17} />
        {added ? "Adicionado" : "Adicionar ao carrinho"}
      </button>
      <button className="ghost-button" type="button" onClick={() => toggleFavorite(product.id)}>
        <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        {favorite ? "Favorito" : "Guardar"}
      </button>
      </div>
    </div>
  );
}
