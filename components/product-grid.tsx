"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { categories } from "@/data/products";
import type { Product } from "@/types/product";
import { Filters } from "@/components/filters";
import { searchProducts } from "@/lib/search";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { useI18n } from "@/components/i18n/i18n-provider";

export function ProductGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);
  const scrollAfterFilterRef = useRef(false);
  const { dictionary: t } = useI18n();
  const filteredProducts = useMemo(() => searchProducts(query, products).filter((product) => category === "Todos" || product.categoria === category), [category, query, products]);
  const orderedCategories = [categories[3], categories[2], categories[4], categories[1], categories[0]];

  useLayoutEffect(() => {
    if (!scrollAfterFilterRef.current) return;
    scrollAfterFilterRef.current = false;
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category]);

  function selectCategory(nextCategory: string) {
    scrollAfterFilterRef.current = true;
    if (nextCategory === category) {
      scrollAfterFilterRef.current = false;
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setCategory(nextCategory);
  }

  return (
    <section id="colecao" className="bg-obsidian px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t.home.collectionEyebrow}</p>
          <h2 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-none text-ivory">{t.home.collectionTitle}</h2>
          <p className="mt-5 font-serif text-lg leading-relaxed text-smoke">{t.home.collectionDescription}</p>
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center gap-8"><Filters categories={orderedCategories} active={category} onChange={selectCategory} /><SearchBar value={query} onChange={setQuery} /></div>
        <div ref={productsRef} className="mt-12 scroll-mt-36 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredProducts.length > 0 ? filteredProducts.map((product) => <ProductCard key={product.id} product={product} />) : <p role="status" className="border border-gold/20 px-5 py-10 text-center font-serif text-lg text-smoke sm:col-span-2 lg:col-span-3 xl:col-span-4">{t.product.noResults}</p>}</div>
      </div>
    </section>
  );
}
