import { upcomingEventPresences } from "@/data/events";

function formatEventDate(startDate: string, endDate?: string) {
  const formatter = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" });
  const start = formatter.format(new Date(startDate));
  return endDate ? `${start} — ${formatter.format(new Date(endDate))}` : start;
}

export function EventPresences() {
  if (upcomingEventPresences.length === 0) return null;

  return (
    <section id="presencas" className="border-t border-gold/10 bg-black-warm px-5 py-20 text-ivory md:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Agenda</p>
          <h2 className="mt-4 font-serif text-5xl leading-none md:text-7xl">Próximas presenças</h2>
          <p className="mt-5 font-serif text-lg leading-relaxed text-stone-300">
            Encontra a Andrea&apos;s Mystery em festas, feiras, mercados e romarias.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEventPresences.map((event) => (
            <article key={event.id} className="border border-gold/25 bg-obsidian p-7 transition hover:border-gold/55">
              <p className="eyebrow">{event.location}</p>
              <h3 className="mt-4 font-serif text-3xl">{event.name}</h3>
              <time className="mt-5 block font-serif text-lg text-stone-300" dateTime={event.startDate}>
                {formatEventDate(event.startDate, event.endDate)}
              </time>
              {event.schedule && <p className="mt-2 text-sm uppercase tracking-[0.18em] text-stone-400">{event.schedule}</p>}
              {event.description && <p className="mt-5 font-serif leading-relaxed text-stone-300">{event.description}</p>}
              {event.mapUrl && (
                <a className="ghost-button mt-6" href={event.mapUrl} target="_blank" rel="noreferrer">
                  Ver mapa
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
