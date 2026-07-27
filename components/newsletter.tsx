import { Button } from "@/components/button";

export function Newsletter() {
  return (
    <section className="bg-pearl px-5 py-20 md:px-10">
      <div className="mx-auto grid max-w-5xl gap-8 border-y border-champagne/25 py-12 md:grid-cols-[0.8fr_1fr] md:items-center">
        <div>
          <p className="eyebrow">Newsletter</p>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">Recebe novidades com brilho discreto.</h2>
        </div>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="email"
            placeholder="O teu email"
            className="min-h-12 border border-champagne/35 bg-porcelain px-4 outline-none focus:border-champagne"
            aria-label="Email"
          />
          <Button type="submit" variant="dark">
            Subscrever
          </Button>
        </form>
      </div>
    </section>
  );
}
