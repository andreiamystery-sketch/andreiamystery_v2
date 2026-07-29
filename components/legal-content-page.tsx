import Link from "next/link";
import { storeSettings } from "@/data/store-settings";
import type { LegalPage } from "@/data/legal";

export function LegalContentPage({ page }: { page: LegalPage }) {
  return (
    <main className="bg-pearl px-5 pb-20 pt-32 text-ivory md:px-10 md:pt-40">
      <section className="mx-auto max-w-5xl">
        <p className="eyebrow">Andrea&apos;s Mystery</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">{page.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-smoke md:text-lg">{page.description}</p>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-champagne">Última atualização: {page.updatedAt}</p>
      </section>

      <section className="mx-auto mt-12 grid max-w-5xl gap-6">
        {page.sections.map((section) => (
          <article key={section.title} className="border border-champagne/20 bg-obsidian/45 p-6 md:p-8">
            <h2 className="font-serif text-3xl text-ivory">{section.title}</h2>
            <div className="mt-5 grid gap-4 text-sm leading-relaxed text-smoke md:text-base">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      {page.slug === "contactos" && (
        <section className="mx-auto mt-10 grid max-w-5xl gap-4 border border-champagne/25 bg-obsidian p-6 text-sm uppercase tracking-[0.16em] text-champagne md:grid-cols-2 md:p-8">
          <a href={`tel:${storeSettings.contactPhoneInternational}`}>{storeSettings.contactPhone}</a>
          <a href={`mailto:${storeSettings.orderEmail}`}>{storeSettings.orderEmail}</a>
          <a href={`https://wa.me/${storeSettings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={storeSettings.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
        </section>
      )}

      <section className="mx-auto mt-10 max-w-5xl">
        <Link href="/" className="ghost-button">Voltar à loja</Link>
      </section>
    </main>
  );
}
