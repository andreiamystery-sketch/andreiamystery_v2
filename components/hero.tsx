import Image from "next/image";
import { Button } from "@/components/button";

export function Hero() {
  return (
    <section id="marca" className="relative grid min-h-[min(820px,calc(100dvh-80px))] items-center overflow-hidden bg-obsidian">
      <Image
        src="/images/hero/andreas-mystery-hero.jpg"
        alt="Modelo com brincos brilhantes Andrea's Mystery"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[82%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,4,0.98)_0%,rgba(5,5,4,0.9)_34%,rgba(5,5,4,0.25)_68%,rgba(5,5,4,0.05)),linear-gradient(0deg,rgba(5,5,4,0.72),transparent_55%)] max-sm:bg-[linear-gradient(0deg,rgba(5,5,4,0.98)_0%,rgba(5,5,4,0.84)_43%,rgba(5,5,4,0.08)_78%)]" />
      <div className="relative z-10 mx-auto flex min-h-[min(820px,calc(100dvh-80px))] w-full max-w-[90rem] items-end px-5 py-14 sm:items-center md:px-10">
        <div className="max-w-2xl text-ivory">
          <p className="eyebrow">Bijuteria premium</p>
          <h1 className="mt-5 font-serif text-[clamp(3.6rem,9vw,8.5rem)] font-semibold uppercase leading-[0.74] tracking-[-0.035em]">
            <span className="block text-ivory">Andrea&apos;s</span>
            <span className="mt-4 block text-gold">Mystery</span>
          </h1>
          <p className="mt-8 max-w-xl text-xs font-bold uppercase tracking-[0.48em] text-ivory/75 md:text-sm">Reveal your essence</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="#colecao">
              Ver colecao
            </Button>
            <Button href="#marca" variant="ghost">
              A marca
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
