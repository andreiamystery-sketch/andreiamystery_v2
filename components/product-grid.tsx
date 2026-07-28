"use client";

import { useMemo, useState } from "react";
import { categories } from "@/data/products";
import type { Product } from "@/types/product";
import { Filters } from "@/components/filters";
import { searchProducts } from "@/lib/search";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";

export function ProductGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return searchProducts(query, products).filter((product) => category === "Todos" || product.categoria === category);
  }, [category, query, products]);
  const orderedCategories = [categories[3], categories[2], categories[4], categories[1], categories[0]];

  return (
    <section id="colecao" className="bg-obsidian px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Coleção</p>
          <h2 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-none text-ivory">Descubra a sua próxima joia</h2>
          <p className="mt-5 font-serif text-lg leading-relaxed text-smoke">
            Pecas com brilho delicado, criadas para elevar o quotidiano e finalizar looks de ocasiao.
          </p>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center gap-8">
          <Filters categories={orderedCategories} active={category} onChange={setCategory} />
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
