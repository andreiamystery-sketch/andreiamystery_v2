import { defaultLocale, locales, type LocaleCode } from "@/config/locales";
import { seoConfig } from "@/config/seo";

export function localizedAlternates(path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const suffix = cleanPath === "/" ? "" : cleanPath;

  return {
    languages: {
      ...Object.fromEntries(
        locales.map((locale) => [locale.hreflang, `${seoConfig.siteUrl}/${locale.code}${suffix}`])
      ),
      "x-default": `${seoConfig.siteUrl}/${defaultLocale}${suffix}`,
    },
  };
}

export function canonicalUrl(locale: LocaleCode, path = "") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${seoConfig.siteUrl}/${locale}${cleanPath === "/" ? "" : cleanPath}`;
}
