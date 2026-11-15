// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import {
  useReport,
  Body,
  ScreenHeader,
  Card,
  StatusBadge,
  Pill,
} from "./Shell";

export default function CvJobsScreen(__p: any) {
  const {
  periodId: e,
  screens: s,
  stages: l,
  onReport: n,
  onBack: a,
} = __p;
  let r,
    i,
    o,
    d,
    c,
    x = s.cvjobs,
    m = (e) => l.flatMap((e) => e.services).find((t) => t.id === e),
    p = ((r = x.cv.periods), r.includes(e)),
    u = ((i = x.jobs.periods), i.includes(e)),
    b = ((o = x.coop.periods), o.includes(e)),
    h = ((d = x.lifelong.periods), d.includes(e)),
    f = ((c = x.followup.periods), c.includes(e));
  return (
    useReport(
      n,
      "graduate" === e ? x.sees.graduate : u ? x.sees.full : x.sees.cv,
    ),
    (
      <Body>
        <ScreenHeader title={x.title} demo={s.demoNote} onBack={a} />
        {p && (
          <section aria-label={x.cv.title} className="space-y-3">
            <Card className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-navy">{x.cv.title}</h3>
                <StatusBadge status={m(x.cv.serviceId).status} />
              </div>
              <div className="rounded-[12px] border border-dashed border-line bg-bg-soft p-3">
                <p className="text-xs font-bold text-orange-text">
                  {x.cv.sampleTitle}
                </p>
                <p className="mt-1 text-sm font-bold text-navy">
                  {x.cv.sample.headline}
                </p>
                <ul className="mt-1 space-y-1">
                  {x.cv.sample.lines.map((e) => (
                    <li key={e} className="text-sm leading-6 text-ink">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-orange-text">{x.cv.notesTitle}</p>
                <ol className="mt-1 list-decimal space-y-1 ps-5">
                  {x.cv.notes.map((e) => (
                    <li key={e} className="text-sm leading-6 text-ink">
                      {e}
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
            <Card className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-navy">
                {m(x.cv.workshopServiceId).text}
              </span>
              <StatusBadge status={m(x.cv.workshopServiceId).status} />
            </Card>
          </section>
        )}
        {h && (
          <Card className="space-y-1 border-2 border-blue">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-navy">
                {x.lifelong.title}
              </h3>
              <StatusBadge status={m(x.lifelong.serviceId).status} />
            </div>
            <p className="text-sm leading-7 text-ink">
              {m(x.lifelong.serviceId).text}
            </p>
          </Card>
        )}
        {u && (
          <section aria-label={x.jobs.title} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-navy">{x.jobs.title}</h3>
              <StatusBadge status={m(x.jobs.serviceId).status} />
            </div>
            <p className="text-xs leading-6 text-ink-2">{x.jobs.note}</p>
            <ul className="space-y-2">
              {x.jobs.items.map((e) => (
                <li key={e.title}>
                  <Card className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-navy">{e.title}</h4>
                      <Pill>{e.kind}</Pill>
                    </div>
                    <p className="text-xs text-ink-2">{e.org}</p>
                    <p className="text-xs leading-6 text-ink">
                      مطابقة: {e.match}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}
        {b && (
          <Card className="space-y-1 border-2 border-blue">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-navy">
                {x.coop.title} ({x.coop.code})
              </h3>
              <StatusBadge status={m(x.coop.serviceId).status} />
            </div>
            <p className="text-sm leading-7 text-ink">
              {m(x.coop.serviceId).text}
            </p>
          </Card>
        )}
        {f && (
          <Card className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-navy">
                {x.followup.title}
              </h3>
              <StatusBadge status={m(x.followup.serviceId).status} />
            </div>
            <p className="text-sm leading-7 text-ink">{x.followup.text}</p>
          </Card>
        )}
      </Body>
    )
  );
}
