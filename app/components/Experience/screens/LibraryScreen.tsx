// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { useReport, Body, ScreenHeader, Card, Pill } from "./Shell";

export default function LibraryScreen(__p: any) {
  const {
  screens: e,
  skills: s,
  onReport: l,
  onBack: n,
} = __p;
  let a = e.library,
    r = Object.fromEntries(
      s.categories.flatMap((e) => e.skills).map((e) => [e.id, e.name]),
    );
  return (
    useReport(l, a.sees),
    (
      <Body>
        <ScreenHeader title={a.title} demo={e.demoNote} onBack={n} />
        <p className="text-sm leading-7 text-ink-2">{a.intro}</p>
        <section aria-label={a.rolesTitle} className="space-y-3">
          <h3 className="text-base font-bold text-navy">{a.rolesTitle}</h3>
          <ul className="space-y-3">
            {a.roles.map((e) => (
              <li key={e.id}>
                <Card className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-navy">{e.title}</h4>
                    {e.draft && <Pill>مبدئي</Pill>}
                  </div>
                  <p className="text-sm leading-7 text-ink">{e.text}</p>
                  <div>
                    <p className="text-xs font-bold text-orange-text">
                      {a.skillsLabel}
                    </p>
                    <ul className="mt-1 flex flex-wrap gap-1.5">
                      {e.skills.map((e) => (
                        <li
                          key={e}
                          className="rounded-full bg-bg-soft px-2.5 py-1 text-xs font-semibold text-navy"
                        >
                          {r[e]}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {e.jobs && e.jobs.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-text">{a.jobsLabel}</p>
                      <ul className="mt-1 space-y-1">
                        {e.jobs.map((j) => (
                          <li
                            key={j.code}
                            className="flex items-center justify-between gap-2 rounded-[8px] bg-bg-soft px-2.5 py-1.5 text-xs font-semibold text-navy"
                          >
                            <span dir="ltr">{j.title}</span>
                            <span className="rounded-full border border-blue px-2 py-0.5 text-orange-text">{j.code}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
        <Card className="space-y-2 border-2 border-blue">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-navy">{a.market.title}</h3>
            {a.market.draft && <Pill>مبدئي</Pill>}
          </div>
          <p className="text-sm leading-7 text-ink">{a.market.text}</p>
        </Card>
      </Body>
    )
  );
}
