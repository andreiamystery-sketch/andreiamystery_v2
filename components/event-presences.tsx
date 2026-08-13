import type { LocaleCode } from "@/config/locales";
import { upcomingEventPresences } from "@/data/events";
import type { Dictionary } from "@/lib/i18n/messages";

function formatEventDate(locale: LocaleCode, startDate: string, endDate?: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const start = formatter.format(new Date(startDate));
  return endDate ? `${start} - ${formatter.format(new Date(endDate))}` : start;
}

export function EventPresences({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: LocaleCode;
}) {
  if (upcomingEventPresences.length === 0) return null;

  const t = dictionary.sections.events;

  return (
    <section
      id="presencas"
      className="border-t border-gold/10 bg-black-warm px-5 py-20 text-ivory md:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="mt-4 font-serif text-5xl leading-none md:text-7xl">
            {t.title}
          </h2>
          <p className="mt-5 font-serif text-lg leading-relaxed text-stone-300">
            {t.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEventPresences.map((event) => (
            <article
              key={event.id}
              className="border border-gold/25 bg-obsidian p-7 transition hover:border-gold/55"
            >
              <p className="eyebrow">{event.location}</p>
              <h3 className="mt-4 font-serif text-3xl">{event.name}</h3>
              <time
                className="mt-5 block font-serif text-lg text-stone-300"
                dateTime={event.startDate}
              >
                {formatEventDate(locale, event.startDate, event.endDate)}
              </time>
              {event.schedule && (
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-400">
                  {event.schedule}
                </p>
              )}
              {event.description && (
                <p className="mt-5 font-serif leading-relaxed text-stone-300">
                  {event.description}
                </p>
              )}
              {event.mapUrl && (
                <a
                  className="ghost-button mt-6"
                  href={event.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.map}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
