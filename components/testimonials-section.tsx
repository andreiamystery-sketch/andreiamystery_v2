import type { Testimonial } from "@/data/testimonials";
import type { LocaleCode } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/messages";

export function TestimonialsSection({
  testimonials,
  dictionary,
  locale,
}: {
  testimonials: Testimonial[];
  dictionary: Dictionary;
  locale: LocaleCode;
}) {
  const t = dictionary.sections.testimonials;

  return (
    <section
      id="testemunhos"
      className="border-t border-gold/10 bg-black-warm px-5 py-20 md:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="mt-4 font-serif text-5xl leading-none md:text-7xl">
            {t.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className="border border-gold/25 bg-obsidian p-7"
            >
              {testimonial.rating && (
                <p
                  className="text-champagne"
                  aria-label={`${testimonial.rating} ${t.rating}`}
                >
                  {"★".repeat(Math.min(5, Math.max(1, testimonial.rating)))}
                </p>
              )}

              {testimonial.isVerified && (
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-champagne">
                  {t.verified}
                </p>
              )}

              <p className="mt-5 font-serif text-xl leading-relaxed text-smoke">
                “{testimonial.translations?.[locale] ?? testimonial.text}”
              </p>

              <footer className="mt-6 border-t border-champagne/20 pt-5">
                <cite className="not-italic">
                  <strong className="block font-serif text-lg text-ivory">
                    {testimonial.customerName === "Cliente exemplo"
                      ? t.sampleCustomer
                      : testimonial.customerName}
                  </strong>

                  {(testimonial.location || testimonial.productName) && (
                    <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-smoke">
                      {[testimonial.location, testimonial.productName]
                        .filter(Boolean)
                        .join(t.separator)}
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
