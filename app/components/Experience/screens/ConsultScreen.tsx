// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { useState } from "react";
import { useReport, Body, ScreenHeader, Card, Pill } from "./Shell";

export default function ConsultScreen(__p: any) {
  const { screens: e, onReport: l, onBack: n } = __p;
  let a = e.consult,
    [r, i] = useState(null),
    [o, d] = useState(null),
    [c, x] = useState(null),
    [m, p] = useState(!1);
  useReport(l, m ? a.sees.confirmed : a.sees.pick);
  let u = (e) =>
    `min-h-11 rounded-[12px] border px-3 py-2 text-sm font-semibold transition-colors ${e ? "border-2 border-blue bg-bg-soft text-navy" : "border-line/60 text-ink hover:border-blue"}`;
  return (
    <Body>
      <ScreenHeader title={a.title} demo={e.demoNote} onBack={n} />
      {m && null !== r && null !== o && null !== c ? (
        <Card className="space-y-3 border-2 border-green">
          <h3 role="status" className="text-base font-bold text-navy">
            {a.confirmedTitle}
          </h3>
          <dl className="space-y-1 text-sm leading-7 text-ink">
            <div className="flex gap-2">
              <dt className="font-bold text-navy">{a.daysTitle}:</dt>
              <dd>
                {a.days[r]}، {a.times[o]}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-bold text-navy">{a.mentorsTitle}:</dt>
              <dd>
                {a.mentors[c].name} ({a.mentors[c].role})
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => p(!1)}
            className="w-full rounded-[12px] border border-blue px-4 py-2.5 text-sm font-bold text-orange-text transition-colors hover:bg-bg-soft"
          >
            {a.again}
          </button>
        </Card>
      ) : (
        <>
          <p className="text-sm leading-7 text-ink-2">{a.intro}</p>
          <fieldset className="space-y-2">
            <legend className="text-base font-bold text-navy">
              {a.daysTitle}
            </legend>
            <div
              role="radiogroup"
              aria-label="اليوم"
              className="grid grid-cols-3 gap-2"
            >
              {a.days.map((e, s) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={r === s}
                  onClick={() => i(s)}
                  className={u(r === s)}
                >
                  {e}
                </button>
              ))}
            </div>
            <div
              role="radiogroup"
              aria-label="الوقت"
              className="grid grid-cols-3 gap-2"
            >
              {a.times.map((e, s) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={o === s}
                  onClick={() => d(s)}
                  className={u(o === s)}
                >
                  {e}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="flex flex-wrap items-center gap-2 text-base font-bold text-navy">
              {a.mentorsTitle}
              <Pill>{a.mentorNote}</Pill>
            </legend>
            <div
              role="radiogroup"
              aria-label={a.mentorsTitle}
              className="space-y-2"
            >
              {a.mentors.map((e, s) => (
                <button
                  key={e.name}
                  type="button"
                  role="radio"
                  aria-checked={c === s}
                  onClick={() => x(s)}
                  className={`${u(c === s)} flex w-full items-center justify-between text-start`}
                >
                  <span className="font-bold">{e.name}</span>
                  <span className="text-xs text-ink-2">{e.role}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button
            type="button"
            disabled={null === r || null === o || null === c}
            onClick={() => p(!0)}
            className="w-full rounded-[12px] bg-blue px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {a.confirm}
          </button>
        </>
      )}
      <p className="rounded-[12px] border border-dashed border-line px-3 py-2 text-center text-xs font-semibold leading-6 text-ink-2">
        {a.fixedLine}
      </p>
    </Body>
  );
}
