// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { periodNum, useReport, Body, ScreenHeader, Card, Pill } from "./Shell";

export default function PlanScreen(__p: any) {
  const {
  periodId: e,
  screens: s,
  periods: l,
  onReport: n,
} = __p;
  let a = s.plan,
    r = "graduate" === e ? 1 / 0 : periodNum(e);
  return (
    useReport(n, a.sees),
    (
      <Body>
        <ScreenHeader title={a.title} demo={s.demoNote} />
        <p className="text-sm leading-7 text-ink-2">{a.intro}</p>
        <ol className="space-y-3">
          {a.steps.map((s, n) => {
            let i = ((t) => {
                if (r < a.steps[t].opensAt) return "locked";
                let s = a.steps[t + 1];
                return (s && r >= s.opensAt) || "graduate" === e
                  ? "done"
                  : "current";
              })(n),
              o = l.find((e) => e.id === s.periodId);
            return (
              <li key={s.title}>
                <Card
                  className={`space-y-2 ${"current" === i ? "border-2 border-blue" : ""} ${"locked" === i ? "border-dashed" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-base font-bold text-navy">
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${"done" === i ? "bg-blue text-white" : "current" === i ? "bg-blue text-white" : "bg-bg-soft text-ink-2"}`}
                      >
                        {n + 1}
                      </span>
                      {s.title}
                    </h3>
                    <Pill
                      tone={
                        "done" === i
                          ? "green"
                          : "current" === i
                            ? "blue"
                            : "line"
                      }
                    >
                      {a.status[i]}
                    </Pill>
                  </div>
                  {"locked" === i ? (
                    <p className="text-sm leading-7 text-ink-2">
                      {a.opensAtText} {s.opensAt}
                    </p>
                  ) : (
                    <p className="text-sm leading-7 text-ink">{o.headline}</p>
                  )}
                </Card>
              </li>
            );
          })}
        </ol>
      </Body>
    )
  );
}
