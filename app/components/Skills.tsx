"use client";

import { useMemo, useState } from "react";
import type { Skill, University } from "@/lib/data";
import {
  buildSkillIndex,
  centerUnitStatus,
  planLine,
  semestersText,
  skillStatsAt,
  skillsText,
  unitsText,
} from "@/lib/skills";
import DeliveryBadge from "./DeliveryBadge";

type Props = {
  semesters: University["semesters"];
  courseSkillMap: University["courseSkillMap"];
  /** وسم حالة الربط ("ربط تجريبي") */
  mapStatus: string;
  /** مواد اختيارية خارج الربط ("اختياري، غير مصنّف") */
  unclassified: University["unclassifiedCourses"];
  skills: University["skills"];
  /** ملاحظة الجامعة تحت تنبيه أضعف فئة ومهارة */
  gapNote: string;
  /** داخل بوابة الجامعة: بلا عنوان القسم وهوامشه */
  embedded?: boolean;
};

type Filter = "all" | Skill["delivery"];

const DEFAULT_SEMESTER = 3;
const MAX_NAMES = 4;

const DELIVERY_ORDER: Record<Skill["delivery"], number> = { center: 0, optional: 1, university: 2 };

const FILTERS: { id: Filter; label: string; dot?: string }[] = [
  { id: "all", label: "الكل" },
  { id: "university", label: "تغطيها الجامعة", dot: "bg-green" },
  { id: "center", label: "يغطيها المركز", dot: "bg-blue" },
  { id: "optional", label: "وحدات اختيارية", dot: "bg-teal" },
];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 text-orange-text transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

const names = (list: string[]) =>
  list.length > MAX_NAMES
    ? `${list.slice(0, MAX_NAMES).join("، ")} وغيرها`
    : list.join("، ");

