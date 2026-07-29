export const locales = [
  { code: "pt", locale: "pt-PT", hreflang: "pt-PT", label: "Português", nativeName: "Português", currency: "EUR", dir: "ltr", active: true },
  { code: "en", locale: "en-GB", hreflang: "en-GB", label: "English", nativeName: "English", currency: "EUR", dir: "ltr", active: true },
  { code: "es", locale: "es-ES", hreflang: "es-ES", label: "Español", nativeName: "Español", currency: "EUR", dir: "ltr", active: true },
  { code: "fr", locale: "fr-FR", hreflang: "fr-FR", label: "Français", nativeName: "Français", currency: "EUR", dir: "ltr", active: true },
  { code: "de", locale: "de-DE", hreflang: "de-DE", label: "Deutsch", nativeName: "Deutsch", currency: "EUR", dir: "ltr", active: true },
  { code: "zh", locale: "zh-CN", hreflang: "zh-CN", label: "简体中文", nativeName: "简体中文", currency: "EUR", dir: "ltr", active: true },
] as const;

export type LocaleCode = (typeof locales)[number]["code"];
export type AppLocale = (typeof locales)[number]["locale"];

export const defaultLocale: LocaleCode = "pt";
export const activeLocales = locales.filter((locale) => locale.active);

export function getLocaleConfig(code: LocaleCode) {
  return locales.find((locale) => locale.code === code) ?? locales[0];
}
