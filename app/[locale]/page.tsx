import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventPresences } from "@/components/event-presences";
import { BenefitsStrip } from "@/components/benefits-strip";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { ProductSection } from "@/components/product-section";
import { SalesLocationsSection } from "@/components/sales-locations-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { locales, type LocaleCode } from "@/config/locales";
import { canonicalUrl, localizedAlternates } from "@/lib/i18n/seo";
import { getDictionary, isLocale } from "@/lib/i18n/messages";
import { localizeProduct } from "@/lib/i18n/products";
import { getPublishedProducts, toPublicProduct } from "@/lib/product-visibility";
import { publishedSalesLocations } from "@/data/sales-locations";
import { publishedTestimonials } from "@/data/testimonials";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() { return locales.map((locale) => ({ locale: locale.code })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const t = getDictionary(rawLocale);
  return {
    title: t.home.collectionTitle,
    description: t.home.collectionDescription,
    alternates: {
      canonical: canonicalUrl(rawLocale),
      ...localizedAlternates(),
    },
  };
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as LocaleCode;
  const t = getDictionary(locale);
  const products = (await getPublishedProducts()).map(toPublicProduct).map((product) => localizeProduct(product, locale));
  const newProducts = products.filter((product) => product.novidade);
  const bestSellerProducts = products.filter((product) => product.featured ?? product.isFeatured);
  return (
    <main>
      <Hero dictionary={t} />
      <BenefitsStrip />
      <ProductGrid products={products} />
      <ProductSection id="novidades" eyebrow={t.home.newEyebrow} title={t.home.newTitle} description={t.home.newDescription} products={newProducts} />
      <ProductSection id="best-sellers" eyebrow={t.home.bestEyebrow} title={t.home.bestTitle} description={t.home.bestDescription} products={bestSellerProducts} />
      <EventPresences />
      {publishedSalesLocations.length > 0 && <SalesLocationsSection locations={publishedSalesLocations} />}
      {publishedTestimonials.length > 0 && <TestimonialsSection testimonials={publishedTestimonials} />}
    </main>
  );
}



