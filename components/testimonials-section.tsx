import type { Testimonial } from "@/data/testimonials";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section id="testemunhos" className="border-t border-gold/10 bg-black-warm px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Testemunhos</p>
          <h2 className="mt-4 font-serif text-5xl leading-none md:text-7xl">O que dizem as nossas clientes</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote key={testimonial.id} className="border border-gold/25 bg-obsidian p-7">
              {testimonial.rating && (
                <p className="text-champagne" aria-label={`${testimonial.rating} em 5 estrelas`}>
                  {"★".repeat(Math.min(5, Math.max(1, testimonial.rating)))}
                </p>
              )}
              {testimonial.isVerified && (
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-champagne">Compra verificada</p>
              )}
              <p className="mt-5 font-serif text-xl leading-relaxed text-smoke">“{testimonial.text}”</p>
              <footer className="mt-6 border-t border-champagne/20 pt-5">
                <cite className="not-italic">
                  <strong className="block font-serif text-lg text-ivory">{testimonial.customerName}</strong>
                  {(testimonial.location || testimonial.productName) && (
                    <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-smoke">
                      {[testimonial.location, testimonial.productName].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
