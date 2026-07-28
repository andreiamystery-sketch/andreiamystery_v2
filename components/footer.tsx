import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { upcomingEventPresences } from "@/data/events";
import { publishedTestimonials } from "@/data/testimonials";
import { publishedSalesLocations } from "@/data/sales-locations";
import { storeSettings } from "@/data/store-settings";

export function Footer() {
  return (
    <footer id="contacto" className="border-t border-gold/30 bg-obsidian px-5 py-16 text-warm-gray md:px-10">
      <div className="mx-auto grid max-w-[90rem] gap-12 md:grid-cols-[1.25fr_1fr_1fr]">
        <div>
          <Logo className="justify-items-start" />
          <p className="mt-4 max-w-sm font-serif leading-relaxed text-stone-400">
            Bijuteria premium com detalhe, brilho controlado e uma presença silenciosamente memorável.
          </p>
        </div>
        <div>
          <p className="footer-title">Navegação</p>
          <div className="mt-4 grid gap-3 text-sm uppercase tracking-[0.22em] text-stone-400">
  <Link href="/">Início</Link>
  <Link href="/#colecao">Coleção</Link>
  <Link href="/#novidades">Novidades</Link>
  <Link href="/#best-sellers">Best-sellers</Link>
  {upcomingEventPresences.length > 0 && <Link href="/#presencas">Próximas presenças</Link>}
  {publishedSalesLocations.length > 0 && <Link href="/#pontos-de-venda">Pontos de venda</Link>}
  {publishedTestimonials.length > 0 && <Link href="/#testemunhos">Testemunhos</Link>}

  <Link href="/area-reservada">Área Reservada</Link>

  <Link href="/#contacto">Contacto</Link>
</div>
        </div>
        <div>
          <p className="footer-title">Atendimento</p>
          <p className="mt-4 font-serif leading-relaxed text-stone-400">Envios em Portugal e acompanhamento personalizado da encomenda.</p>
          <div className="mt-5 grid gap-3 text-xs font-bold uppercase tracking-[0.16em] text-champagne">
            <a href={`tel:${storeSettings.contactPhoneInternational}`}>
              {storeSettings.contactPhone}
            </a>
            <a href={`https://wa.me/${storeSettings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${storeSettings.orderEmail}`}>
              {storeSettings.orderEmail}
            </a>
            <a href={storeSettings.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[90rem] flex-col gap-3 border-t border-gold/15 pt-6 text-xs uppercase tracking-[0.14em] text-warm-gray/70 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Andrea&apos;s Mystery</span>
        <span>Bijuteria premium · Portugal</span>
      </div>
    </footer>
  );
}
