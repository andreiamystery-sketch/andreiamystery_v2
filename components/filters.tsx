"use client";

import Image from "next/image";
import type { CategoryFilter } from "@/types/product";
import { useI18n } from "@/components/i18n/i18n-provider";
import { getCategoryLabel } from "@/lib/i18n/categories";

export function Filters({ categories, active, onChange }: { categories: CategoryFilter[]; active: string; onChange: (category: string) => void }) {
  const { locale } = useI18n();
  return (
    <div className="flex w-full snap-x gap-5 overflow-x-auto pb-3 sm:flex-wrap sm:justify-center sm:overflow-visible">
      {categories.map((item) => (
        <button key={item.id} type="button" className="group grid min-w-24 snap-start justify-items-center gap-3 text-center" onClick={() => onChange(item.id)} aria-pressed={active === item.id}>
          <span className={`relative block h-20 w-20 overflow-hidden rounded-full border p-1 transition sm:h-24 sm:w-24 ${active === item.id ? "border-gold bg-gold/10" : "border-gold/35 group-hover:border-gold"}`}>
            {item.imagem ? <Image src={item.imagem} alt="" fill sizes="96px" className="rounded-full object-cover p-1.5 transition duration-500 group-hover:scale-105" /> : <span className="grid h-full w-full place-items-center rounded-full bg-graphite font-serif text-2xl text-gold">AM</span>}
          </span>
          <span className={`text-[0.65rem] font-bold uppercase tracking-[0.16em] ${active === item.id ? "text-gold-light" : "text-warm-gray"}`}>{getCategoryLabel(item.id, locale)}</span>
        </button>
      ))}
    </div>
  );
}
