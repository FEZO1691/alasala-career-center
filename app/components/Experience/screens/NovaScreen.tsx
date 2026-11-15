// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { useState } from "react";
import {
  periodNum,
  useReport,
  Body,
  ScreenHeader,
  Card,
  Pill,
  ProgressBar,
} from "./Shell";

export default function NovaScreen(__p: any) {
  const {
  periodId: e,
  screens: l,
  categories: n,
  onReport: a,
  onBack: __back,
} = __p;
  let r = l.nova,
    i = periodNum(e),
    [o, d] = useState("start"),
    [c, x] = useState(0),
    [m, p] = useState(r.questions.map(() => null)),
    u = i >= 2,
    b = i >= 8;
  useReport(
    a,
    u
      ? b
        ? r.sees.compare
        : r.sees.result
      : "start" === o
        ? r.sees.start
        : "questions" === o
          ? r.sees.questions
          : r.sees.done,
  );
  let h = r.questions[c],
    f = c === r.questions.length - 1;
  return (
    <Body>
      <ScreenHeader title="Nova" demo={l.demoNote} onBack={__back} />
      {!u && "start" === o && (
        <Card className="space-y-3 border-2 border-blue">
          <h3 className="text-base font-bold text-navy">{r.start.title}</h3>
          <p className="text-sm leading-7 text-ink">{r.start.text}</p>
          <button
            type="button"
            onClick={() => d("questions")}
            className="w-full rounded-[12px] bg-blue px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-bright"
          >
            {r.start.button}
          </button>
        </Card>
      )}
      {!u && "questions" === o && (
        <Card className="space-y-3">
          <p className="text-xs font-bold text-ink-2">
            {r.questionsTitle} · {r.questionsOf} {c + 1} / {r.questions.length}
          </p>
          <h3 className="text-base font-bold leading-7 text-navy">{h.text}</h3>
          <div role="radiogroup" aria-label={h.text} className="space-y-2">
            {h.options.map((e, s) => {
              let l = m[c] === s;
              return (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={l}
                  onClick={() => p((e) => e.map((e, t) => (t === c ? s : e)))}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-[12px] border px-3 py-2 text-start text-sm font-semibold transition-colors ${l ? "border-2 border-blue bg-bg-soft text-navy" : "border-line/60 text-ink hover:border-blue"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 rounded-full border-2 ${l ? "border-blue bg-blue" : "border-line"}`}
                  />
                  {e}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={null === m[c]}
            onClick={() => (f ? d("done") : x(c + 1))}
            className="w-full rounded-[12px] bg-blue px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {f ? r.finish : r.next}
          </button>
        </Card>
      )}
      {!u && "done" === o && (
        <Card className="space-y-2 border-2 border-blue">
          <p role="status" className="text-sm font-bold leading-7 text-navy">
            {r.doneMessage}
          </p>
        </Card>
      )}
      {!u && (
        <Card className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-navy">{r.resultLabel}</span>
          <Pill>{r.inProgress}</Pill>
        </Card>
      )}
      {u && (
        <>
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-navy">
                {r.interestsTitle}
              </h3>
              <Pill>{r.interestsNote}</Pill>
            </div>
            <ul className="space-y-3">
              {r.interests.map((e) => (
                <li key={e.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm text-ink">
                    <span>{e.name}</span>
                    <span className="font-bold text-navy">{e.pct}%</span>
                  </div>
                  <ProgressBar pct={e.pct} tone="teal" label={e.name} />
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-navy">{r.skillsTitle}</h3>
              <Pill>{r.skillsNote}</Pill>
            </div>
            <ul className="space-y-3">
              {n.map((e) => (
                <li key={e.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm text-ink">
                    <span>{e.name}</span>
                    <span className="font-bold text-navy">
                      {r.scores[e.id]}%
                    </span>
                  </div>
                  <ProgressBar pct={r.scores[e.id]} label={e.name} />
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
      {b && (
        <Card className="space-y-3 border-2 border-blue">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-navy">{r.compareTitle}</h3>
            <Pill tone="blue">{r.compareBadge}</Pill>
          </div>
          <p className="text-sm leading-7 text-ink-2">{r.compareNote}</p>
          <ul className="space-y-3">
            {n.map((e) => (
              <li key={e.id} className="space-y-1.5">
                <span className="text-sm font-semibold text-ink">{e.name}</span>
                <div className="flex items-center gap-2 text-xs text-ink-2">
                  <span className="w-10 shrink-0">{r.before}</span>
                  <div className="flex-1">
                    <ProgressBar
                      pct={r.scores[e.id]}
                      tone="teal"
                      label={`${e.name} ${r.before}`}
                    />
                  </div>
                  <span className="w-9 text-end font-bold text-navy">
                    {r.scores[e.id]}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-2">
                  <span className="w-10 shrink-0">{r.after}</span>
                  <div className="flex-1">
                    <ProgressBar
                      pct={r.scoresAfter[e.id]}
                      tone="green"
                      label={`${e.name} ${r.after}`}
                    />
                  </div>
                  <span className="w-9 text-end font-bold text-navy">
                    {r.scoresAfter[e.id]}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Body>
  );
}