export default function Skills({
  semesters,
  courseSkillMap,
  mapStatus,
  unclassified,
  skills,
  gapNote,
  embedded = false,
}: Props) {
  const index = useMemo(
    () => buildSkillIndex(semesters, courseSkillMap, skills),
    [semesters, courseSkillMap, skills]
  );
  const { courseName, bySkill, allSkills } = index;

  const label = (code: string) => {
    const n = courseName.get(code);
    return n ? `${code} ${n}` : code;
  };

  // أعداد المهارات حسب جهة التقديم (من البيانات)
  const counts = {
    all: allSkills.length,
    university: allSkills.filter((s) => s.delivery === "university").length,
    center: allSkills.filter((s) => s.delivery === "center").length,
    optional: allSkills.filter((s) => s.delivery === "optional").length,
  };

  // تغطية الفئات والتنبيه تُحسب من مهارات الجامعة فقط (المنطق في lib/skills.ts)
  const statsFor = (n: number) => skillStatsAt(index, skills, n);

  const [sem, setSem] = useState(DEFAULT_SEMESTER);
  const [filter, setFilter] = useState<Filter>("all");
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set([statsFor(DEFAULT_SEMESTER).weakestCat.id])
  );

  const st = statsFor(sem);
  const matches = (s: Skill) => filter === "all" || s.delivery === filter;

  // عند اختيار مرشّح معيّن نفتح كل الفئات التي فيها مهارات مطابقة، وعند "الكل" نفتح الفئة الأضعف
  const changeFilter = (f: Filter) => {
    setFilter(f);
    setOpenIds(
      f === "all"
        ? new Set([st.weakestCat.id])
        : new Set(skills.categories.filter((c) => c.skills.some((s) => s.delivery === f)).map((c) => c.id))
    );
  };

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section id="mis" aria-labelledby="mis-title" className={embedded ? "" : "bg-bg-soft"}>
      <div className={embedded ? "" : "mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24"}>
        <div className={`mx-auto max-w-2xl text-center ${embedded ? "hidden" : ""}`}>
          <p className="text-sm font-bold text-orange-text">بوابة الجامعة</p>
          <h2 id="mis-title" className="text-2xl font-extrabold text-navy md:text-3xl">
            ملف المهارات
          </h2>
          <p className="mt-3 leading-8 text-ink-2">
            المركز لا يكرر ما تقدمه مقررات الجامعة، وإنما يكمّل ما ينقصها. اختر فصلًا لترى التغطية حتى ذلك الفصل.
          </p>
        </div>

        {/* ملخص من البيانات ومرشّحات جهة التقديم */}
        <div className="mt-8 rounded-[12px] border border-line/40 bg-bg p-4 sm:p-5">
          <p className="font-bold leading-8 text-navy">
            الجامعة تغطي {skillsText(counts.university, true)} من خلال مقرراتها، والمركز يغطي {counts.center}
            {counts.optional > 0 && `، وتتوفر ${unitsText(counts.optional)}`}.
          </p>
          <div role="group" aria-label="تصفية المهارات" className="mt-3 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => changeFilter(f.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                    on
                      ? "border-blue bg-blue text-white"
                      : "border-line bg-bg text-navy hover:border-blue hover:bg-bg-soft"
                  }`}
                >
                  {f.dot && (
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${f.dot} ${on ? "ring-2 ring-white" : ""}`}
                    />
                  )}
                  {f.label} ({counts[f.id]})
                </button>
              );
            })}
          </div>
        </div>

        {/* اختيار الفصل */}
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-bold text-navy">الفصل الدراسي</h3>
          <div role="group" aria-label="اختيار الفصل" className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {semesters.map((s) => {
              const on = s.semester === sem;
              return (
                <button
                  key={s.semester}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSem(s.semester)}
                  className={`rounded-[12px] border-2 px-2 py-3 text-center transition-colors ${
                    on
                      ? "border-blue bg-blue text-white"
                      : "border-line/50 bg-bg text-navy hover:bg-bg-soft"
                  }`}
                >
                  <span className="block text-xs opacity-90">الفصل</span>
                  <span className="block text-2xl font-extrabold leading-tight">{s.semester}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* أضعف فئة ومهارة في الفصل المختار (محسوبة من مهارات الجامعة) */}
        <div
          role="status"
          className={`mt-6 rounded-[12px] border-2 bg-bg p-5 ${
            st.complete ? "border-green" : "border-navy"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
                st.complete ? "bg-green" : "bg-blue"
              }`}
            >
              {st.complete ? "مكتملة" : "أضعف نقطة"}
            </span>
            <p className="font-bold text-navy">
              {st.complete
                ? `جميع مهارات الجامعة مغطاة 100% في الفصل ${sem}`
                : `أضعف فئة في الفصل ${sem}: ${st.weakestCat.name} (${st.weakestCat.pct}%)`}
            </p>
          </div>
          {!st.complete && (
            <div className="mt-3 space-y-1 leading-7 text-ink-2">
              {st.minSkill > 0 && (
                <p>
                  أضعف المهارات تغطية: {names(st.weakestSkills.map((s) => s.name))} ({st.minSkill}%).
                </p>
              )}
              {st.notYet.length > 0 && (
                <p>
                  مهارات غير مغطاة بعد في مقررات الجامعة ({st.notYet.length}):{" "}
                  {names(st.notYet.map((s) => s.name))}.
                </p>
              )}
            </div>
          )}
        </div>
        <p className="mt-2 text-xs leading-6 text-ink-2">{gapNote}</p>

        {/* الفئات الخمس */}
        <ul className="mt-6 space-y-3">
          {st.cats.map((c) => {
            const open = openIds.has(c.id);
            const weakest = !st.complete && c.pct !== null && c.id === st.weakestCat.id;
            // الترتيب داخل الفئة: مهارات المركز أولًا، ثم الاختيارية، ثم مهارات الجامعة
            const visible = c.skills
              .filter(matches)
              .sort((a, b) => DELIVERY_ORDER[a.delivery] - DELIVERY_ORDER[b.delivery]);
            return (
              <li
                key={c.id}
                className={`overflow-hidden rounded-[12px] border bg-bg ${
                  weakest ? "border-navy" : "border-line/40"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`cat-${c.id}`}
                  onClick={() => toggle(c.id)}
                  className="flex w-full items-center gap-4 px-4 py-4 text-start"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-bold text-navy">{c.name}</span>
                      {weakest && (
                        <span className="rounded-full bg-blue px-2.5 py-0.5 text-[11px] font-bold text-white">
                          الأضعف
                        </span>
                      )}
                    </span>
                    {c.pct !== null ? (
                      <span className="mt-2 flex items-center gap-3">
                        <span
                          className="h-3 flex-1 overflow-hidden rounded-full bg-line/30"
                          role="progressbar"
                          aria-label={`تغطية فئة ${c.name}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={c.pct}
                        >
                          <span
                            className="block h-full rounded-full bg-blue transition-[width] duration-300"
                            style={{ width: `${c.pct}%` }}
                          />
                        </span>
                        <span className="w-12 shrink-0 text-end text-sm font-bold text-navy">
                          {c.pct}%
                        </span>
                      </span>
                    ) : (
                      <span className="mt-2 block">
                        <DeliveryBadge delivery="center" />
                      </span>
                    )}
                    <span className="mt-1 block text-xs text-ink-2">
                      تغطي الجامعة {c.uniCount} من {skillsText(c.skills.length, true)}
                    </span>
                  </span>
                  <Chevron open={open} />
                </button>

                {open && (
                  <ul
                    id={`cat-${c.id}`}
                    className="space-y-3 border-t border-line/40 bg-bg-soft p-4"
                  >
                    {visible.length === 0 && (
                      <li className="text-sm text-ink-2">لا توجد مهارات في هذه الفئة بهذه التصفية.</li>
                    )}
                    {visible.map((s) => {
                      const ss = st.skillStats.get(s.id)!;
                      const list = bySkill.get(s.id) ?? [];
                      const done = list.filter((x) => x.semester <= sem);
                      const later = list.filter((x) => x.semester > sem);
                      // حالة وحدة المركز والمواد المربوطة بها (المنطق في lib/skills.ts)
                      const { started, label: unitStatus } = centerUnitStatus(s, sem);
                      const planText = planLine(list.map((x) => x.code));
                      return (
                        <li key={s.id} className="rounded-[12px] border border-line/40 bg-bg p-4">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h4 className="font-bold text-navy">{s.name}</h4>
                            <DeliveryBadge delivery={s.delivery} />
                            {s.delivery === "university" && ss.done === 0 && (
                              <span className="rounded-full border border-navy px-2.5 py-0.5 text-[11px] font-bold text-navy">
                                غير مغطاة
                              </span>
                            )}
                            {s.delivery === "university" && ss.total === 1 && (
                              <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">
                                مادة واحدة فقط
                              </span>
                            )}
                          </div>
                          {s.note && <p className="mt-1 text-sm leading-7 text-ink-2">{s.note}</p>}

                          {s.delivery === "university" ? (
                            <>
                              <div className="mt-2 flex items-center gap-3">
                                <span
                                  className="h-2.5 flex-1 overflow-hidden rounded-full bg-line/30"
                                  role="progressbar"
                                  aria-label={`تغطية ${s.name}`}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-valuenow={ss.pct}
                                >
                                  <span
                                    className="block h-full rounded-full bg-blue transition-[width] duration-300"
                                    style={{ width: `${ss.pct}%` }}
                                  />
                                </span>
                                <span className="w-12 shrink-0 text-end text-sm font-bold text-navy">
                                  {ss.pct}%
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-ink-2">
                                {ss.done} من {ss.total} مواد
                              </p>
                              {done.length > 0 && (
                                <ul className="mt-3 flex flex-wrap gap-2">
                                  {done.map((x) => (
                                    <li
                                      key={x.code}
                                      className="rounded-[12px] border border-blue bg-bg px-3 py-1 text-sm text-navy"
                                    >
                                      {label(x.code)}
                                      <span className="ms-2 text-xs text-ink-2">الفصل {x.semester}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {later.length > 0 && (
                                <ul className="mt-2 flex flex-wrap gap-2">
                                  {later.map((x) => (
                                    <li
                                      key={x.code}
                                      className="rounded-[12px] border border-dashed border-line bg-bg px-3 py-1 text-sm text-ink-2"
                                    >
                                      {label(x.code)}
                                      <span className="ms-2 text-xs">الفصل {x.semester}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            s.centerUnit && (
                              <div className="mt-3 space-y-2 rounded-[12px] bg-bg-soft px-4 py-3">
                                <p className="flex flex-wrap items-center gap-2 font-semibold leading-7 text-ink">
                                  {s.centerUnit.title}
                                  {s.centerUnit.draft && (
                                    <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-ink-2">
                                      مبدئي
                                    </span>
                                  )}
                                </p>
                                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
                                  الفصل المقترح: {semestersText(s.centerSemesters)}
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                      started
                                        ? "bg-blue text-white"
                                        : "border border-dashed border-line text-ink-2"
                                    }`}
                                  >
                                    {unitStatus}
                                  </span>
                                </p>
                                <p className="text-sm text-ink-2">{planText}</p>
                              </div>
                            )
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {unclassified.courses.length > 0 && (
          <div className="mt-4 rounded-[12px] border border-dashed border-line bg-bg px-4 py-3">
            <h3 className="text-sm font-bold text-navy">{unclassified.label}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {unclassified.courses.map((code) => {
                const s = semesters.find((x) => x.courses.some((c) => c.code === code));
                return (
                  <li
                    key={code}
                    className="rounded-[12px] border border-line bg-bg-soft px-3 py-1 text-sm text-ink-2"
                  >
                    {label(code)}
                    {s && <span className="ms-2 text-xs">الفصل {s.semester}</span>}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs leading-6 text-ink-2">
              لا تدخل هذه المواد في حساب التغطية.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs leading-6 text-ink-2">
          {mapStatus}. {skills.classificationNote} تغطية الفئة هي متوسط تغطية المهارات التي تغطيها الجامعة فيها.
          <br />
          المرجع: {skills.source}.
        </p>
      </div>
    </section>
  );
}
