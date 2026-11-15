// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { useReport, Body, ScreenHeader, Card, Pill } from "./Shell";

export default function CertsScreen(__p: any) {
  const {
  periodId: e,
  title: s,
  certificates: l,
  screens: n,
  skills: a,
  onReport: r,
  onBack: i,
} = __p;
  let o = Object.fromEntries(
      a.categories.flatMap((e) => e.skills).map((e) => [e.id, e.name]),
    ),
    d = l.items.filter((t) => "number" == typeof e && t.periods.includes(e));
  return (
    useReport(r, l.sees),
    (
      <Body>
        <ScreenHeader title={s} demo={n.demoNote} onBack={i} />
        <p className="text-sm leading-7 text-ink-2">{l.intro}</p>
        <ul className="space-y-3">
          {d.map((e) => {
            let s = l.delivery[e.delivery];
            return (
              <li key={e.id}>
                <Card className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-navy">{e.name}</h3>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Pill tone="blue">{s.tag}</Pill>
                      {e.draft && <Pill>مبدئي</Pill>}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-navy">{e.title}</p>
                  <p className="text-xs font-semibold text-ink-2">{e.issuer}</p>
                  <p className="text-sm leading-7 text-ink">{e.description}</p>
                  <p className="text-sm leading-7 text-ink">{s.line}</p>
                  <div>
                    <p className="text-xs font-bold text-orange-text">
                      {l.skillsLabel}
                    </p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {e.skills.map((e) => (
                        <li
                          key={e}
                          className="rounded-full bg-bg-soft px-2.5 py-1 text-xs font-semibold text-navy"
                        >
                          {o[e]}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs leading-6 text-ink-2">{e.note}</p>
                </Card>
              </li>
            );
          })}
        </ul>
      </Body>
    )
  );
}
