"use client";

import { useMemo, useState, type ReactNode } from "react";
import insights from "@/data/universities/demo/university-insights.json";
import outcomes from "@/data/shared/outcomes.json";
import { studentAvg, download } from "./UniversityTabs";
import { ALL_STUDENTS, COHORT, TRACKS, COMPS, GRANTS, destCounts, destOf, summary, usePortal } from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type S = (typeof ALL_STUDENTS)[number];
const sc = (s: S, c: string) => (s.scores as Record<string, number>)[c];
const svc = (s: S) => (s as any).svc as { nova: boolean; cv: boolean; sessions: number; roles: number };
const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sel = "rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";
const grads = ALL_STUDENTS.filter((s) => s.year === 4);

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}
function Bar({ v, max = 100, color = "#3f7a24" }: { v: number; max?: number; color?: string }) {
  return (
    <span className="h-2.5 rounded-full bg-[#eee9e3]">
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, (100 * v) / max)}%`, background: color }} />
    </span>
  );
}
function Chip({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: ok ? "#e3f0d9" : "#f7f0da", color: ok ? "#3a6e22" : "#7a6420" }}>
      {children}
    </span>
  );
}

/* تقييمات أصحاب العمل: مزروعة + الحية من بوابتهم */
function useEvals() {
  const st = usePortal();
  return useMemo(() => {
    const live = st.shortlist
      .filter((x) => (x.stage === "hired" || x.stage === "completed") && x.rating)
      .map((x) => ({ company: "مكتب مرساة للمحاماة", college: ALL_STUDENTS.find((y) => y.id === x.studentId)!.track, rating: x.rating as number }));
    return [...insights.evals, ...live];
  }, [st.shortlist]);
}

/* ---------- فجوة السوق ---------- */
export function MarketGap() {
  const st = usePortal();
  const [college, setCollege] = useState("all");
  const postings = [...insights.market, ...st.jobs.filter((j) => j.status === "published").map((j) => ({ company: "مكتب مرساة للمحاماة", title: j.title, comps: j.comps }))];
  const pool = grads.filter((g) => college === "all" || g.track === college);
  const rows = COMPS.map((c) => {
    const demand = pct(postings.filter((p) => p.comps.includes(c.id)).length, postings.length);
    const supply = pct(pool.filter((g) => sc(g, c.id) >= 4).length, pool.length);
    return { id: c.id, name: c.name, demand, supply, gap: demand - supply };
  }).sort((a, b) => b.gap - a.gap);
  const top = rows[0];
  return (
    <>
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h4 className="text-base font-extrabold text-navy">الطلب مقابل المعروض</h4>
            <p className="mt-1 text-xs leading-6 text-ink-2">
              الطلب: نسبة الوظائف ({postings.length} إعلانًا) التي تشترط الجدارة. المعروض: نسبة الخريجين بدرجة 4 فأعلى فيها. الإعلانات المعتمدة تدخل الحساب فورًا.
            </p>
          </div>
          <label className="text-xs font-bold text-ink-2">
            المسار
            <select className={`${sel} mt-1 block`} value={college} onChange={(e) => setCollege(e.target.value)}>
              <option value="all">كل المسارات</option>
              {TRACKS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        {pool.length === 0 ? (
          <p className="mt-3 text-sm text-ink-2">لا يوجد خريجون في هذه الكلية.</p>
        ) : (
          <>
            <p className="mt-4 rounded-[10px] bg-[#f7f0da] p-3 text-sm font-bold leading-7 text-[#7a6420]" aria-live="polite">
              {top.gap > 0
                ? `أكبر فجوة: ${top.name}. تطلبها ${top.demand}% من الوظائف، ويتقنها ${top.supply}% فقط من الخريجين.`
                : "لا توجد فجوة: المعروض يغطي الطلب في كل الجدارات."}
            </p>
            <ul className="mt-4 divide-y divide-[#eee9e3]">
              {rows.map((r) => (
                <li key={r.id} className="grid items-center gap-x-3 gap-y-1 py-3 md:grid-cols-[8rem_1fr_6rem]">
                  <span className="text-sm font-extrabold text-navy">{r.name}</span>
                  <span className="grid gap-1.5 text-xs">
                    <span className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-2">
                      <span className="text-ink-2">الطلب</span>
                      <Bar v={r.demand} color="#3f7a24" />
                      <span dir="ltr" className="text-ink-2">{r.demand}%</span>
                    </span>
                    <span className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-2">
                      <span className="text-ink-2">المعروض</span>
                      <Bar v={r.supply} />
                      <span dir="ltr" className="text-ink-2">{r.supply}%</span>
                    </span>
                  </span>
                  <span className="text-end">{r.gap > 0 ? <Chip ok={false}>فجوة {r.gap} نقطة</Chip> : <Chip ok>مغطّاة</Chip>}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">إعلانات أصحاب العمل المحتسبة ({postings.length})</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {postings.map((p, i) => (
            <li key={i} className="rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
              <p className="font-bold text-navy">{p.title}</p>
              <p className="text-xs text-ink-2">{p.company}</p>
              <p className="mt-1 text-xs text-ink-2">{p.comps.map((c) => COMPS.find((x) => x.id === c)?.name).join("، ")}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-2">أغلب الإعلانات تجريبية، وما ينشره مكتب مرساة للمحاماة يُضاف إليها مباشرة.</p>
      </Card>
    </>
  );
}

/* ---------- الأداء والمقارنة ---------- */
function useCohortNow() {
  const st = usePortal();
  const evals = useEvals();
  const c = destCounts(st);
  const known = outcomes.knowledge.knownFields.reduce((a, k) => a + (c as any)[k], 0);
  const num = outcomes.results.numeratorFields.reduce((a, k) => a + (c as any)[k], 0);
  const den = num + outcomes.results.seekingFields.reduce((a, k) => a + (c as any)[k], 0);
  return {
    year: 2027,
    grads: COHORT,
    readiness: Math.round(10 * avg(grads.map(studentAvg))) / 10,
    verified: pct(grads.filter((g) => (g as any).verified).length, grads.length),
    knowledge: Math.round((1000 * known) / COHORT) / 10,
    outcomes: den ? Math.round((1000 * num) / den) / 10 : 0,
    satisfaction: Math.round(10 * avg(evals.map((e) => e.rating))) / 10,
  };
}

export function Performance() {
  const st = usePortal();
  const evals = useEvals();
  const now = useCohortNow();
  const cohorts = [...insights.cohorts, now];
  const metrics: [keyof typeof now, string, number, string, string?][] = [
    ["readiness", "متوسط الجاهزية", 5, ""],
    ["verified", "اجتياز التحقق", 100, "%"],
    ["knowledge", "نسبة الخريجين المعروفة حالتهم", 100, "%", outcomes.knowledge.hint],
    ["outcomes", "معدل النتائج المهنية", 100, "%"],
    ["satisfaction", "رضا أصحاب العمل", 5, ""],
  ];
  const colleges = TRACKS.map((c) => {
    const g = grads.filter((s) => s.track === c);
    const emp = g.filter((s) => destOf(st, s.id) === "emp").length;
    const ev = evals.filter((e) => e.college === c);
    return { c, n: g.length, ready: avg(g.map(studentAvg)), ver: pct(g.filter((s) => (s as any).verified).length, g.length), emp: pct(emp, g.length), sat: avg(ev.map((e) => e.rating)), ne: ev.length };
  });
  const byCompany = Array.from(new Set(evals.map((e) => e.company))).map((n) => {
    const r = evals.filter((e) => e.company === n);
    return { n, v: avg(r.map((e) => e.rating)), c: r.length };
  }).sort((a, b) => b.v - a.v);
  const dist = [5, 4, 3, 2, 1].map((k) => ({ k, n: evals.filter((e) => e.rating === k).length }));
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">عبر الدفعات</h4>
        <p className="mb-4 mt-1 text-xs leading-6 text-ink-2">دفعة 2027 محسوبة من بيانات الطلاب الحالية وتتحدث مباشرة. الدفعتان السابقتان أرقام تجريبية.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(([k, label, max, unit, hint]) => (
            <div key={k} className="rounded-[10px] bg-[#f8f6f3] p-3">
              <p className="text-xs font-bold text-ink-2">{label}</p>
              {hint && <p className="mt-0.5 text-[11px] leading-5 text-ink-2">{hint}</p>}
              <div className="mt-2 space-y-1.5">
                {cohorts.map((c) => (
                  <div key={c.year} className="grid grid-cols-[2.5rem_1fr_3.2rem] items-center gap-2 text-xs">
                    <span className="text-ink-2">{c.year}</span>
                    <Bar v={c[k] as number} max={max} color={c.year === 2027 ? "#3f7a24" : "#b9b1a8"} />
                    <span dir="ltr" className="font-bold text-navy">{c[k]}{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">مقارنة المسارات القانونية (دفعة 2027)</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="text-xs text-ink-2">
                {["المسار", "الخريجون", "الجاهزية", "اجتازوا التحقق", "موظفون", "رضا أصحاب العمل"].map((h, i) => (
                  <th key={h} className={`pb-2 font-semibold ${i ? "text-center" : "text-start"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colleges.map((r) => (
                <tr key={r.c} className="border-t border-[#eee9e3]">
                  <td className="py-2.5 font-bold text-navy">{r.c}</td>
                  <td className="py-2.5 text-center">{r.n}</td>
                  <td className="py-2.5 text-center" dir="ltr">{r.ready.toFixed(1)}</td>
                  <td className="py-2.5 text-center">{r.ver}%</td>
                  <td className="py-2.5 text-center">{r.emp}%</td>
                  <td className="py-2.5 text-center" dir="ltr">{r.ne ? `${r.sat.toFixed(1)} (${r.ne})` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h4 className="text-base font-extrabold text-navy">رضا أصحاب العمل بحسب الشركة</h4>
          <p className="mb-3 text-xs text-ink-2">متوسط تقييمات الأداء بعد التوظيف والمشاريع، من {evals.length} تقييمًا</p>
          <ul className="space-y-2">
            {byCompany.map((r) => (
              <li key={r.n} className="grid grid-cols-[8rem_1fr_4.5rem] items-center gap-2 text-xs">
                <span className="font-bold text-navy">{r.n}</span>
                <Bar v={r.v} max={5} />
                <span dir="ltr" className="text-ink-2">{r.v.toFixed(1)} ({r.c})</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h4 className="text-base font-extrabold text-navy">توزيع التقييمات</h4>
          <p className="mb-3 text-xs text-ink-2">عدد التقييمات لكل درجة</p>
          <ul className="space-y-2">
            {dist.map((r) => (
              <li key={r.k} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-2 text-xs">
                <span className="font-bold text-navy">{r.k} من 5</span>
                <Bar v={r.n} max={Math.max(1, ...dist.map((x) => x.n))} color="#3f7a24" />
                <span className="text-ink-2" dir="ltr">{r.n}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

/* ---------- خدمات المركز ---------- */
export function ServicesUsage() {
  const st = usePortal();
  const sum = summary(st);
  const y = (n: number) => ALL_STUDENTS.filter((s) => s.year === n);
  const all = ALL_STUDENTS;
  const nova1 = pct(y(1).filter((s) => svc(s).nova).length, y(1).length);
  const cv34 = pct([...y(3), ...y(4)].filter((s) => svc(s).cv || st.cvChecks[s.id]).length, y(3).length + y(4).length);
  const roles2 = pct(y(2).filter((s) => svc(s).roles >= 3).length, y(2).length);
  const withSession = pct(all.filter((s) => svc(s).sessions >= 1).length, all.length);
  const sessions = all.reduce((a, s) => a + svc(s).sessions, 0) + st.bookings.filter((b) => b.status === "done").length;
  const interested = new Set(Object.entries(st.certPlan).filter(([k, v]) => v).map(([k]) => k.split(":")[0])).size;
  const applicantsUnique = new Set(st.applications.map((a) => a.studentId)).size;
  const partners = st.companies.filter((c) => c.status === "approved").length;
  const c = destCounts(st);
  const known = outcomes.knowledge.knownFields.reduce((a, k) => a + (c as any)[k], 0);
  const kRate = pct(known, COHORT);
  const rows: { id: string; name: string; ind: string; value: string; goal?: string; ok?: boolean }[] = [
    { id: "counseling", name: "إرشاد وتدريب فردي", ind: `طلاب حضروا جلسة واحدة على الأقل (${sessions} جلسة إجمالًا)`, value: `${withSession}%`, goal: "80%", ok: withSession >= 80 },
    { id: "e-tools", name: "أدوات إلكترونية", ind: "السنة الأولى: أنهوا تقييم Nova", value: `${nova1}%`, goal: "100%", ok: nova1 >= 100 },
    { id: "e-tools2", name: "أدوات إلكترونية", ind: "السنتان الثالثة والرابعة: سيرتهم رُوجعت بالذكاء الاصطناعي", value: `${cv34}%`, goal: "100%", ok: cv34 >= 100 },
    { id: "career-info", name: "معلومات مهنية", ind: "السنة الثانية: استكشفوا 3 أدوار مهنية فأكثر", value: `${roles2}%`, goal: "100%", ok: roles2 >= 100 },
    { id: "job-portal", name: "بوابة وظائف ومشاريع", ind: `طلاب تقدموا لوظائف (${sum.applicants} طلب تقدم)`, value: String(applicantsUnique), goal: "—" },
    { id: "grad-planning", name: "التخطيط للدراسة العليا", ind: "طلاب أضافوا شهادة مهنية إلى خطتهم", value: String(interested), goal: "—" },
    { id: "experience", name: "الخبرة العملية", ind: `طلاب في مشروع (تسليمات تحديات الأعمال: ${sum.submissions})`, value: String(sum.coop), goal: "—" },
    { id: "employer-relations", name: "علاقة أصحاب العمل", ind: `شركات شريكة معتمدة، و${sum.jobsPublished} وظيفة منشورة`, value: String(partners), goal: "—" },
    { id: "outcomes", name: "قياس النتائج", ind: "نسبة الخريجين المعروفة حالتهم (من نعرف وضعه بعد التخرج)", value: `${kRate}%`, goal: "65%", ok: kRate >= 65 },
  ];
  const byYear = [1, 2, 3, 4].map((n) => ({
    n,
    nova: pct(y(n).filter((s) => svc(s).nova).length, y(n).length),
    cv: pct(y(n).filter((s) => svc(s).cv).length, y(n).length),
    sess: avg(y(n).map((s) => svc(s).sessions)),
  }));
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">مؤشرات الخدمات الثماني</h4>
        <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">كل خدمة مقيسة بهدفها المكتوب في خطة المركز. بيانات الاستخدام تجريبية، أما التقدم والمشاريع والشركات فمن البوابات مباشرة.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="text-xs text-ink-2">
                <th className="pb-2 text-start font-semibold">الخدمة</th>
                <th className="pb-2 text-start font-semibold">المؤشر</th>
                <th className="pb-2 text-center font-semibold">القيمة</th>
                <th className="pb-2 text-center font-semibold">الهدف</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#eee9e3]">
                  <td className="py-2.5 font-bold text-navy">{r.name}</td>
                  <td className="py-2.5 text-xs leading-6 text-ink-2">{r.ind}</td>
                  <td className="py-2.5 text-center">
                    {r.ok === undefined ? <span className="font-bold text-navy">{r.value}</span> : <Chip ok={r.ok}>{r.value}</Chip>}
                  </td>
                  <td className="py-2.5 text-center text-xs text-ink-2">{r.goal ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">الاستخدام بحسب السنة</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="text-xs text-ink-2">
                {["السنة", "أنهوا تقييم Nova", "رُوجعت سيرتهم", "متوسط الجلسات"].map((h, i) => (
                  <th key={h} className={`pb-2 font-semibold ${i ? "text-center" : "text-start"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byYear.map((r) => (
                <tr key={r.n} className="border-t border-[#eee9e3]">
                  <td className="py-2.5 font-bold text-navy">{["", "الأولى", "الثانية", "الثالثة", "الرابعة"][r.n]}</td>
                  <td className="py-2.5 text-center">{r.nova}%</td>
                  <td className="py-2.5 text-center">{r.cv}%</td>
                  <td className="py-2.5 text-center" dir="ltr">{r.sess.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ---------- حزمة الاعتماد ---------- */
export function Accreditation() {
  const st = usePortal();
  const evals = useEvals();
  const sum = summary(st);
  const now = useCohortNow();
  const y = (n: number) => ALL_STUDENTS.filter((s) => s.year === n);
  const nova1 = pct(y(1).filter((s) => svc(s).nova).length, y(1).length);
  const cv34 = pct([...y(3), ...y(4)].filter((s) => svc(s).cv || st.cvChecks[s.id]).length, y(3).length + y(4).length);
  const roles2 = pct(y(2).filter((s) => svc(s).roles >= 3).length, y(2).length);
  const coopPct = pct(sum.coop, y(4).length);
  const sat = avg(evals.map((e) => e.rating));
  const rows: [string, string, string, boolean][] = [
    ["نسبة الخريجين المعروفة حالتهم", `${now.knowledge}%`, "65% فأكثر", now.knowledge >= 65],
    ["اجتياز لجنة التحقق", `${now.verified}%`, "85% فأكثر", now.verified >= 85],
    ["إنهاء تقييم Nova في السنة الأولى", `${nova1}%`, "90% فأكثر", nova1 >= 90],
    ["مراجعة السيرة قبل نهاية السنة الثالثة", `${cv34}%`, "80% فأكثر", cv34 >= 80],
    ["استكشاف الأدوار المهنية في السنة الثانية", `${roles2}%`, "75% فأكثر", roles2 >= 75],
    ["طلاب السنة الرابعة في مشروع", `${coopPct}%`, "30% فأكثر", coopPct >= 30],
    ["رضا أصحاب العمل", `${sat.toFixed(1)} من 5`, "4.0 فأكثر", sat >= 4],
  ];
  const met = rows.filter((r) => r[3]).length;
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-extrabold text-navy">حزمة مؤشرات الجودة والاعتماد</h4>
          <p className="mt-1 text-xs leading-6 text-ink-2">{met} من {rows.length} مؤشرات مستوفاة. يضبط فريق الجودة المؤشرات والحدود بحسب جهة الاعتماد.</p>
        </div>
        <button
          type="button"
          onClick={() => download("accreditation-pack", [["المؤشر", "القيمة", "الحد", "الحالة"], ...rows.map((r) => [r[0], r[1], r[2], r[3] ? "مستوفى" : "غير مستوفى"])])}
          className="rounded-[10px] bg-teal px-4 py-2 text-sm font-bold text-white hover:bg-blue-bright"
        >
          تنزيل الحزمة
        </button>
      </div>
      <ul className="mt-4 divide-y divide-[#eee9e3]">
        {rows.map((r) => (
          <li key={r[0]} className="flex flex-wrap items-center gap-3 py-3 text-sm">
            <span className="min-w-0 flex-1"><span className="block font-bold text-navy">{r[0]}</span>{r[0] === outcomes.knowledge.label && <span className="block text-xs font-normal leading-5 text-ink-2">{outcomes.knowledge.hint}</span>}</span>
            <span className="text-xs text-ink-2">الحد: {r[2]}</span>
            <span className="font-bold text-navy" dir="ltr">{r[1]}</span>
            <Chip ok={r[3]}>{r[3] ? "مستوفى" : "غير مستوفى"}</Chip>
          </li>
        ))}
      </ul>
    </Card>
  );
}
