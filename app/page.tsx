import { EventPresences } from "@/components/event-presences";
import { BenefitsStrip } from "@/components/benefits-strip";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { ProductSection } from "@/components/product-section";
import { SalesLocationsSection } from "@/components/sales-locations-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { getPublishedProducts, toPublicProduct } from "@/lib/product-visibility";
import { publishedSalesLocations } from "@/data/sales-locations";
import { publishedTestimonials } from "@/data/testimonials";

export default async function HomePage() {
  const products = (await getPublishedProducts()).map(toPublicProduct);
  const newProducts = products.filter((product) => product.novidade);
  const bestSellerProducts = products.filter((product) => product.featured ?? product.isFeatured);
  return (
    <main>
      <Hero />
      <BenefitsStrip />
      <ProductGrid products={products} />
      <ProductSection
        id="novidades"
        eyebrow="Novidades"
        title="Acabaram de chegar"
        description="Novas propostas com acabamento dourado, brilho delicado e presenca minimalista."
        products={newProducts}
      />
      <ProductSection
        id="best-sellers"
        eyebrow="Seleção manual"
        title="Best-sellers"
        description="Uma seleção editorial das peças que queremos destacar neste momento."
        products={bestSellerProducts}
      />
      <EventPresences />
      {publishedSalesLocations.length > 0 && <SalesLocationsSection locations={publishedSalesLocations} />}
      {publishedTestimonials.length > 0 && <TestimonialsSection testimonials={publishedTestimonials} />}
    </main>
  );
}
