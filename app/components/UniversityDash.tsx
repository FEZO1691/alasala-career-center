"use client";

import { useMemo, useState } from "react";
import { ALL_STUDENTS, TRACKS, COMPS, COHORT, compName, placedIds, summary, usePortal } from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type S = (typeof ALL_STUDENTS)[number];


const STYLES = ["القائد", "المنسّق", "المحلّل", "المنجز"];
const YEARS = [1, 2, 3, 4];
const sc = (s: S, c: string) => (s.scores as Record<string, number>)[c];
const pr = (s: S, c: string) => ((s as any).pre as Record<string, number>)[c];
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const field = "w-full rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}

const studentAvg = (s: S) => avg(COMPS.map((c) => sc(s, c.id)));

export default function UniversityDash({ onLagging }: { onLagging?: () => void }) {
  const st = usePortal();
  const [f, setF] = useState({ college: "all", track: "all", year: "all", style: "all", cert: "all", comp: "all", min: 4 });
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v, ...(k === "college" ? { track: "all" } : {}) }));
  const tracks = useMemo(() => Array.from(new Set(ALL_STUDENTS.filter((s) => f.college === "all" || s.college === f.college).map((s) => s.track))), [f.college]);

  const rows = useMemo(
    () =>
      ALL_STUDENTS.filter(
        (s) =>
          (f.college === "all" || s.college === f.college) &&
          (f.track === "all" || s.track === f.track) &&
          (f.year === "all" || s.year === Number(f.year)) &&
          (f.style === "all" || s.styles.includes(f.style)) &&
          (f.cert === "all" || (f.cert === "none" ? !s.cert : s.cert === f.cert)) &&
          (f.comp === "all" || sc(s, f.comp) >= f.min)
      ),
    [f]
  );
  const placed = placedIds(st);
  const grads = rows.filter((s) => s.year === 4);
  const verified = grads.filter((s) => (s as any).verified).length;
  const readiness = avg(rows.map(studentAvg));
  const delta = avg(rows.filter((s) => s.year > 1).map((s) => avg(COMPS.map((c) => sc(s, c.id) - pr(s, c.id)))));
  const lagging = rows.filter((s) => studentAvg(s) < 2.5);
  const hired = grads.filter((s) => placed.has(s.id)).length;
  const sum = summary(st);

  const kpis: [string, string, string][] = [
    [String(rows.length), "طالب وخريج في التصفية", `من ${ALL_STUDENTS.length} في المنظومة`],
    [fmt(readiness), "متوسط الجاهزية من 5", "كل الجدارات الثماني"],
    [`${delta >= 0 ? "+" : ""}${fmt(delta)}`, "فارق القياس البعدي عن القبلي", "للسنوات الثانية فأعلى"],
    [String(lagging.length), "متأخرون عن المسار", "متوسطهم أقل من 2.5 (إنذار مبكر)"],
    [grads.length ? `${Math.round((100 * verified) / grads.length)}%` : "—", "اجتازوا التحقق", `من أصل ${grads.length}`],
    [grads.length ? `${Math.round((100 * hired) / grads.length)}%` : "—", "معدل التوظيف", `${hired} من أصل ${grads.length} خريجًا`],
  ];

  const byCollege = TRACKS.map((c) => {
    const r = rows.filter((s) => s.track === c);
    return { c, n: r.length, pre: avg(r.map((s) => avg(COMPS.map((k) => pr(s, k.id))))), post: avg(r.map(studentAvg)) };
  }).filter((x) => x.n);
  const byComp = COMPS.map((c) => ({ id: c.id, name: c.name, v: avg(rows.map((s) => sc(s, c.id))) })).sort((a, b) => b.v - a.v);
  const byStyle = STYLES.map((x) => ({ x, n: rows.filter((s) => s.styles.includes(x)).length }));
  const byTrack = Array.from(new Set(rows.map((s) => s.track))).map((t) => {
    const r = rows.filter((s) => s.track === t);
    const g = r.filter((s) => s.year === 4);
    return { t, college: r[0].college, n: r.length, a: avg(r.map(studentAvg)), v: g.length ? Math.round((100 * g.filter((s) => (s as any).verified).length) / g.length) : null };
  }).sort((a, b) => b.n - a.n);
  const sel = "rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";
  const dirty = Object.entries(f).some(([k, v]) => k !== "min" && v !== "all");

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-extrabold text-navy">تصفية المنظومة</h4>
          {dirty && (
            <button type="button" onClick={() => setF({ college: "all", track: "all", year: "all", style: "all", cert: "all", comp: "all", min: 4 })} className="text-xs font-bold text-orange-text underline">
              مسح التصفية
            </button>
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-bold text-ink-2">
            المسار
            <select className={`${sel} mt-1 w-full`} value={f.track} onChange={(e) => set("track", e.target.value)}>
              <option value="all">كل المسارات</option>
              {tracks.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            السنة الدراسية
            <select className={`${sel} mt-1 w-full`} value={f.year} onChange={(e) => set("year", e.target.value)}>
              <option value="all">كل السنوات</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y === 4 ? "السنة الرابعة (خريجون)" : `السنة ${["", "الأولى", "الثانية", "الثالثة"][y]}`}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            نمط العمل الجماعي
            <select className={`${sel} mt-1 w-full`} value={f.style} onChange={(e) => set("style", e.target.value)}>
              <option value="all">كل الأنماط</option>
              {STYLES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            الشهادة المهنية
            <select className={`${sel} mt-1 w-full`} value={f.cert} onChange={(e) => set("cert", e.target.value)}>
              <option value="all">الكل</option>
              <option value="m1">شهادة مهنية</option>
              
              <option value="none">بلا شهادة</option>
            </select>
          </label>
          <>
            <label className="text-xs font-bold text-ink-2">
              الجدارة
              <select className={`${sel} mt-1 w-full`} value={f.comp} onChange={(e) => set("comp", e.target.value)}>
                <option value="all">أي جدارة</option>
                {COMPS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-ink-2">
              الدرجة
              <select className={`${sel} mt-1 w-full`} disabled={f.comp === "all"} value={f.min} onChange={(e) => set("min", Number(e.target.value))}>
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </label>
          </>
        </div>
        <p className="mt-3 text-xs text-ink-2" aria-live="polite">
          {f.comp !== "all" ? `يُعرض من درجتهم في ${compName(f.comp)} ${f.min} فأعلى. ` : ""}كل الأرقام أدناه تتغير مع التصفية.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map(([v, l, n]) => (
          <Card key={l}>
            <p className="text-3xl font-extrabold text-orange-text md:text-4xl" dir="ltr">
              {v}
            </p>
            <p className="mt-1 text-xs leading-6 text-ink-2 md:text-sm">{l}</p>
            <p className="text-xs font-bold text-orange-text">{n}</p>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card className="text-center">
          <p className="text-base font-bold text-navy">لا يوجد طلاب يطابقون هذه التصفية</p>
          <p className="mt-1 text-sm text-ink-2">خفّف شرطًا أو امسح التصفية.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            <Card>
              <h4 className="text-base font-extrabold text-navy">الجاهزية بحسب المسار</h4>
              <p className="mb-3 text-xs text-ink-2">القياس القبلي (رمادي) مقابل الحالي (أخضر)</p>
              <div className="flex h-40 items-end justify-around gap-1 border-b border-[#e4dfd9]">
                {byCollege.map((c) => (
                  <div key={c.c} className="flex min-w-0 flex-1 flex-col items-center">
                    <div className="flex h-36 items-end gap-0.5">
                      <span className="w-4 rounded-t-md bg-[#d3cbc3] sm:w-5" style={{ height: `${(c.pre / 5) * 100}%` }} title={fmt(c.pre)} />
                      <span className="w-4 rounded-t-md bg-teal sm:w-5" style={{ height: `${(c.post / 5) * 100}%` }} title={fmt(c.post)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-around gap-1 pt-2 text-center text-[11px] leading-4 text-ink-2">
                {byCollege.map((c) => (
                  <div key={c.c} className="min-w-0 flex-1 break-words">
                    <p className="font-bold text-navy">{c.c}</p>
                    <p dir="ltr">{fmt(c.pre)} → {fmt(c.post)}</p>
                    <p>{c.n} طالبًا</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h4 className="text-base font-extrabold text-navy">متوسط الجدارات</h4>
              <p className="mb-3 text-xs text-ink-2">من 5، للطلاب في التصفية</p>
              <ul className="grid gap-x-10 gap-y-2 md:grid-cols-2">
                {byComp.map((c) => (
                  <li key={c.id} className="grid grid-cols-[8rem_1fr_2.2rem] items-center gap-2 text-xs">
                    <span className="font-bold text-navy">{c.name}</span>
                    <span className="h-2.5 rounded-full bg-[#eee9e3]">
                      <span className="block h-full rounded-full bg-teal" style={{ width: `${(c.v / 5) * 100}%` }} />
                    </span>
                    <span className="text-ink-2" dir="ltr">
                      {fmt(c.v)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Card>
              <h4 className="mb-3 text-base font-extrabold text-navy">المسارات</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[22rem] text-sm">
                  <thead>
                    <tr className="text-xs text-ink-2">
                      <th className="pb-2 text-start font-semibold">المسار</th>
                      <th className="pb-2 text-start font-semibold">الكلية</th>
                      <th className="pb-2 text-center font-semibold">الطلاب</th>
                      <th className="pb-2 text-center font-semibold">الجاهزية</th>
                      <th className="pb-2 text-center font-semibold">التحقق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byTrack.map((r) => (
                      <tr key={r.t} className="border-t border-[#eee9e3]">
                        <td className="py-2.5 font-bold text-navy">{r.t}</td>
                        <td className="py-2.5 text-ink-2">{r.college}</td>
                        <td className="py-2.5 text-center">{r.n}</td>
                        <td className="py-2.5 text-center" dir="ltr">
                          {fmt(r.a)}
                        </td>
                        <td className="py-2.5 text-center">
                          {r.v === null ? (
                            <span className="text-xs text-ink-2">—</span>
                          ) : (
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: r.v >= 85 ? "#e3f0d9" : "#f7f0da", color: r.v >= 85 ? "#3a6e22" : "#7a6420" }}>
                              {r.v}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card>
              <h4 className="text-base font-extrabold text-navy">أنماط العمل الجماعي</h4>
              <p className="mb-3 text-xs text-ink-2">كل طالب له نمطان</p>
              <ul className="space-y-2">
                {byStyle.map((x) => (
                  <li key={x.x} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-2 text-xs">
                    <span className="font-bold text-navy">{x.x}</span>
                    <span className="h-2.5 rounded-full bg-[#eee9e3]">
                      <span className="block h-full rounded-full bg-blue" style={{ width: `${(100 * x.n) / Math.max(1, rows.length)}%` }} />
                    </span>
                    <span className="text-ink-2" dir="ltr">
                      {x.n}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-extrabold text-navy">أقل المتأخرين جاهزية ({lagging.length})</h4>
              {onLagging && (
                <button type="button" onClick={onLagging} className="text-xs font-bold text-orange-text underline">
                  عرض كل المتأخرين في الطلاب
                </button>
              )}
            </div>
            {lagging.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {lagging
                  .sort((a, b) => studentAvg(a) - studentAvg(b))
                  .slice(0, 6)
                  .map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue font-extrabold text-white">{s.initial}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-navy">{s.name}</span>
                        <span className="block text-xs text-ink-2">
                          {s.track} · السنة {s.year}
                        </span>
                      </span>
                      <span className="text-sm font-extrabold text-[#7a6420]" dir="ltr">
                        {fmt(studentAvg(s))}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-2">لا يوجد متأخرون في هذه التصفية.</p>
            )}
          </Card>
        </>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-extrabold text-navy">نشاط أصحاب العمل</h4>
          <span className="rounded-full bg-[#e3f0d9] px-2.5 py-0.5 text-[11px] font-bold text-[#3a6e22]">متصل مباشرة ببوابة أصحاب العمل · لا يتأثر بالتصفية</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(
            [
              [sum.jobsPublished, "وظائف ومشاريع منشورة"],
              [sum.applicants, "طلبات تقدم"],
              [sum.interviews, "مقابلة فما بعد"],
              [`${sum.hiredRate}%`, `معدل توظيف دفعة 2027 (${sum.placed} من ${COHORT})`],
              [sum.coop, `في مشروع (اعتمد المشرف ساعات ${sum.credited})`],
              [sum.delivered, "سلّموا مشاريعهم"],
              [sum.challengesPublished, "تحديات أعمال منشورة"],
              [sum.satisfaction === null ? "—" : `${sum.satisfaction}/5`, `رضا أصحاب العمل (${sum.evaluated} تقييمات)`],
            ] as [string | number, string][]
          ).map(([n, l]) => (
            <div key={l} className="rounded-[10px] bg-[#f8f6f3] p-3">
              <p className="text-2xl font-extrabold text-orange-text" dir="ltr">
                {n}
              </p>
              <p className="mt-1 text-xs text-ink-2">{l}</p>
            </div>
          ))}
        </div>
      </Card>

    </>
  );
}
