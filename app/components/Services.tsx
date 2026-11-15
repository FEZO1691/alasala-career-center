import type { University } from "@/lib/data";

const badge = {
  must: { label: "أساسي", className: "bg-blue text-white" },
  should: { label: "يُفضّل", className: "border border-blue text-orange-text" },
} as const;

export default function Services({ university }: { university: University }) {
  const { services } = university;
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="border-t border-line/30 bg-bg"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="services-title" className="text-2xl font-extrabold text-navy md:text-3xl">
            الخدمات الثمانية
          </h2>
          <p className="mt-3 leading-8 text-ink-2">
            الخدمات التي يتطلبها معيار NACE، وهي مبنية على دراسة 35 جامعة عالمية.
          </p>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-2">
          <li className="inline-flex items-center gap-2">
            <span className="rounded-full bg-blue px-2.5 py-0.5 text-xs font-bold text-white">
              أساسي
            </span>
            مطلوبة في معيار NACE
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="rounded-full border border-blue px-2.5 py-0.5 text-xs font-bold text-orange-text">
              يُفضّل
            </span>
            موصى بها في معيار NACE
          </li>
        </ul>

        <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((s, i) => {
            const b = badge[s.priority];
            return (
              <li
                key={s.id}
                className="flex flex-col rounded-[12px] border border-line/40 bg-bg p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold leading-snug text-navy">
                    <span className="text-orange-text">{i + 1}.</span> {s.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${b.className}`}
                  >
                    {b.label}
                  </span>
                </div>

                <p className="mt-3 leading-7 text-ink">{s.description}</p>

                {s.tharwati && (
                  <div className="mt-3 rounded-[12px] border border-teal/50 bg-bg px-4 py-3">
                    <span className="inline-block rounded-full bg-teal px-2.5 py-0.5 text-xs font-bold text-white">
                      على منصة مركز المسار المهني
                    </span>
                    <p className="mt-2 text-sm leading-7 text-ink">{s.tharwati}</p>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <div className="rounded-[12px] bg-bg-soft px-4 py-3">
                    <h4 className="text-xs font-bold text-orange-text">ما نستهدفه</h4>
                    <ul className="mt-2 space-y-2">
                      {s.targets.map((tg) => (
                        <li key={tg} className="flex items-start gap-2 text-sm leading-7 text-ink">
                          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                          <span>{tg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
