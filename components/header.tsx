"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CartDrawer } from "@/components/cart-drawer";
import { Logo } from "@/components/brand/logo";
import { SearchDrawer } from "@/components/search-drawer";
import { TopBar } from "@/components/top-bar";
import { activeLocales, type LocaleCode } from "@/config/locales";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useStore } from "@/hooks/use-store";
import { upcomingEventPresences } from "@/data/events";
import { publishedTestimonials } from "@/data/testimonials";
import { publishedSalesLocations } from "@/data/sales-locations";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartCount, favorites } = useStore();
  const { dictionary: t, locale, localizePath, pathnameWithoutLocale } = useI18n();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.localStorage.setItem("andreas-mystery-locale", locale);
  }, [locale]);

  const navItems = [
    { href: localizePath("/#colecao"), label: t.nav.collection },
    { href: localizePath("/#novidades"), label: t.nav.new },
    { href: localizePath("/#best-sellers"), label: t.nav.best },
    ...(upcomingEventPresences.length > 0 ? [{ href: localizePath("/#presencas"), label: t.nav.events }] : []),
    ...(publishedSalesLocations.length > 0 ? [{ href: localizePath("/#pontos-de-venda"), label: t.nav.sales }] : []),
    ...(publishedTestimonials.length > 0 ? [{ href: localizePath("/#testemunhos"), label: t.nav.testimonials }] : []),
  ];
  const query = searchParams.toString();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold/30 bg-obsidian/95 text-ivory backdrop-blur-xl">
        <TopBar />
        <div className="mx-auto grid min-h-20 max-w-[90rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 transition-all md:min-h-24 md:px-8">
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center border border-gold/30 text-gold md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <Logo className="col-start-2 justify-items-center md:col-start-1 md:justify-self-start md:justify-items-start" />
          <nav aria-label="Navegação principal" className="hidden justify-self-center text-[0.68rem] font-bold uppercase tracking-[0.18em] md:col-start-2 md:flex md:items-center md:gap-5 xl:gap-8">{navItems.map((item) => <Link key={item.href} href={item.href} className="relative py-3 text-warm-gray transition after:absolute after:inset-x-1 after:bottom-0 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition hover:text-ivory hover:after:scale-x-100">{item.label}</Link>)}</nav>
          <div className="col-start-3 row-start-1 flex items-center justify-self-end"><LanguageSwitcher locale={locale} pathnameWithoutLocale={pathnameWithoutLocale} query={query} label={t.actions.chooseLanguage} /><button className="icon-button" type="button" onClick={() => setSearchOpen(true)} aria-label={t.actions.search}><Search size={18} /></button><Link className="icon-button relative" href={localizePath("/#favoritos")} aria-label={t.actions.favorites}><Heart size={18} />{favorites.length > 0 && <span className="pill-counter">{favorites.length}</span>}</Link><button className="icon-button relative" type="button" onClick={() => setCartOpen(true)} aria-label={t.actions.cart}><ShoppingBag size={18} />{cartCount > 0 && <span className="pill-counter">{cartCount}</span>}</button></div>
        </div>
        {menuOpen && <nav aria-label="Navegação móvel" className="grid gap-1 border-t border-gold/20 bg-black-warm px-5 py-5 text-sm font-bold uppercase tracking-[0.2em] md:hidden"><MobileLanguageSwitcher locale={locale} pathnameWithoutLocale={pathnameWithoutLocale} query={query} label={t.actions.chooseLanguage} />{navItems.map((item) => <Link className="min-h-11 border-b border-gold/10 py-3 text-warm-gray" key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}</nav>}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function localeHref(code: LocaleCode, pathnameWithoutLocale: string, query: string) {
  const path = `/${code}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`;
  return query ? `${path}?${query}` : path;
}

function LanguageSwitcher({ locale, pathnameWithoutLocale, query, label }: { locale: string; pathnameWithoutLocale: string; query: string; label: string }) {
  const current = activeLocales.find((item) => item.code === locale) ?? activeLocales[0];
  return <details className="relative mr-2 hidden sm:block"><summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 border border-gold/25 px-3 text-xs font-bold uppercase tracking-[0.12em] text-champagne" aria-label={label}>{current.nativeName}</summary><div className="absolute right-0 mt-2 grid min-w-44 border border-gold/25 bg-obsidian p-2 shadow-premium">{activeLocales.map((item) => <Link key={item.code} href={localeHref(item.code, pathnameWithoutLocale, query)} hrefLang={item.hreflang} className={`px-3 py-2 text-sm transition hover:bg-gold hover:text-obsidian ${item.code === locale ? "text-champagne" : "text-warm-gray"}`}>{item.nativeName}</Link>)}</div></details>;
}

function MobileLanguageSwitcher({ locale, pathnameWithoutLocale, query, label }: { locale: string; pathnameWithoutLocale: string; query: string; label: string }) {
  return <div className="grid gap-2 border-b border-gold/10 pb-4"><span className="text-xs text-champagne">{label}</span><div className="grid grid-cols-2 gap-2">{activeLocales.map((item) => <Link key={item.code} href={localeHref(item.code, pathnameWithoutLocale, query)} hrefLang={item.hreflang} className={`border border-gold/20 px-3 py-2 text-sm ${item.code === locale ? "bg-gold text-obsidian" : "text-warm-gray"}`}>{item.nativeName}</Link>)}</div></div>;
}
