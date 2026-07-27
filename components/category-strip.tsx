import { categories } from "@/data/products";
import { CategoryCard } from "@/components/category-card";

export function CategoryStrip() {
  return (
    <section className="border-y border-champagne/20 bg-pearl">
      <div className="mx-auto grid max-w-7xl divide-y divide-champagne/20 px-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-10">
        {categories
          .filter((category) => category.id !== "Todos")
          .map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
      </div>
    </section>
  );
}
