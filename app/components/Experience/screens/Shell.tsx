// @ts-nocheck
"use client";
// عناصر مشتركة بين شاشات التطبيق (أُعيد توليدها من النسخة المبنية، وأسماء المتغيرات الداخلية مختصرة)

import { useEffect } from "react";

export const periodNum = (e) => ("graduate" === e ? 8 : e);

export function useReport(e, t) {
  useEffect(() => {
    e(t);
  }, [e, t]);
}

export function DraftTag(__p: any) {
  const { text: e } = __p;
  return (
    <span className="inline-block rounded-full border border-navy px-2 py-0.5 text-xs font-bold text-navy">
      {e}
    </span>
  );
}

export function Pill(__p: any) {
  const { children: e, tone: s = "line" } = __p;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${"blue" === s ? "border-blue text-orange-text" : "green" === s ? "border-green text-navy" : "border-line text-ink-2"}`}
    >
      {"blue" === s && <span className="h-2 w-2 rounded-full bg-blue" />}
      {"green" === s && <span className="h-2 w-2 rounded-full bg-green" />}
      {e}
    </span>
  );
}

export function StatusBadge(__p: any) {
  const { status: e } = __p;
  return "have" === e ? (
    <Pill tone="green">موجود</Pill>
  ) : (
    <Pill tone="blue">مقترح</Pill>
  );
}

export function ScreenHeader(__p: any) {
  const { title: e, demo: s, onBack: l, children: n } = __p;
  return (
    <header className="space-y-2">
      {l && (
        <button
          type="button"
          onClick={l}
          className="inline-flex items-center gap-1 text-sm font-bold text-orange-text"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4 rtl:rotate-180"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5l-5 5 5 5" />
          </svg>
          الرئيسية
        </button>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold text-navy">{e}</h2>
        <DraftTag text={s} />
      </div>
      {n}
    </header>
  );
}

export function Card(__p: any) {
  const { children: e, className: s = "" } = __p;
  return (
    <div className={`rounded-[12px] border border-line/40 bg-bg p-3 ${s}`}>
      {e}
    </div>
  );
}

export function ProgressBar(__p: any) {
  const { pct: e, tone: s = "blue", label: l } = __p;
  return (
    <div
      role="progressbar"
      aria-label={l}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={e}
      className="h-2.5 overflow-hidden rounded-full bg-line/30"
    >
      <span
        className={`block h-full rounded-full ${"green" === s ? "bg-green" : "teal" === s ? "bg-teal" : "bg-blue"}`}
        style={{
          width: `${e}%`,
        }}
      />
    </div>
  );
}

export function Body(__p: any) {
  const { children: e } = __p;
  return <div className="space-y-4 p-4">{e}</div>;
}
