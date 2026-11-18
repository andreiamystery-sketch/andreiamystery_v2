import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function BusinessEntry({ locale, jewelryContent, engravingContent, sharedContent }: { locale: string; jewelryContent: ReactNode; engravingContent: ReactNode; sharedContent: ReactNode }) {
  const isPortuguese = locale === "pt";

  return (
    <main className="bg-[#090807] text-[#f4ead7]">
      <div className="business-entry-columns grid md:grid-cols-2">
        <Link href={`/${locale}/bijuteria`} className="group relative isolate flex min-h-[72svh] items-end overflow-hidden border-b border-[#d0ae6d]/60 px-7 pb-12 pt-28 md:min-h-[100svh] md:border-b-0 md:border-r md:px-10 md:pb-16 lg:px-16">
          <Image src="/images/lifestyle/editorial-jewelry.jpg" alt="Coleção elegante de bijuteria Andrea's Mystery" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="-z-20 object-cover object-center transition-transform duration-1000 group-hover:scale-[1.035]" />
          <span className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(0,0,0,.88),rgba(0,0,0,.12)_76%),linear-gradient(90deg,rgba(0,0,0,.32),transparent)]" />
          <span className="absolute left-7 top-7 flex items-center gap-3 text-[#f1dfb6] md:left-10 md:top-10 lg:left-16"><span className="grid h-11 w-11 place-items-center border border-[#d0ae6d]/75 font-serif text-lg">AM</span><span className="text-[0.62rem] font-bold uppercase tracking-[0.3em]">Andrea&apos;s Mystery</span></span>
          <span className="max-w-xl transition-transform duration-500 group-hover:-translate-y-1">
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[#e3c47c]">{isPortuguese ? "Bijuteria premium" : "Premium jewellery"}</span>
            <span className="mt-4 block font-serif text-[clamp(3.4rem,7vw,6rem)] leading-[0.88]">BIJUTERIA</span>
            <span className="mt-5 block max-w-md font-serif text-lg leading-relaxed text-white/80">{isPortuguese ? "Descubra as coleções, novidades e peças favoritas da Andrea’s Mystery." : "Discover Andrea’s Mystery collections, new arrivals and favourite pieces."}</span>
            <span className="mt-8 inline-flex min-h-12 items-center border border-[#dfbd72] bg-[#d2aa55] px-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#17120a] transition-colors group-hover:bg-[#ead29a]">{isPortuguese ? "VER CATÁLOGO" : "EXPLORE THE COLLECTION"}<span className="ml-4 text-lg" aria-hidden="true">↗</span></span>
          </span>
          <span aria-hidden="true" className="absolute bottom-6 right-7 hidden text-xs uppercase tracking-[0.24em] text-white/70 md:block">01 / 02</span>
        </Link>

        <Link href={`/${locale}/gravacoes`} className="group relative isolate flex min-h-[72svh] items-end overflow-hidden px-7 pb-12 pt-28 md:min-h-[100svh] md:px-10 md:pb-16 lg:px-16">
          <Image src="/images/gravacoes/coracao-familia-prata-foto.jpg" alt="Medalhão de coração prateado personalizado com fotografia" fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-20 object-cover object-center transition-transform duration-1000 group-hover:scale-[1.035]" />
          <span className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(0,0,0,.9),rgba(0,0,0,.16)_76%),linear-gradient(90deg,rgba(0,0,0,.3),transparent)]" />
          <span className="absolute right-7 top-8 text-right text-[0.6rem] font-bold uppercase tracking-[0.28em] text-[#e3c47c] md:right-10 md:top-10">{isPortuguese ? "A tua história, gravada" : "Your story, engraved"}</span>
          <span className="max-w-xl transition-transform duration-500 group-hover:-translate-y-1">
            <span className="block text-[0.65rem] font-bold uppercase tracking-[0.32em] text-[#e3c47c]">Andrea&apos;s Mystery · {isPortuguese ? "Peças únicas" : "One of a kind"}</span>
            <span className="mt-4 block max-w-lg font-serif text-[clamp(2.8rem,5.7vw,5rem)] leading-[0.9]">{isPortuguese ? "GRAVAÇÕES PERSONALIZADAS" : "PERSONAL ENGRAVINGS"}</span>
            <span className="mt-5 block max-w-md font-serif text-lg leading-relaxed text-white/80">{isPortuguese ? "Transformamos fotografias, nomes e memórias em peças únicas." : "We turn photographs, names and memories into one-of-a-kind pieces."}</span>
            <span className="mt-8 inline-flex min-h-12 items-center border border-[#dfbd72] bg-[#d2aa55] px-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#17120a] transition-colors group-hover:bg-[#ead29a]">{isPortuguese ? "DESCOBRIR GRAVAÇÕES" : "DISCOVER ENGRAVINGS"}<span className="ml-4 text-lg" aria-hidden="true">↗</span></span>
          </span>
          <span aria-hidden="true" className="absolute bottom-6 right-7 hidden text-xs uppercase tracking-[0.24em] text-white/70 md:block">02 / 02</span>
        </Link>
      </div>

      <div className="business-entry-columns grid border-t border-[#d0ae6d]/35 md:grid-cols-2">
        <div className="min-w-0 border-b border-[#d0ae6d]/30 md:border-b-0 md:border-r">{jewelryContent}</div>
        <div className="min-w-0">{engravingContent}</div>
      </div>
      <div className="border-t border-[#d0ae6d]/35">{sharedContent}</div>
    </main>
  );
}
