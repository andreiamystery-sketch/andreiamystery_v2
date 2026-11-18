import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product-card";

export function ProductSection({
  id,
  eyebrow,
  title,
  description,
  products,
  limit = 12,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  products: Product[];
  limit?: number;
}) {
  if (products.length === 0) return null;

  return (
    <section id={id} className="border-t border-gold/10 bg-obsidian px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-none text-ivory">{title}</h2>
          <p className="mt-5 font-serif text-lg leading-relaxed text-smoke">{description}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, limit).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
