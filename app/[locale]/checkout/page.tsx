import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutFlow } from "@/components/checkout-flow";
import { canonicalUrl, localizedAlternates } from "@/lib/i18n/seo";
import { getDictionary, isLocale } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.checkout.title, description: t.checkout.description, alternates: { canonical: canonicalUrl(locale, "/checkout"), ...localizedAlternates("/checkout") } };
}

export default async function LocalizedCheckoutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return <main className="px-5 py-12 md:px-10 lg:py-20"><div className="mx-auto mb-10 max-w-5xl"><p className="eyebrow">{t.checkout.eyebrow}</p><h1 className="mt-4 font-serif text-5xl leading-none md:text-7xl">{t.checkout.title}</h1></div><CheckoutFlow /></main>;
}





