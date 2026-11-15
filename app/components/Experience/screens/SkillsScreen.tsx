// @ts-nocheck
"use client";
// أُعيد توليد هذا الملف من النسخة المبنية بعد فقدان المصدر؛ أسماء المتغيرات الداخلية مختصرة

import { useMemo } from "react";
import { buildSkillIndex, skillStatsAt, centerUnitStatus } from "@/lib/skills";
import DeliveryBadge from "@/app/components/DeliveryBadge";
import { scrollToSection } from "@/lib/scroll";
import {
  periodNum,
  useReport,
  Body,
  ScreenHeader,
  Card,
  Pill,
  ProgressBar,
} from "./Shell";

export default function SkillsScreen(__p: any) {
  const {
  periodId: e,
  screens: n,
  skills: a,
  semesters: r,
  courseSkillMap: i,
  onReport: o,
} = __p;
  let d = n.skills,
    c = periodNum(e),
    x = useMemo(() => buildSkillIndex(r, i, a), [r, i, a]),
    { cats: m } = skillStatsAt(x, a, c),
    p = {
      center: 0,
      optional: 1,
      university: 2,
    },
    u = x.allSkills
      .filter((e) => "university" !== e.delivery)
      .sort((e, t) => p[e.delivery] - p[t.delivery]);
  const firstSem = (sk) =>
    sk.delivery === "university"
      ? Math.min(...(x.bySkill.get(sk.id) ?? []).map((t) => t.semester), 99)
      : Math.min(...(sk.centerSemesters ?? []), 99);
  const grid = {
    total: x.allSkills.length,
    cats: a.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: cat.skills.map((sk) => {
        const f = firstSem(sk);
        const covered = f <= c;
        const cls = !covered
          ? "border-line bg-bg text-ink-2"
          : sk.delivery === "university"
            ? "border-blue bg-blue text-white"
            : sk.delivery === "center"
              ? "border-green bg-green text-white"
              : "border-2 border-dashed border-green bg-bg text-navy";
        return { id: sk.id, name: sk.name, covered, cls, isNew: covered && Math.ceil(f / 2) === Math.ceil(c / 2) && f === c };
      }),
    })),
  };
  const coveredCount = grid.cats.reduce((n, cat) => n + cat.items.filter((i) => i.covered).length, 0);
  return (
    useReport(o, d.sees),
    (
      <Body>
        <ScreenHeader title={d.title} demo={n.demoNote} />
        <Card className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-navy">{d.gridTitle}</h3>
            <Pill>{d.coverageNote}</Pill>
          </div>
          <p className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-navy">
            <span>{d.counter.replace("{n}", String(coveredCount)).replace("{total}", String(grid.total))}</span>
            <span className="text-xs font-semibold text-ink-2">{d.gridUntil.replace("{n}", String(c))}</span>
          </p>
          <div className="space-y-3">
            {grid.cats.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <p className="text-xs font-bold text-ink-2">{cat.name}</p>
                <ul className="grid grid-cols-2 gap-1.5">
                  {cat.items.map((it) => (
                    <li
                      key={it.id}
                      aria-label={`${it.name}: ${it.covered ? d.coveredMark : d.notCoveredMark}`}
                      className={`flex items-start gap-1.5 rounded-[8px] border px-2 py-1.5 text-[11px] font-bold leading-5 ${it.cls}`}
                    >
                      <span aria-hidden="true" className="mt-0.5 shrink-0">{it.covered ? "✓" : "○"}</span>
                      <span>
                        {it.name}
                        {it.isNew && <span className="block text-[10px] font-semibold opacity-90">{d.newBadge}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-2" aria-label="دليل الألوان">
            <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-[3px] bg-blue" />{d.legend.university}</li>
            <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-[3px] bg-green" />{d.legend.center}</li>
            <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-[3px] border-2 border-dashed border-green" />{d.legend.optional}</li>
            <li className="flex items-center gap-1"><span className="h-3 w-3 rounded-[3px] border border-line bg-bg" />{d.legend.none}</li>
          </ul>
        </Card>
        <section aria-label={d.centerTitle} className="space-y-2">
          <h3 className="text-base font-bold text-navy">{d.centerTitle}</h3>
          <ul className="space-y-2">
            {u.map((e) => {
              let s = centerUnitStatus(e, c);
              return (
                <li key={e.id}>
                  <Card className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-navy">
                        {e.name}
                      </span>
                      {<DeliveryBadge delivery={e.delivery} />}
                    </div>
                    {e.centerUnit && (
                      <p className="text-xs leading-6 text-ink-2">
                        {e.centerUnit.title}
                      </p>
                    )}
                    <p
                      className={`text-xs font-bold ${s.started ? "text-navy" : "text-ink-2"}`}
                    >
                      {s.label}
                    </p>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
        <a
          href="#mis"
          onClick={(e) => {
            (e.preventDefault(), scrollToSection("mis"));
          }}
          className="block rounded-[12px] border border-blue px-4 py-3 text-center text-sm font-bold text-orange-text transition-colors hover:bg-bg-soft"
        >
          {d.more}
        </a>
      </Body>
    )
  );
}
