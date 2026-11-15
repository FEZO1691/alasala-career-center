"use client";

import { useState } from "react";
import type { OutcomesSample, OutcomesSpec } from "@/lib/data";
import { UniversityDashboard } from "./Platform";

type Props = { spec: OutcomesSpec; sample: OutcomesSample; embedded?: boolean };

const sum = (v: Record<string, number>, ids: string[]) =>
  ids.reduce((a, id) => a + (v[id] ?? 0), 0);

function RateBar({ pct, target }: { pct: number; target?: number }) {
  return (
    <div className="relative mt-3 pb-6">
      <div className="h-4 overflow-hidden rounded-full bg-line/30">
        <div
          className="h-full rounded-full bg-blue transition-[width] duration-300"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {target !== undefined && (
        <>
          <span
            aria-hidden="true"
            className="absolute -top-1 h-6 w-0.5 bg-blue"
            style={{ insetInlineStart: `${target}%` }}
          />
          <span
            className="absolute top-6 translate-x-1/2 whitespace-nowrap text-xs font-bold text-navy"
            style={{ insetInlineStart: `${target}%` }}
          >
            الهدف {target}%
          </span>
        </>
      )}
    </div>
  );
}

export default function Outcomes({ spec, sample, embedded = false }: Props) {
  const [raw, setRaw] = useState<Record<string, string>>(
    Object.fromEntries(spec.fields.map((f) => [f.id, String(sample.values[f.id] ?? 0)]))
  );

  const v: Record<string, number> = Object.fromEntries(
    spec.fields.map((f) => [f.id, Math.max(0, Number(raw[f.id]) || 0)])
  );

  const known = sum(v, spec.knowledge.knownFields);
  const knowledgeRate = v.total ? (100 * known) / v.total : 0;
  const num = sum(v, spec.results.numeratorFields);
  const den = num + sum(v, spec.results.seekingFields);
  const outcomesRate = den ? (100 * num) / den : 0;
  const over = known > v.total;
  const pass = knowledgeRate >= spec.knowledge.target;

  return (
    <section id="results" aria-labelledby="results-title" className={embedded ? "" : "bg-bg"}>
      <div className={embedded ? "" : "mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24"}>
        <div className={`mx-auto max-w-2xl text-center ${embedded ? "hidden" : ""}`}>
          <p className="text-sm font-bold text-orange-text">بوابة الجامعة</p>
          <h2 id="results-title" className="text-2xl font-extrabold text-navy md:text-3xl">
            {spec.sectionTitle}
          </h2>
          <p className="mt-3 leading-8 text-ink-2">{spec.description}</p>
        </div>

        <div className={embedded ? "hidden" : "mt-10"}>
          <UniversityDashboard />
        </div>

        <div className={`mx-auto max-w-2xl text-center ${embedded ? "" : "mt-16"}`}>
          <h3 className="text-xl font-extrabold text-navy md:text-2xl">حاسبة نتائج الخريجين</h3>
          <p className="mt-2 leading-8 text-ink-2">إدخال يدوي مؤقت لأعداد الدفعة، إلى أن تتصل اللوحة ببيانات الطلاب والخريجين تلقائيًا.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* الإدخال */}
          <div className="rounded-[12px] border border-line/40 bg-bg p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-navy">{spec.calculatorTitle}</h3>
              <span className="rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">
                {sample.badge}
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-ink-2">{sample.note}</p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {spec.fields.map((f, i) => (
                <div key={f.id} className={i === 0 ? "col-span-2" : ""}>
                  <label htmlFor={`out-${f.id}`} className="mb-1 block text-sm font-semibold text-ink">
                    {f.label}
                  </label>
                  <input
                    id={`out-${f.id}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={raw[f.id]}
                    onChange={(e) => setRaw((r) => ({ ...r, [f.id]: e.target.value }))}
                    className="w-full rounded-[12px] border border-line bg-bg px-3 py-2 text-ink focus:border-blue focus:outline-2 focus:outline-blue"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* النتيجتان */}
          <div
            aria-live="polite"
            className="rounded-[12px] border border-line/40 bg-bg-soft p-6 shadow-sm"
          >
            {over ? (
              <p className="rounded-[12px] border-2 border-navy bg-bg p-4 font-bold text-navy">
                {spec.messages.over}
              </p>
            ) : (
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-bold text-ink-2">{spec.knowledge.label}</p>
                  <p className="text-xs leading-6 text-ink-2">{spec.knowledge.hint}</p>
                  <p className="text-5xl font-extrabold text-navy">{knowledgeRate.toFixed(1)}%</p>
                  <RateBar pct={knowledgeRate} target={spec.knowledge.target} />
                  <p
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                      pass ? "bg-green text-white" : "border-2 border-navy text-navy"
                    }`}
                  >
                    {pass ? spec.knowledge.pass : spec.knowledge.fail}
                  </p>
                  <p className="mt-2 text-sm text-ink-2">
                    {spec.messages.unknown.replace("{n}", String(v.total - known))}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold text-ink-2">{spec.results.label}</p>
                  <p className="text-5xl font-extrabold text-navy">{outcomesRate.toFixed(1)}%</p>
                  <RateBar pct={outcomesRate} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
