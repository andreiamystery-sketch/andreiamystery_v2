import type { LocaleCode } from "@/config/locales";
import type { Product } from "@/types/product";

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

export function getProductName(product: Product, locale: LocaleCode) {
  const value = product[nameField[locale]];
  return value?.trim() || product.name_pt?.trim() || product.nome;
}

export function getProductDescription(product: Product, locale: LocaleCode) {
  const value = product[descriptionField[locale]];
  return value?.trim() || product.description_pt?.trim() || product.descricao;
}

export function localizeProduct(product: Product, locale: LocaleCode): Product {
  return {
    ...product,
    nome: getProductName(product, locale),
    descricao: getProductDescription(product, locale),
  };
}

