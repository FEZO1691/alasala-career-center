"use client";

import type { JourneyPeriod, JourneyScreenDef, JourneyScreenId, StudentJourney } from "@/lib/data";

type Props = {
  persona: StudentJourney["persona"];
  period: JourneyPeriod;
  /** اسم المرحلة والسنة (من stages.json) */
  stageName: string;
  stageYear: string;
  cards: { id: JourneyScreenId; def: JourneyScreenDef; locked: boolean }[];
  onOpen: (id: JourneyScreenId) => void;
};

// الشاشة الرئيسية في التطبيق: ترحيب، شارة المرحلة والفصل، المهام، الخطوة التالية، وبطاقات الخدمات
export default function HomeScreen({ persona, period, stageName, stageYear, cards, onOpen }: Props) {
  const total = period.tasks.length;
  const done = period.tasks.filter((t) => t.status === "done").length;
  const next = period.tasks.find((t) => t.status === "todo");
  const badge = period.year === null ? stageName : `${stageYear} · الفصل ${period.id}`;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-lg font-extrabold text-navy">مرحبًا، {persona.name}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue px-2.5 py-0.5 text-[11px] font-bold text-white">{badge}</span>
          {period.year !== null && (
            <span className="rounded-full border border-blue px-2.5 py-0.5 text-[11px] font-bold text-orange-text">
              {stageName}
            </span>
          )}
          <span className="text-[11px] font-semibold text-ink-2">{persona.note}</span>
        </p>
      </div>

      <section aria-label="المهام" className="rounded-[12px] border border-line/40 bg-bg-soft p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-navy">المهام</h3>
          <span className="text-xs font-bold text-ink-2">
            {done} من {total}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-line/30"
          role="progressbar"
          aria-label="تقدم المهام"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <span
            className="block h-full rounded-full bg-green transition-[width] duration-300"
            style={{ width: `${(100 * done) / total}%` }}
          />
        </div>
        <ul className="mt-3 space-y-2">
          {period.tasks.map((t) => (
            <li key={t.text} className="flex items-start gap-2 text-sm leading-6 text-ink">
              <span
                aria-hidden="true"
                className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  t.status === "done" ? "border-green bg-green" : "border-line bg-bg"
                }`}
              />
              <span className={t.status === "done" ? "text-ink-2 line-through decoration-line" : ""}>
                {t.text}
                {t.optional && <span className="ms-1 text-[11px] text-ink-2">(اختياري)</span>}
                {t.proposed && <span className="ms-1 text-[11px] text-orange-text">(مقترح)</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="الخطوة التالية" className="rounded-[12px] border-2 border-blue bg-bg p-3">
        <h3 className="text-xs font-bold text-orange-text">الخطوة التالية</h3>
        <p className="mt-1 text-sm font-semibold leading-6 text-navy">
          {next ? next.text : "اكتملت مهام هذه الفترة"}
        </p>
      </section>

      <section aria-label="الخدمات" className="space-y-2">
        <h3 className="text-sm font-bold text-navy">الخدمات</h3>
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-disabled={c.locked || undefined}
            onClick={() => onOpen(c.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-[12px] border border-line/40 bg-bg px-3 py-2.5 text-start transition-colors hover:border-blue ${
              c.locked ? "border-dashed bg-bg-soft" : ""
            }`}
          >
            <span>
              <span className="block text-sm font-bold text-navy">{c.def.title}</span>
              <span className="block text-xs leading-5 text-ink-2">{c.def.summary}</span>
            </span>
            {c.locked && (
              <svg aria-label="مقفلة" role="img" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            )}
          </button>
        ))}
      </section>
    </div>
  );
}
