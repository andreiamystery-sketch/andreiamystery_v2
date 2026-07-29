import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-pearl px-5 py-32 text-center text-ivory">
      <section className="max-w-2xl">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-serif text-5xl md:text-7xl">Página não encontrada</h1>
        <p className="mt-5 text-sm leading-relaxed text-smoke md:text-base">A página que procura já não existe ou mudou de endereço.</p>
        <div className="mt-8 flex justify-center"><Link href="/" className="premium-button">Voltar à loja</Link></div>
      </section>
    </main>
  );
}
