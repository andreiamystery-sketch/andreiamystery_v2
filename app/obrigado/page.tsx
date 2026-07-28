import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Obrigado pela sua encomenda",
  description: "A sua encomenda Andrea's Mystery foi recebida.",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string }>;
}) {
  const { pedido } = await searchParams;
  const orderNumber = typeof pedido === "string" && /^AM-\d{8}-[A-F0-9]{4}$/.test(pedido)
    ? pedido
    : null;

  return (
    <main className="grid min-h-[70vh] place-items-center px-5 py-16 md:px-10">
      <section className="w-full max-w-3xl border border-champagne/30 bg-pearl px-6 py-14 text-center shadow-2xl md:px-14 md:py-20">
        <span className="success-mark mx-auto grid h-20 w-20 place-items-center rounded-full border border-champagne/50 bg-champagne/10 text-velvet">
          <Check size={38} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="eyebrow mt-8">Encomenda recebida</p>
        <h1 className="mt-4 font-serif text-5xl leading-none md:text-7xl">
          Obrigado pela sua encomenda!
        </h1>
        <p className="mx-auto mt-7 max-w-2xl font-serif text-xl leading-relaxed text-smoke">
          Recebemos o seu pedido e entraremos em contacto consigo para confirmar todos os detalhes.
        </p>
        {orderNumber && (
          <div className="mx-auto mt-8 max-w-md border-y border-champagne/25 py-5">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-smoke">Número da encomenda</span>
            <strong className="mt-2 block font-serif text-2xl text-velvet">{orderNumber}</strong>
          </div>
        )}
        <Link className="premium-button mt-10 inline-flex" href="/">
          Continuar a Comprar
        </Link>
      </section>
    </main>
  );
}
