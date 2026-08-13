import type { SalesLocation } from "@/data/sales-locations";
import type { Dictionary } from "@/lib/i18n/messages";

export function SalesLocationsSection({
  locations,
  dictionary,
}: {
  locations: SalesLocation[];
  dictionary: Dictionary;
}) {
  const t = dictionary.sections.sales;

  return (
    <section
      id="pontos-de-venda"
      className="border-t border-gold/10 bg-obsidian px-5 py-20 md:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">{t.eyebrow}</p>

          <h2 className="mt-4 font-serif text-5xl leading-none md:text-7xl">
            {t.title}
          </h2>

          <p className="mt-5 font-serif text-lg leading-relaxed text-smoke">
            {t.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <article
              key={location.id}
              className="border border-gold/25 bg-black-warm p-7 transition-all duration-300 hover:border-gold/60"
            >
              <p className="eyebrow">
                {location.type === "partner"
                  ? t.partner
                  : t.store}
              </p>

              <h3 className="mt-4 font-serif text-3xl">
                {location.name}
              </h3>

              <address className="mt-5 not-italic font-serif text-lg leading-relaxed text-smoke">
                {location.address}
                <br />
                {[location.postalCode, location.locality]
                  .filter(Boolean)
                  .join(" ")}
              </address>

              {location.schedule && (
                <p className="mt-4 text-sm uppercase tracking-[0.18em] text-smoke">
                  {t.schedule}
                </p>
              )}

              {location.phone && (
                <p className="mt-4 text-sm text-warm-gray">
                  {location.phone}
                </p>
              )}

              {location.notes && (
                <p className="mt-4 font-serif leading-relaxed text-smoke">
                  {location.notes}
                </p>
              )}

              {/* MAPA INCORPORADO */}

              {location.mapEmbedUrl && (
                <div className="mt-6 overflow-hidden rounded-sm border border-gold/20">
                  <iframe
                    src={location.mapEmbedUrl}
                    title={`${t.map} ${location.name}`}
                    className="h-64 w-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {/* BOTÃO GOOGLE MAPS */}

              {location.mapUrl && (
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t.openMaps}: ${location.name}`}
                  className="premium-button mt-6 inline-flex"
                >
                  {t.openMaps}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
