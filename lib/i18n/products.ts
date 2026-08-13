import { getLocaleConfig, type AppLocale, type LocaleCode } from "@/config/locales";
import { getLocalProductTranslation } from "@/data/product-translations";
import type { Product, ProductTranslationContent } from "@/types/product";

const nameField = {
  pt: "name_pt",
  en: "name_en",
  es: "name_es",
  fr: "name_fr",
  de: "name_de",
  zh: "name_zh",
} as const;

const descriptionField = {
  pt: "description_pt",
  en: "description_en",
  es: "description_es",
  fr: "description_fr",
  de: "description_de",
  zh: "description_zh",
} as const;

function clean(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanList(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.map((item) => item.trim()).filter(Boolean) : [];
}

export function getTranslationWithFallback<T>(localeValue: T | null | undefined, portugueseValue: T | null | undefined, originalValue: T): T {
  if (Array.isArray(localeValue) && localeValue.length > 0) return localeValue as T;
  if (typeof localeValue === "string" && localeValue.trim()) return localeValue as T;
  if (localeValue !== null && localeValue !== undefined && !Array.isArray(localeValue) && typeof localeValue !== "string") return localeValue;

  if (Array.isArray(portugueseValue) && portugueseValue.length > 0) return portugueseValue as T;
  if (typeof portugueseValue === "string" && portugueseValue.trim()) return portugueseValue as T;
  if (portugueseValue !== null && portugueseValue !== undefined && !Array.isArray(portugueseValue) && typeof portugueseValue !== "string") return portugueseValue;

  return originalValue;
}

function getLocalizedContent(product: Product, locale: LocaleCode) {
  const appLocale = getLocaleConfig(locale).locale;
  const current = product.translations?.[appLocale] ?? getLocalProductTranslation(product, appLocale) ?? {};
  const portuguese = product.translations?.["pt-PT" as AppLocale] ?? getLocalProductTranslation(product, "pt-PT" as AppLocale) ?? {};
  return { current, portuguese };
}

export function getProductName(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  const legacyLocaleName = product[nameField[locale]];
  return getTranslationWithFallback(clean(current.name) || legacyLocaleName, clean(portuguese.name) || product.name_pt, product.nome);
}

export function getProductDescription(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  const legacyLocaleDescription = product[descriptionField[locale]];
  return getTranslationWithFallback(clean(current.shortDescription) || clean(current.description) || legacyLocaleDescription, clean(portuguese.shortDescription) || clean(portuguese.description) || product.description_pt, product.descricao);
}

export function getProductFullDescription(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  return getTranslationWithFallback(clean(current.description), clean(portuguese.description), product.fullDescription ?? product.descricao);
}

export function getProductCategoryName(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  return getTranslationWithFallback(clean(current.categoryName), clean(portuguese.categoryName), product.categoryName ?? product.categoria);
}

export function getProductMaterials(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  return getTranslationWithFallback(cleanList(current.materials), cleanList(portuguese.materials), product.materiais);
}

export function getProductDetails(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  return getTranslationWithFallback(cleanList(current.details), cleanList(portuguese.details), product.detalhes);
}

export function getProductAvailability(product: Product, locale: LocaleCode) {
  const { current, portuguese } = getLocalizedContent(product, locale);
  return getTranslationWithFallback(clean(current.availability), clean(portuguese.availability), product.availabilityText ?? "Disponível");
}

export function getProductSeo(product: Product, locale: LocaleCode): Pick<ProductTranslationContent, "seoTitle" | "seoDescription"> {
  const { current, portuguese } = getLocalizedContent(product, locale);
  return {
    seoTitle: getTranslationWithFallback(clean(current.seoTitle), clean(portuguese.seoTitle), product.seoTitle ?? getProductName(product, locale)),
    seoDescription: getTranslationWithFallback(clean(current.seoDescription), clean(portuguese.seoDescription), product.seoDescription ?? getProductDescription(product, locale)),
  };
}

export function getLocalizedProduct(product: Product, locale: LocaleCode): Product {
  const seo = getProductSeo(product, locale);
  return {
    ...product,
    nome: getProductName(product, locale),
    descricao: getProductDescription(product, locale),
    fullDescription: getProductFullDescription(product, locale),
    categoryName: getProductCategoryName(product, locale),
    materiais: getProductMaterials(product, locale),
    detalhes: getProductDetails(product, locale),
    availabilityText: getProductAvailability(product, locale),
    seoTitle: seo.seoTitle ?? undefined,
    seoDescription: seo.seoDescription ?? undefined,
  };
}

export const localizeProduct = getLocalizedProduct;
