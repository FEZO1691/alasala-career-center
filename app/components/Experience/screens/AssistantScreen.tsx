// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { useState, useRef, useId, useEffect } from "react";
import { useReport, Pill } from "./Shell";
import type { JourneyScreenId } from "@/lib/data";

export type ChatMsg = {
  id: number;
  from: "bot" | "user";
  text: string;
  draft?: boolean;
  screens?: JourneyScreenId[];
};

export default function AssistantScreen(__p: any) {
  const {
  periodId: e,
  title: l,
  demo: n,
  assistant: a,
  data: r,
  ui: i,
  messages: o,
  setMessages: d,
  screenInfo: c,
  onNavigate: x,
  onReport: m,
} = __p;
  let [p, u] = useState(""),
    b = useRef(null),
    h = useId(),
    f = a.suggestions(e),
    g = useRef(o.length ? Math.max(...o.map((e) => e.id)) + 1 : 0);
  (useReport(m, o.length > 1 ? r.sees.answered : r.sees.start),
    useEffect(() => {
      let e = b.current;
      e && (e.scrollTop = e.scrollHeight);
    }, [o]));
  let j = (t, s) => {
    let l = s ? a.replyById(s, e) : a.answerText(t, e);
    d((e) => [
      ...e,
      {
        id: g.current++,
        from: "user",
        text: t,
      },
      l
        ? {
            id: g.current++,
            from: "bot",
            text: l.text,
            draft: l.draft,
            screens: l.screens,
          }
        : {
            id: g.current++,
            from: "bot",
            text: a.fallback,
          },
    ]);
  };
  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h2 className="text-lg font-extrabold text-navy">{l}</h2>
        <span className="inline-block rounded-full border border-navy px-2 py-0.5 text-xs font-bold text-navy">
          {n}
        </span>
      </div>
      <div
        ref={b}
        role="log"
        aria-live="polite"
        aria-label={i.log}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2"
      >
        {o.map((e) => (
          <div
            key={e.id}
            className={`flex max-w-[92%] flex-col gap-2 ${"user" === e.from ? "self-end" : "self-start"}`}
          >
            <p
              className={`whitespace-pre-line rounded-[12px] px-3 py-2 text-sm leading-7 ${"user" === e.from ? "bg-blue text-white" : "bg-bg-soft text-ink"}`}
            >
              {e.text}
            </p>
            {"bot" === e.from &&
              (e.draft || (e.screens && e.screens.length > 0)) && (
                <div className="flex flex-wrap items-center gap-2">
                  {e.draft && <Pill>مبدئي</Pill>}
                  {e.screens?.map((e) => {
                    let s = c(e);
                    return (
                      <button
                        key={e}
                        type="button"
                        onClick={() => x(e)}
                        className="min-h-10 rounded-full border border-blue px-3 py-1 text-xs font-bold text-orange-text transition-colors hover:bg-bg-soft"
                      >
                        {r.goTo} {s.title}
                        {s.locked ? ` (${r.lockedSuffix})` : ""}
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        ))}
      </div>
      <div className="border-t border-line/40 px-3 py-2">
        <p className="text-xs font-bold text-ink-2">{r.suggestionsLabel}</p>
        <div className="mt-1.5 flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
          {f.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => j(e.question, e.id)}
              className="min-h-9 rounded-full border border-line px-3 py-1 text-start text-xs font-semibold text-navy transition-colors hover:border-blue hover:bg-bg-soft"
            >
              {e.question}
            </button>
          ))}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          let t = p.trim();
          (u(""), t && j(t));
        }}
        className="flex gap-2 border-t border-line/40 p-3"
      >
        <label htmlFor={h} className="sr-only">
          {i.inputLabel}
        </label>
        <input
          id={h}
          type="text"
          value={p}
          onChange={(e) => u(e.target.value)}
          placeholder={i.placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-[12px] border border-ink-2 bg-bg px-3 py-2 text-sm text-ink focus:border-blue focus:outline-2 focus:outline-blue"
        />
        <button
          type="submit"
          className="min-h-10 rounded-[12px] bg-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-bright"
        >
          {i.send}
        </button>
      </form>
    </div>
  );
}
