import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalContentPage } from "@/components/legal-content-page";
import { locales, type LocaleCode } from "@/config/locales";
import { canonicalUrl, localizedAlternates } from "@/lib/i18n/seo";
import { legalPages } from "@/data/legal";
import { getLocalizedLegalPage } from "@/lib/i18n/legal";
import { isLocale } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string; legalSlug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => legalPages.map((page) => ({ locale: locale.code, legalSlug: page.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale, legalSlug } = await params;
  if (!isLocale(rawLocale)) return {};
  const page = getLocalizedLegalPage(rawLocale, legalSlug, legalPages);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: canonicalUrl(rawLocale, `/${page.slug}`), ...localizedAlternates(`/${page.slug}`) } };
}

export default async function LocalizedLegalPage({ params }: PageProps) {
  const { locale: rawLocale, legalSlug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const page = getLocalizedLegalPage(rawLocale as LocaleCode, legalSlug, legalPages);
  if (!page) notFound();
  return <LegalContentPage page={page} />;
}


