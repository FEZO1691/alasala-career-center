"use client";

import { useState } from "react";
import type { Stage } from "@/lib/data";
import ImageSlot from "./ImageSlot";
import AppPreview from "./AppPreview";

const IMG_LABEL: Record<number, string> = {
  1: "طلاب في أول أسبوع مع جلسة تفسير التقييم",
  2: "لقاء مع خريجين أو زيارة شركة",
  3: "ورشة السيرة الذاتية ومقابلة تجريبية",
  4: "معرض التوظيف وتحدي أعمال",
  5: "خريجون في بيئة العمل",
};

const NUM = ["١", "٢", "٣", "٤", "٥"];

export default function Journey({ stages }: { stages: Stage[] }) {
  const [idx, setIdx] = useState(0);
  const cur = stages[idx];
  const go = (i: number) => setIdx(Math.max(0, Math.min(stages.length - 1, i)));
  const pct = (idx / (stages.length - 1)) * 100;

  const onKeyDown = (e: React.KeyboardEvent) => {
    let n = idx;
    if (e.key === "ArrowLeft") n = idx + 1;
    else if (e.key === "ArrowRight") n = idx - 1;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = stages.length - 1;
    else return;
    e.preventDefault();
    go(n);
    document.getElementById(`tab-${stages[Math.max(0, Math.min(stages.length - 1, n))].id}`)?.focus();
  };

  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-20 bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">من أول سنة حتى بعد التخرج</p>
          <h2 id="journey-title" className="mt-1 text-2xl font-extrabold text-navy md:text-3xl">
            رحلة الطالب
          </h2>
          <p className="mt-3 leading-8 text-ink-2">
            خمس محطات يمرّ بها كل طالب. اضغط محطة لترى ما يحدث فيها.
          </p>
        </div>

        {/* مسار المحطات */}
        <div className="mt-10 overflow-x-auto pb-2">
          <div role="tablist" aria-label="محطات الرحلة" onKeyDown={onKeyDown} className="relative mx-auto flex min-w-[560px] max-w-4xl justify-between">
            <div aria-hidden="true" className="absolute inset-x-7 top-7 h-1 rounded-full bg-line/50" />
            <div
              aria-hidden="true"
              className="absolute right-7 top-7 h-1 rounded-full bg-teal transition-all duration-500"
              style={{ width: `calc((100% - 3.5rem) * ${pct / 100})` }}
            />
            {stages.map((s, i) => {
              const on = i === idx;
              const done = i < idx;
              return (
                <button
                  key={s.id}
                  id={`tab-${s.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls="journey-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => go(i)}
                  className="group relative z-[1] flex w-28 flex-col items-center text-center"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full border-4 text-xl font-extrabold transition-all duration-300 ${
                      on
                        ? "scale-110 border-gold bg-blue text-white shadow-lg"
                        : done
                          ? "border-teal bg-teal text-white"
                          : "border-line/60 bg-bg text-navy group-hover:border-teal"
                    }`}
                  >
                    {done ? "✓" : NUM[i]}
                  </span>
                  <span className={`mt-2 text-sm font-bold ${on ? "text-navy" : "text-ink-2"}`}>{s.name}</span>
                  <span className="text-xs text-ink-2">{s.year}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* اللوحة */}
        <div
          id="journey-panel"
          role="tabpanel"
          aria-labelledby={`tab-${cur.id}`}
          key={cur.id}
          className="jr-fade mt-8 grid overflow-hidden rounded-[20px] border border-line/40 bg-bg-soft shadow-sm md:grid-cols-5"
        >
          <div className="relative md:col-span-2">
            <ImageSlot label={IMG_LABEL[cur.id] ?? "صورة المحطة"} src={`./images/j-${cur.id}.jpg`} ratio="auto" tone="dark" className="h-full min-h-60" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e1e1e]/90 to-transparent p-5 text-white">
              <span className="text-5xl font-extrabold leading-none text-gold/90">{NUM[idx]}</span>
              <p className="mt-1 text-lg font-extrabold">{cur.name}</p>
              <p className="text-sm opacity-85">{cur.year}</p>
            </div>
          </div>

          <div className="space-y-6 p-6 md:col-span-3 md:p-8">
            <div>
              <h3 className="text-sm font-bold text-orange-text">هدف المحطة</h3>
              <p className="mt-1 text-xl font-bold leading-9 text-navy">{cur.goal}</p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-orange-text">ماذا يحصل للطالب هنا</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {cur.services.map((s) => {
                  const have = s.status === "have";
                  return (
                    <li key={s.text} className="flex gap-3 rounded-[12px] border border-line/40 bg-bg p-3">
                      <span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 rounded-full ${have ? "bg-green" : "bg-blue"}`} />
                      <span className="text-sm leading-7 text-ink">
                        {s.text}
                        <span className={`ms-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${have ? "bg-green/15 text-green" : "bg-blue/10 text-orange-text"}`}>
                          {have ? "موجود في الجامعة" : "يضيفه المركز"}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold text-orange-text">كيف نقيس النجاح</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {cur.kpis.map((k) => (
                  <li key={k} className="rounded-[12px] bg-blue px-4 py-3 text-sm leading-7 text-white">
                    {k}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-line/40 pt-4">
              <button
                type="button"
                onClick={() => go(idx - 1)}
                disabled={idx === 0}
                className="rounded-full border border-navy px-5 py-2 text-sm font-bold text-navy disabled:opacity-30"
              >
                المحطة السابقة
              </button>
              <span className="text-xs text-ink-2">
                {idx + 1} من {stages.length}
              </span>
              <button
                type="button"
                onClick={() => go(idx + 1)}
                disabled={idx === stages.length - 1}
                className="rounded-full bg-blue px-5 py-2 text-sm font-bold text-white disabled:opacity-30"
              >
                المحطة التالية
              </button>
            </div>
          </div>
        </div>

        <div id="app" className="mt-8 grid scroll-mt-24 items-center gap-8 rounded-[20px] border border-line/40 bg-bg-soft p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <p className="text-sm font-bold text-orange-text">التطبيق</p>
            <h3 className="mt-1 text-xl font-extrabold text-navy md:text-2xl">{idx === 4 ? "تطبيق الخريج في جيبك" : "تطبيق الطالب في جيبك"}</h3>
            <p className="mt-2 leading-8 text-ink-2">
              {idx === 4
                ? "الوظائف، وطلبات إرشاد الطلاب، والشهادات المهنية، ووضعك المهني. كلها في تطبيق واحد."
                : "مهام محطتك، والوظائف المطابقة، وحجز الإرشاد، والشهادات، وجداراتك. في تطبيق واحد."}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              <li>• يعمل على بيانات البوابات نفسها، فما تفعله فيه يصل المركز وأصحاب العمل والجامعة.</li>
              <li>• يتغير بتغير المحطة التي اخترتها فوق.</li>
              <li>• جرّب الأيقونات أسفل الشاشة. المعاينة للعرض فقط.</li>
            </ul>
          </div>
          <AppPreview stage={cur} idx={idx} />
        </div>
      </div>
    </section>
  );
}
