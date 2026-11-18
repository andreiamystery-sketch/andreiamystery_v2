import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessEntry } from "@/components/business-entry";
import { EventPresences } from "@/components/event-presences";
import { BenefitsStrip } from "@/components/benefits-strip";
import { ProductGrid } from "@/components/product-grid";
import { ProductSection } from "@/components/product-section";
import { SalesLocationsSection } from "@/components/sales-locations-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { EngravingCustomizer } from "@/components/engraving-customizer";
import { engravingModels } from "@/data/engraving-models";
import { storeSettings } from "@/data/store-settings";
import { locales } from "@/config/locales";
import { canonicalUrl, localizedAlternates } from "@/lib/i18n/seo";
import { getDictionary, isLocale } from "@/lib/i18n/messages";
import { getLocalizedProduct } from "@/lib/i18n/products";
import { getPublishedProducts, toPublicProduct } from "@/lib/product-visibility";
import { publishedSalesLocations } from "@/data/sales-locations";
import { publishedTestimonials } from "@/data/testimonials";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "pt" ? "Andrea's Mystery | Bijuteria e gravações" : "Andrea's Mystery | Jewellery and engravings",
    description: locale === "pt" ? "Escolha entre a coleção de bijuteria premium e as gravações personalizadas Andrea's Mystery." : "Choose between Andrea's Mystery premium jewellery and personalized engravings.",
    alternates: { canonical: canonicalUrl(locale), ...localizedAlternates() },
  };
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const published = await getPublishedProducts();
  const jewelryProducts = published
    .filter((product) => product.business !== "gravacoes")
    .map(toPublicProduct)
    .map((product) => getLocalizedProduct(product, locale));
  const newProducts = jewelryProducts.filter((product) => product.novidade);
  const bestSellerProducts = jewelryProducts.filter((product) => product.featured ?? product.isFeatured);
  const engravingProducts = published
    .filter((product) => product.business === "gravacoes")
    .map(toPublicProduct)
    .map((product) => getLocalizedProduct(product, locale))
    .map((product) => ({ id: product.stableId, name: product.nome, format: product.categoryName ?? product.categoria, image: product.capa, description: product.descricao, price: product.price, bestSeller: product.featured ?? product.isFeatured, newArrival: product.novidade }));
  const jewelryContent = (
    <>
      <BenefitsStrip dictionary={t} />
      <ProductGrid products={jewelryProducts.slice(0, 8)} />
      <ProductSection id="novidades" eyebrow={t.home.newEyebrow} title={t.home.newTitle} description={t.home.newDescription} products={newProducts} limit={4} />
      <ProductSection id="best-sellers" eyebrow={t.home.bestEyebrow} title={t.home.bestTitle} description={t.home.bestDescription} products={bestSellerProducts} limit={4} />
      <EventPresences dictionary={t} locale={locale} />
    </>
  );
  const engravingContent = (
    <>
      <BenefitsStrip dictionary={t} variant="engravings" locale={locale} />
      <EngravingCustomizer models={[...engravingProducts, ...engravingModels]} whatsappNumber={storeSettings.whatsappNumber} locale={locale} hideIntro />
    </>
  );
  const sharedContent = (
    <>
      {publishedSalesLocations.length > 0 && <SalesLocationsSection locations={publishedSalesLocations} dictionary={t} />}
      {publishedTestimonials.length > 0 && <TestimonialsSection testimonials={publishedTestimonials} dictionary={t} locale={locale} />}
    </>
  );

  return <BusinessEntry locale={locale} jewelryContent={jewelryContent} engravingContent={engravingContent} sharedContent={sharedContent} />;
}
