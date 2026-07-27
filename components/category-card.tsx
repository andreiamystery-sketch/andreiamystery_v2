import Image from "next/image";
import type { CategoryFilter } from "@/types/product";

export function CategoryCard({ category }: { category: CategoryFilter }) {
  return (
    <a href={`#${category.id}`} className="group block py-7 md:px-6">
      {category.imagem && (
        <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-porcelain">
          <Image src={category.imagem} alt={category.label} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        </div>
      )}
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-champagne">{category.label}</p>
      <p className="mt-3 font-serif text-lg leading-relaxed text-smoke transition group-hover:text-obsidian">{category.description}</p>
    </a>
  );
}
