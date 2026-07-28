"use client";

import { ProductCard } from "@/components/product-card";
import { useStore } from "@/hooks/use-store";

export function FavoritesSection() {
  const { favorites, products } = useStore();
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  if (favoriteProducts.length === 0) return null;

  return (
    <section id="favoritos" className="bg-graphite px-5 py-20 text-pearl md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow">Favoritos</p>
        <h2 className="font-serif text-5xl">As tuas escolhas</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
