"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { defaultLocale, type LocaleCode } from "@/config/locales";
import { getDictionary, getLocale, stripLocale, type Dictionary } from "@/lib/i18n/messages";

type I18nContextValue = {
  locale: LocaleCode;
  dictionary: Dictionary;
  pathnameWithoutLocale: string;
  localizePath: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function localeFromPathname(pathname: string): LocaleCode {
  return getLocale(pathname.split("/").filter(Boolean)[0]);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const dictionary = getDictionary(locale);
  const pathnameWithoutLocale = stripLocale(pathname);
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    dictionary,
    pathnameWithoutLocale,
    localizePath: (path: string) => {
      const clean = path.startsWith("/") ? path : `/${path}`;
      if (clean.startsWith("/admin")) return clean;
      if (clean === "/") return `/${locale}`;
      return `/${locale}${clean}`;
    },
  }), [dictionary, locale, pathnameWithoutLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (value) return value;
  return {
    locale: defaultLocale,
    dictionary: getDictionary(defaultLocale),
    pathnameWithoutLocale: "/",
    localizePath: (path: string) => path,
  } satisfies I18nContextValue;
}
