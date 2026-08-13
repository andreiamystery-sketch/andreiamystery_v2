"use client";

import Image from "next/image";
import type { CategoryFilter } from "@/types/product";
import { useI18n } from "@/components/i18n/i18n-provider";
import { getCategoryDescription, getCategoryLabel } from "@/lib/i18n/categories";

export function CategoryCard({ category }: { category: CategoryFilter }) {
  const { locale } = useI18n();
  const label = getCategoryLabel(category.id, locale);
  const description = getCategoryDescription(category.id, locale) || category.description;

  return (
    <a href={`#${category.id}`} className="group block py-7 md:px-6">
      {category.imagem && (
        <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-porcelain">
          <Image src={category.imagem} alt={label} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        </div>
      )}
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">{label}</p>
      <p className="mt-3 font-serif text-lg leading-relaxed text-smoke transition group-hover:text-obsidian">{description}</p>
    </a>
  );
}
