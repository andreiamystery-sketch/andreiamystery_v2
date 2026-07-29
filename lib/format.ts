import { getLocaleConfig, type LocaleCode } from "@/config/locales";

export function formatPrice(value: number, locale: LocaleCode = "pt") {
  const config = getLocaleConfig(locale);
  return new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency }).format(value);
}
