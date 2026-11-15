"use client";

import type { ReactNode } from "react";
import { portalActions, usePortal } from "@/lib/portal-store";

export type GuideStep = { title: string; text: string };

/* بطاقة تعريف تظهر عند أول دخول للبوابة: من أنت هنا، وماذا ينتظرك، وما الذي يحدث بعد كل خطوة.
   تُخفى بزر، وتعود من زر "دليل البوابة". */
export default function Guide({
  id,
  kicker,
  title,
  lead,
  steps,
  flows,
  extra,
}: {
  id: string;
  kicker: string;
  title: string;
  lead: string;
  steps: GuideStep[];
  /** ما يصل إلى البوابات الأخرى من عملك هنا */
  flows?: string[];
  extra?: ReactNode;
}) {
  const st = usePortal();
  const hidden = st.guides[id] === true;
  if (hidden)
    return (
      <div className="flex justify-end">
        <button type="button" onClick={() => portalActions.setGuide(id, false)} className="rounded-full border border-[#d9d2ca] bg-white px-4 py-1.5 text-xs font-bold text-navy hover:border-navy">
          دليل البوابة
        </button>
      </div>
    );
  return (
    <section aria-label="دليل البوابة" className="overflow-hidden rounded-[16px] bg-white shadow-sm ring-1 ring-teal/30">
      <div className="bg-[#f0f6ea] px-4 py-4 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-orange-text">{kicker}</p>
            <h4 className="mt-1 text-lg font-extrabold text-navy md:text-xl">{title}</h4>
            <p className="mt-1 max-w-3xl text-sm leading-7 text-ink-2">{lead}</p>
          </div>
          <button type="button" onClick={() => portalActions.setGuide(id, true)} aria-label="إخفاء دليل البوابة" className="shrink-0 rounded-full border border-[#d9d2ca] bg-white px-3 py-1 text-xs font-bold text-navy hover:border-navy">
            إخفاء
          </button>
        </div>
      </div>
      <div className="grid gap-5 px-4 py-4 md:px-6 lg:grid-cols-[1.6fr_1fr]">
        <ol className="space-y-3">
          {steps.map((x, i) => (
            <li key={x.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue text-xs font-extrabold text-white">{i + 1}</span>
              <div>
                <p className="text-sm font-extrabold text-navy">{x.title}</p>
                <p className="text-xs leading-6 text-ink-2">{x.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {flows && flows.length > 0 && (
          <div className="rounded-[12px] bg-[#f8f6f3] p-4">
            <p className="text-xs font-extrabold text-navy">ماذا يحدث بعد عملك هنا</p>
            <ul className="mt-2 space-y-2">
              {flows.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs leading-6 text-ink">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {extra && <div className="border-t border-[#eee9e3] px-4 py-3 md:px-6">{extra}</div>}
    </section>
  );
}
