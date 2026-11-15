"use client";

import { useState } from "react";
import type { Certificates, JourneyPeriod, Stage, StudentJourney, StudentScreens, University } from "@/lib/data";
import StudentAvatar from "../StudentAvatar";
import { Body, Card, Pill, ScreenHeader, useReport } from "./Shell";

type Props = {
  title: string;
  persona: StudentJourney["persona"];
  periods: JourneyPeriod[];
  periodId: JourneyPeriod["id"];
  stages: Stage[];
  screens: StudentScreens;
  skills: University["skills"];
  certificates: Certificates;
  onReport: (s: string | null) => void;
};

// ملفي: ملف الطالب ينمو مع كل سنة. كل الأرقام تُحسب من رحلة الطالب (المهام، الخدمات، مهارات المركز)
export default function PortfolioScreen({
  title,
  persona,
  periods,
  periodId,
  stages,
  screens,
  skills,
  certificates,
  onReport,
}: Props) {
  const ui = screens.portfolio;
  const [shared, setShared] = useState(false);
  useReport(onReport, ui.sees);

  const idx = periods.findIndex((p) => p.id === periodId);
  const reached = periods.slice(0, idx + 1);
  const current = periods[idx];
  const stage = stages.find((s) => s.id === current.stageId)!;

  // الفصول السابقة تُعدّ مكتملة، وفي الفصل الحالي تُحسب المهام المنجزة فقط
  const taskDone = (p: JourneyPeriod) => (p === current ? p.tasks.filter((t) => t.status === "done") : p.tasks);
  const tasksCount = reached.reduce((n, p) => n + taskDone(p).length, 0);
  const servicesCount = new Set(reached.flatMap((p) => p.services)).size;
  const skillIds = new Set(reached.flatMap((p) => p.centerUnits));
  const skillsCount = skillIds.size;
  void skills;

  const certs =
    typeof periodId === "number" ? certificates.items.filter((c) => c.periods.includes(periodId)) : [];

  const counters = [
    { n: tasksCount, label: ui.counters.tasks },
    { n: servicesCount, label: ui.counters.services },
    { n: skillsCount, label: ui.counters.skills },
  ];

  return (
    <Body>
      <ScreenHeader title={title} demo={screens.demoNote} />

      <Card className="flex items-center gap-3 bg-bg-soft">
        <StudentAvatar stage={current.stageId} size={64} />
        <div className="min-w-0">
          <p className="text-base font-extrabold text-navy">{persona.name}</p>
          <p className="text-xs font-semibold text-ink-2">{persona.major}</p>
          <p className="mt-1">
            <span className="rounded-full bg-blue px-2.5 py-0.5 text-[11px] font-bold text-white">{stage.year}</span>
          </p>
        </div>
      </Card>
      <p className="text-sm leading-7 text-ink-2">{ui.caption}</p>

      <ul className="grid grid-cols-3 gap-2" aria-label="ملخص">
        {counters.map((c) => (
          <li key={c.label} className="rounded-[12px] border border-line/40 bg-bg px-2 py-3 text-center">
            <span className="block text-2xl font-extrabold text-navy">{c.n}</span>
            <span className="block text-[11px] font-semibold leading-5 text-ink-2">{c.label}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-5 text-ink-2">{ui.pastNote}</p>

      <section aria-label={ui.timelineLabel} className="space-y-3">
        <h3 className="text-sm font-bold text-navy">{ui.timelineLabel}</h3>
        <ol className="space-y-3">
          {stages.map((st) => {
            const inStage = periods.filter((p) => p.stageId === st.id);
            const stageIdx = inStage.map((p) => periods.indexOf(p));
            const started = stageIdx.some((i) => i <= idx);
            const isNow = st.id === current.stageId;
            return (
              <li key={st.id} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                    isNow ? "border-blue bg-blue" : started ? "border-green bg-green" : "border-line bg-bg"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-navy">
                    {st.year}
                    {isNow && <Pill tone="blue">{ui.nowLabel}</Pill>}
                  </p>
                  {!started ? (
                    <p className="mt-1 text-xs leading-6 text-ink-2">{ui.futureLine.replace("{year}", st.year)}</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {inStage
                        .filter((p) => periods.indexOf(p) <= idx)
                        .flatMap((p) =>
                          p.tasks.map((t) => ({
                            key: `${p.id}-${t.text}`,
                            text: t.text,
                            done: p !== current || t.status === "done",
                            proposed: t.proposed,
                          }))
                        )
                        .map((t) => (
                          <li key={t.key} className="flex items-start gap-2 text-xs leading-6 text-ink">
                            <span
                              aria-hidden="true"
                              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                                t.done ? "border-green bg-green" : "border-line bg-bg"
                              }`}
                            />
                            <span className={t.done ? "" : "text-ink-2"}>
                              {t.text}
                              {!t.done && <span className="ms-1 text-[11px] text-orange-text">({ui.todoLabel})</span>}
                              {t.proposed && <span className="ms-1 text-[11px] text-orange-text">(مقترح)</span>}
                            </span>
                          </li>
                        ))}
                      {isNow && certs.length > 0 && (
                        <li className="pt-1">
                          <p className="text-[11px] font-bold text-orange-text">{ui.certsLabel}</p>
                          <ul className="mt-1 flex flex-wrap gap-1.5">
                            {certs.map((c) => (
                              <li
                                key={c.id}
                                className="rounded-full bg-bg-soft px-2.5 py-1 text-xs font-semibold text-navy"
                              >
                                {c.name}
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShared(true)}
          className="flex w-full items-center justify-between gap-2 rounded-[12px] border-2 border-blue bg-bg px-3 py-2.5 text-start text-sm font-bold text-orange-text"
        >
          <span>{ui.share.label}</span>
          <Pill tone="blue">{ui.share.tag}</Pill>
        </button>
        {shared && (
          <p role="status" className="text-xs leading-6 text-ink-2">
            {ui.share.note}
          </p>
        )}
      </div>
    </Body>
  );
}
