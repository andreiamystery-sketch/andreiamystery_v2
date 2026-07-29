"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { companyAddress } from "@/config/company";
import { useI18n } from "@/components/i18n/i18n-provider";
import { upcomingEventPresences } from "@/data/events";
import { legalPages } from "@/data/legal";
import { getLocalizedLegalPage } from "@/lib/i18n/legal";
import { publishedTestimonials } from "@/data/testimonials";
import { publishedSalesLocations } from "@/data/sales-locations";
import { storeSettings } from "@/data/store-settings";

export function Footer() {
  const { dictionary: t, localizePath, locale } = useI18n();
  const legalLinks = legalPages.map((page) => ({ href: localizePath(`/${page.slug}`), label: getLocalizedLegalPage(locale, page.slug, legalPages)?.title ?? page.title }));
  return (
    <footer id="contacto" className="border-t border-gold/30 bg-obsidian px-5 py-16 text-warm-gray md:px-10">
      <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1fr]">
        <div><Logo className="justify-items-start" /><p className="mt-4 max-w-sm font-serif leading-relaxed text-stone-400">{t.footer.tagline}</p><div className="mt-6 grid gap-2 text-xs uppercase tracking-[0.14em] text-stone-500"><span>{storeSettings.ownerName}</span><span>NIF {storeSettings.taxId}</span><span>{companyAddress}</span></div></div>
        <div><p className="footer-title">{t.footer.navigation}</p><div className="mt-4 grid gap-3 text-sm uppercase tracking-[0.22em] text-stone-400"><Link href={localizePath("/")}>{t.nav.home}</Link><Link href={localizePath("/#colecao")}>{t.nav.collection}</Link><Link href={localizePath("/#novidades")}>{t.nav.new}</Link><Link href={localizePath("/#best-sellers")}>{t.nav.best}</Link>{upcomingEventPresences.length > 0 && <Link href={localizePath("/#presencas")}>{t.nav.events}</Link>}{publishedSalesLocations.length > 0 && <Link href={localizePath("/#pontos-de-venda")}>{t.nav.sales}</Link>}{publishedTestimonials.length > 0 && <Link href={localizePath("/#testemunhos")}>{t.nav.testimonials}</Link>}<Link href="/area-reservada">{t.nav.reserved}</Link></div></div>
        <div><p className="footer-title">{t.footer.legal}</p><div className="mt-4 grid gap-3 text-sm uppercase tracking-[0.16em] text-stone-400">{legalLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}<CookiePreferencesButton /></div></div>
        <div><p className="footer-title">{t.footer.service}</p><p className="mt-4 font-serif leading-relaxed text-stone-400">{t.footer.serviceText}</p><div className="mt-5 grid gap-3 text-xs font-bold uppercase tracking-[0.16em] text-champagne"><a href={`tel:${storeSettings.contactPhoneInternational}`}>{storeSettings.contactPhoneInternational}</a><a href={`https://wa.me/${storeSettings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a><a href={`mailto:${storeSettings.orderEmail}`}>{storeSettings.orderEmail}</a><a href={storeSettings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a></div></div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[90rem] flex-col gap-3 border-t border-gold/15 pt-6 text-xs uppercase tracking-[0.14em] text-warm-gray/70 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Andrea&apos;s Mystery</span><span>{t.footer.copyright}</span></div>
    </footer>
  );
}


