import { notFound } from "next/navigation";
import { EngravingCustomizer } from "@/components/engraving-customizer";
import { engravingModels } from "@/data/engraving-models";
import { storeSettings } from "@/data/store-settings";
import { locales, type LocaleCode } from "@/config/locales";
import { getLocalizedProduct } from "@/lib/i18n/products";
import { getPublishedProducts, toPublicProduct } from "@/lib/product-visibility";
import { isLocale } from "@/lib/i18n/messages";

type PageProps = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale.code }));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "pt" ? "Gravações personalizadas | Andrea's Mystery" : "Personalized engravings | Andrea's Mystery",
    description: locale === "pt" ? "Escolhe um modelo e personaliza-o com uma fotografia, um nome ou uma mensagem." : "Choose a model and personalize it with a photo, name or message.",
  };
}

export default async function LocalizedEngravingsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as LocaleCode;
  const publishedModels = (await getPublishedProducts())
    .filter((product) => product.business === "gravacoes")
    .map(toPublicProduct)
    .map((product) => getLocalizedProduct(product, locale))
    .map((product) => ({
      id: product.stableId,
      name: product.nome,
      format: product.categoryName ?? product.categoria,
      image: product.capa,
      description: product.descricao,
      price: product.price,
    }));

  return <EngravingCustomizer models={[...publishedModels, ...engravingModels]} whatsappNumber={storeSettings.whatsappNumber} locale={locale} />;
}
