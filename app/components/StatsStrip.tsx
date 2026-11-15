import type { University } from "@/lib/data";

export default function StatsStrip({ university }: { university: University }) {
  const stats = [
    { value: university.stages.length, label: "مراحل" },
    { value: university.services.length, label: "خدمات" },
    {
      value: university.skills.categories.flatMap((c) => c.skills).length,
      label: "مهارة عامة",
    },
    { value: university.gateways.length, label: "بوابات" },
  ];
  return (
    <section aria-label="المركز بالأرقام" className="bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
        <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center md:px-4 ${i > 0 ? "md:border-s md:border-line/40" : ""}`}
            >
              <dd className="text-4xl font-extrabold text-navy md:text-5xl">
                {s.value}
              </dd>
              <dt className="mt-1 font-semibold text-ink-2">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-center text-xs text-ink-2">
          أرقام تجريبية لنموذج برنامج القانون في كليات الأصالة.
        </p>
      </div>
    </section>
  );
}
