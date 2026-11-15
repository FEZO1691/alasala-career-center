"use client";

import { useMemo, useState } from "react";
import outcomes from "@/data/shared/outcomes.json";
import { CvView } from "./Platform";
import { cvData } from "./EmployerPortal";
import {
  ALL_STUDENTS,
  ALUMNI,
  ALUM_MENTORS,
  alumniStats,
  COHORT,
  COLLEGES,
  TRACKS,
  COMPS,
  DEST_IDS,
  COMPANY,
  destCounts,
  destOf,
  portalActions,
  stagesFor,
  isCoopItem,
  usePortal,
} from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type S = (typeof ALL_STUDENTS)[number];

const YEARS = ["", "الأولى", "الثانية", "الثالثة", "الرابعة"];
const DEST_LABEL: Record<string, string> = { ...Object.fromEntries(outcomes.fields.filter((f) => f.id !== "total").map((f) => [f.id, f.label])), unknown: "غير معروف" };
const sc = (s: S, c: string) => (s.scores as Record<string, number>)[c];
const pre = (s: S, c: string) => ((s as any).pre as Record<string, number>)[c];
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
export const studentAvg = (s: S) => avg(COMPS.map((c) => sc(s, c.id)));
const studentDelta = (s: S) => avg(COMPS.map((c) => sc(s, c.id) - pre(s, c.id)));
const sel = "rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}

/* ---------- الطلاب ---------- */
export type StudentsPreset = { lag?: boolean } | null;

function Pipeline({ s }: { s: S }) {
  const st = usePortal();
  const apps = st.applications.filter((a) => a.studentId === s.id).map((a) => st.jobs.find((j) => j.id === a.jobId)?.title).filter(Boolean);
  const sl = st.shortlist.find((x) => x.studentId === s.id);
  const job = sl && st.jobs.find((j) => j.id === sl.jobId);
  const subs = st.challenges.flatMap((c) => c.subs.filter((x) => x.studentId === s.id).map((x) => ({ title: c.title, rating: x.rating })));
  const verified = (s as any).verified === true;
  const rows: [string, string][] = [
    ["الجاهزية الحالية", `${studentAvg(s).toFixed(1)} من 5`],
    ["الفارق عن القياس القبلي", s.year === 1 ? "لا فارق بعد" : `${studentDelta(s) >= 0 ? "+" : ""}${studentDelta(s).toFixed(1)}`],
  ];
  if (s.year === 4) {
    rows.push(["التحقق", verified ? "اجتاز لجنة التحقق" : "بانتظار لجنة التحقق"]);
    rows.push(["الوجهة الأولى", DEST_LABEL[destOf(st, s.id)]]);
  }
  rows.push(["طلبات التقدم", apps.length ? apps.join("، ") : "لا توجد"]);
  rows.push([
    `قائمة ${COMPANY.name}`,
    sl ? `${stagesFor(s.id).find((g) => g.id === sl.stage)?.name}${job ? ` · ${job.title}` : ""}` : "ليس في القائمة",
  ]);
  if (subs.length) rows.push(["تحديات الأعمال", subs.map((x) => `${x.title} (${x.rating ? `${x.rating}/5` : "بانتظار التقييم"})`).join("، ")]);
  if (sl && isCoopItem(sl) && ["accepted", "completed"].includes(sl.stage))
    rows.push(["المشاريع", `${sl.stage === "completed" ? "سلّم المشروع" : "قيد التنفيذ"} · ${sl.credited ? "اعتُمدت الساعات" : "الساعات غير معتمدة"}`]);
  return (
    <Card>
      <h4 className="mb-2 text-base font-extrabold text-navy">متابعة الجامعة</h4>
      <dl className="divide-y divide-[#eee9e3] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7rem_1fr] gap-2 py-2">
            <dt className="text-xs font-bold text-ink-2">{k}</dt>
            <dd className="font-semibold text-navy">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function Students({ preset, onTitle }: { preset: StudentsPreset; onTitle: (t: string | null) => void }) {
  const [f, setF] = useState({ q: "", college: "all", year: "all", status: preset?.lag ? "lag" : "all" });
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<S | null>(null);
  const set = (k: string, v: string) => {
    setF((p) => ({ ...p, [k]: v }));
    setPage(0);
  };
  const rows = useMemo(
    () =>
      ALL_STUDENTS.filter(
        (s) =>
          (f.q.trim() === "" || s.name.includes(f.q.trim())) &&
          (f.college === "all" || s.track === f.college) &&
          (f.year === "all" || s.year === Number(f.year)) &&
          (f.status === "all" || (f.status === "lag" ? studentAvg(s) < 2.5 : studentAvg(s) >= 4))
      ).sort((a, b) => studentAvg(a) - studentAvg(b)),
    [f]
  );
  const ordered = f.status === "top" ? [...rows].reverse() : rows;
  const per = 15;
  const pages = Math.max(1, Math.ceil(ordered.length / per));
  const cur = Math.min(page, pages - 1);
  const st = usePortal();

  if (open)
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setOpen(null);
            onTitle(null);
          }}
          className="mb-2 rounded-[10px] border border-[#d9d2ca] bg-white px-4 py-2 text-sm font-bold text-navy hover:border-navy"
        >
          ← رجوع إلى الطلاب
        </button>
        <CvView v={cvData(open)} shareSlot={<Pipeline s={open} />} />
      </>
    );

  return (
    <>
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-ink-2">
            بحث بالاسم
            <input className={`${sel} mt-1 w-full`} value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="اسم الطالب" />
          </label>
          <label className="text-xs font-bold text-ink-2">
            المسار
            <select className={`${sel} mt-1 w-full`} value={f.college} onChange={(e) => set("college", e.target.value)}>
              <option value="all">كل المسارات</option>
              {TRACKS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            السنة
            <select className={`${sel} mt-1 w-full`} value={f.year} onChange={(e) => set("year", e.target.value)}>
              <option value="all">كل السنوات</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  {YEARS[y]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            الحالة
            <select className={`${sel} mt-1 w-full`} value={f.status} onChange={(e) => set("status", e.target.value)}>
              <option value="all">الكل</option>
              <option value="lag">متأخرون عن المسار (أقل من 2.5)</option>
              <option value="top">متفوقون (4 فأعلى)</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-ink-2" aria-live="polite">
          {ordered.length} من {ALL_STUDENTS.length} طالبًا. افتح أي طالب لترى سيرته الجدارية وكل ما يخصه.
        </p>
      </Card>
      <Card>
        {ordered.length === 0 ? (
          <p className="text-center text-sm text-ink-2">لا يوجد طلاب يطابقون البحث.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="text-xs text-ink-2">
                  {["الطالب", "الكلية والمسار", "السنة", "الجاهزية", "الفارق", ""].map((h, i) => (
                    <th key={i} className={`pb-2 font-semibold ${i < 2 ? "text-start" : "text-center"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ordered.slice(cur * per, cur * per + per).map((s) => {
                  const a = studentAvg(s);
                  return (
                    <tr key={s.id} className="border-t border-[#eee9e3]">
                      <td className="py-2.5 font-bold text-navy">{s.name}</td>
                      <td className="py-2.5 text-xs text-ink-2">
                        {s.college} · {s.track}
                      </td>
                      <td className="py-2.5 text-center">{YEARS[s.year]}</td>
                      <td className="py-2.5 text-center">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: a < 2.5 ? "#f7f0da" : "#e3f0d9", color: a < 2.5 ? "#7a6420" : "#3a6e22" }} dir="ltr">
                          {a.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2.5 text-center text-xs text-ink-2" dir="ltr">
                        {s.year === 1 ? "—" : `${studentDelta(s) >= 0 ? "+" : ""}${studentDelta(s).toFixed(1)}`}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(s);
                            onTitle(s.name);
                          }}
                          className="rounded-[10px] border border-[#d9d2ca] px-3 py-1 text-xs font-bold text-navy hover:border-navy"
                        >
                          فتح الملف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-ink-2">
            <button type="button" disabled={cur === 0} onClick={() => setPage(cur - 1)} className="rounded-[10px] border border-[#d9d2ca] px-3 py-1.5 enabled:hover:border-navy disabled:opacity-40">
              السابق
            </button>
            <span>
              صفحة {cur + 1} من {pages}
            </span>
            <button type="button" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="rounded-[10px] border border-[#d9d2ca] px-3 py-1.5 enabled:hover:border-navy disabled:opacity-40">
              التالي
            </button>
          </div>
        )}
      </Card>
      <p className="sr-only">{st.shortlist.length}</p>
    </>
  );
}

/* ---------- التحقق ---------- */
export function Verification() {
  const grads = ALL_STUDENTS.filter((s) => s.year === 4);
  const ok = grads.filter((s) => (s as any).verified === true);
  const wait = grads.filter((s) => (s as any).verified !== true);
  const tracks = Array.from(new Set(grads.map((s) => s.track)));
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {[
          [grads.length, "من دفعة 2027 يُجرى التحقق منهم"],
          [ok.length, "اجتازوا لجنة التحقق"],
          [wait.length, "بانتظار اللجنة"],
        ].map(([n, l]) => (
          <Card key={l as string}>
            <p className="text-3xl font-extrabold text-orange-text" dir="ltr">
              {n}
            </p>
            <p className="mt-1 text-xs text-ink-2">{l}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h4 className="mb-1 text-base font-extrabold text-navy">التحقق بحسب المسار</h4>
        <p className="mb-3 text-xs leading-6 text-ink-2">لجنة مستقلة تتحقق من الجدارات. تتابع الجامعة النتيجة هنا ولا تعدّلها.</p>
        <ul className="space-y-2">
          {tracks.map((t) => {
            const g = grads.filter((s) => s.track === t);
            const v = g.filter((s) => (s as any).verified === true).length;
            const p = Math.round((100 * v) / g.length);
            return (
              <li key={t} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-2 text-xs">
                <span className="font-bold text-navy">{t}</span>
                <span className="h-2.5 rounded-full bg-[#eee9e3]">
                  <span className="block h-full rounded-full" style={{ width: `${p}%`, background: p >= 85 ? "#3f7a24" : "#b79c55" }} />
                </span>
                <span className="text-ink-2">
                  {v} من {g.length} ({p}%)
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">بانتظار لجنة التحقق ({wait.length})</h4>
        <ul className="grid gap-2 sm:grid-cols-2">
          {wait.slice(0, 12).map((s) => (
            <li key={s.id} className="flex items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue font-extrabold text-white">{s.initial}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-navy">{s.name}</span>
                <span className="block text-xs text-ink-2">
                  {s.track} · {s.college}
                </span>
              </span>
            </li>
          ))}
        </ul>
        {wait.length > 12 && <p className="mt-3 text-xs text-ink-2">ويُعرض أول 12 من {wait.length}.</p>}
      </Card>
    </>
  );
}

/* ---------- الوجهة الأولى والتقارير ---------- */
export function download(name: string, rows: (string | number)[][]) {
  const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function RateBar({ pct, target }: { pct: number; target?: number }) {
  return (
    <div className="relative mt-3 pb-6">
      <div className="h-4 overflow-hidden rounded-full bg-[#eee9e3]">
        <div className="h-full rounded-full bg-teal transition-[width] duration-300" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      {target !== undefined && (
        <>
          <span aria-hidden="true" className="absolute -top-1 h-6 w-0.5 bg-blue" style={{ insetInlineStart: `${target}%` }} />
          <span className="absolute top-6 translate-x-1/2 whitespace-nowrap text-xs font-bold text-navy" style={{ insetInlineStart: `${target}%` }}>
            الهدف {target}%
          </span>
        </>
      )}
    </div>
  );
}

export function Destination() {
  const st = usePortal();
  const [show, setShow] = useState<string>("unknown");
  const c = destCounts(st);
  const total = COHORT;
  const known = outcomes.knowledge.knownFields.reduce((a, k) => a + c[k as keyof typeof c], 0);
  const num = outcomes.results.numeratorFields.reduce((a, k) => a + c[k as keyof typeof c], 0);
  const den = num + outcomes.results.seekingFields.reduce((a, k) => a + c[k as keyof typeof c], 0);
  const kRate = total ? (100 * known) / total : 0;
  const oRate = den ? (100 * num) / den : 0;
  const pass = kRate >= outcomes.knowledge.target;
  const grads = ALL_STUDENTS.filter((s) => s.year === 4);
  const list = grads.filter((s) => destOf(st, s.id) === show);

  const reports: [string, string, () => void][] = [
    [
      "كشف الطلاب",
      "كل الطلاب بجاهزيتهم وفارق القياس والتحقق والوجهة",
      () =>
        download("students", [
          ["الاسم", "الكلية", "المسار", "السنة", "الجاهزية", "فارق القياس", "التحقق", "الوجهة الأولى", "الشهادة", "أنماط العمل الجماعي"],
          ...ALL_STUDENTS.map((s) => [
            s.name,
            s.college,
            s.track,
            s.year,
            studentAvg(s).toFixed(2),
            s.year === 1 ? "" : studentDelta(s).toFixed(2),
            s.year === 4 ? ((s as any).verified ? "اجتاز" : "بانتظار") : "",
            s.year === 4 ? DEST_LABEL[destOf(st, s.id)] : "",
            s.cert ?? "",
            s.styles.join(" + "),
          ]),
        ]),
    ],
    [
      "الوجهة الأولى للخريجين",
      "حالة كل خريج وفق معيار NACE",
      () => download("first-destination", [["الاسم", "المسار", "الوجهة"], ...grads.map((s) => [s.name, s.track, DEST_LABEL[destOf(st, s.id)]])]),
    ],
    [
      "المشاريع",
      "مشاريع الطلاب وتقييم الشركات واعتماد الساعات",
      () =>
        download("coop", [
          ["الاسم", "المرحلة", "المشروع", "تقييم الشركة", "اعتماد الساعات"],
          ...st.shortlist
            .filter((x) => isCoopItem(x))
            .map((x) => [
              ALL_STUDENTS.find((y) => y.id === x.studentId)!.name,
              stagesFor(x.studentId).find((g) => g.id === x.stage)?.name ?? "",
              st.jobs.find((j) => j.id === x.jobId)?.title ?? "",
              x.rating ?? "",
              x.credited ? "نعم" : "لا",
            ]),
        ]),
    ],
    [
      "أصحاب العمل والوظائف",
      "الوظائف المنشورة وطلبات التقدم لكل وظيفة",
      () =>
        download("jobs", [
          ["الوظيفة", "النوع", "الحالة", "المتقدمون", "في القائمة القصيرة"],
          ...st.jobs.map((j) => [
            j.title,
            j.type,
            j.status === "published" ? "منشورة" : "قيد الاعتماد",
            st.applications.filter((a) => a.jobId === j.id).length,
            st.shortlist.filter((x) => x.jobId === j.id).length,
          ]),
        ]),
    ],
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm font-bold text-ink-2">{outcomes.knowledge.label}</p>
          <p className="text-xs leading-6 text-ink-2">{outcomes.knowledge.hint}</p>
          <p className="text-5xl font-extrabold text-navy" dir="ltr">
            {kRate.toFixed(1)}%
          </p>
          <RateBar pct={kRate} target={outcomes.knowledge.target} />
          <p className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-bold ${pass ? "bg-teal text-white" : "border-2 border-navy text-navy"}`}>{pass ? outcomes.knowledge.pass : outcomes.knowledge.fail}</p>
          <p className="mt-2 text-sm text-ink-2">{outcomes.messages.unknown.replace("{n}", String(c.unknown))}</p>
        </Card>
        <Card>
          <p className="text-sm font-bold text-ink-2">{outcomes.results.label}</p>
          <p className="text-5xl font-extrabold text-navy" dir="ltr">
            {oRate.toFixed(1)}%
          </p>
          <RateBar pct={oRate} />
          <p className="text-xs leading-6 text-ink-2">{outcomes.results.formula}</p>
        </Card>
      </div>
      <p className="text-xs leading-6 text-ink-2">
        {outcomes.cohortNote} {outcomes.publishNote} الأرقام تُحسب تلقائيًا من حالة كل خريج، والتوظيف عبر المركز يجعل حالته «موظف».
      </p>

      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">توزيع دفعة 2027 ({total})</h4>
        <ul className="space-y-2">
          {DEST_IDS.map((k) => (
            <li key={k} className="grid grid-cols-[10rem_1fr_5rem] items-center gap-2 text-xs">
              <span className="font-bold text-navy">{DEST_LABEL[k]}</span>
              <span className="h-2.5 rounded-full bg-[#eee9e3]">
                <span className="block h-full rounded-full" style={{ width: `${(100 * c[k]) / total}%`, background: k === "unknown" ? "#b79c55" : "#3f7a24" }} />
              </span>
              <span className="text-ink-2">
                {c[k]} ({Math.round((100 * c[k]) / total)}%)
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h4 className="text-base font-extrabold text-navy">تسجيل وجهة الخريجين</h4>
            <p className="mt-1 text-xs leading-6 text-ink-2">تسجيل حالة الخريج يرفع نسبة المعروفة حالتهم. اختر الحالة بعد التواصل معه أو مع جهة عمله.</p>
          </div>
          <label className="text-xs font-bold text-ink-2">
            عرض
            <select className={`${sel} mt-1 block`} value={show} onChange={(e) => setShow(e.target.value)}>
              {DEST_IDS.map((k) => (
                <option key={k} value={k}>
                  {DEST_LABEL[k]} ({c[k]})
                </option>
              ))}
            </select>
          </label>
        </div>
        {list.length ? (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {list.slice(0, 10).map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-navy">{s.name}</span>
                  <span className="block text-xs text-ink-2">{s.track}</span>
                </span>
                <select aria-label={`وجهة ${s.name}`} className={sel} value={destOf(st, s.id)} onChange={(e) => portalActions.setDestination(s.id, e.target.value)}>
                  {DEST_IDS.map((k) => (
                    <option key={k} value={k}>
                      {DEST_LABEL[k]}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-2">لا يوجد خريجون في هذه الحالة.</p>
        )}
        {list.length > 10 && <p className="mt-3 text-xs text-ink-2">ويُعرض أول 10 من {list.length}.</p>}
      </Card>

      <Card>
        <h4 className="mb-1 text-base font-extrabold text-navy">التقارير</h4>
        <p className="mb-3 text-xs text-ink-2">تُولَّد من البيانات الحالية وتُنزَّل بصيغة تفتح في Excel.</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {reports.map(([t, d, fn]) => (
            <li key={t} className="flex items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-navy">{t}</p>
                <p className="text-xs leading-5 text-ink-2">{d}</p>
              </div>
              <button type="button" onClick={fn} className="rounded-[10px] bg-teal px-3 py-2 text-xs font-bold text-white hover:bg-blue-bright">
                تنزيل
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}


/* ---------- الخريجون ---------- */
export function Alumni() {
  const st = usePortal();
  const a = alumniStats(st);
  const [yr, setYr] = useState<number | "all">("all");
  const years = Array.from(new Set(ALUMNI.map((x) => (x as any).gradYear as number))).sort();
  const list = ALUMNI.filter((x) => yr === "all" || (x as any).gradYear === yr);
  const mentorIds = new Set(ALUM_MENTORS.map((m) => m.id));
  const rows: [string, string][] = [
    [String(a.total), "خريج في المنظومة"],
    [`${a.knownRate}%`, "معروفة وجهتهم (الحد الأدنى 65%)"],
    [String(a.employed), "يعملون الآن"],
    [String(a.hiredViaCenter), "وُظّفوا عبر بوابة أصحاب العمل"],
    [String(a.applicants), "خريجون تقدموا لوظائف"],
    [String(ALUM_MENTORS.length), "خريج متطوع للإرشاد"],
    [`${ALUMNI.filter((x) => st.alumData[x.id]).length} من ${a.total}`, "حدّثوا بياناتهم بأنفسهم"],
  ];
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {rows.map(([n, l]) => (
          <Card key={l}>
            <p className="text-2xl font-extrabold text-orange-text" dir="ltr">{n}</p>
            <p className="mt-1 text-xs text-ink-2">{l}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h4 className="text-base font-extrabold text-navy">وضع الخريجين المهني</h4>
        <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">يتحدّث تلقائيًا عندما يحدّث الخريج وضعه أو توظّفه شركة عبر المركز، ويظهر في الصفحة الرئيسية.</p>
        <ul className="space-y-2">
          {DEST_IDS.map((k) => (
            <li key={k} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-xs">
              <span className="font-bold text-navy">{DEST_LABEL[k]}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-[#eee9e3]"><span className="block h-full rounded-full bg-teal" style={{ width: `${(100 * a.counts[k]) / a.total}%` }} /></span>
              <span dir="ltr" className="text-ink-2">{a.counts[k]}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-extrabold text-navy">قائمة الخريجين</h4>
          <div className="flex items-center gap-2">
            <select aria-label="الدفعة" className="rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-1.5 text-xs" value={String(yr)} onChange={(e) => setYr(e.target.value === "all" ? "all" : Number(e.target.value))}>
              <option value="all">كل الدفعات</option>
              {years.map((y) => <option key={y} value={y}>دفعة {y}</option>)}
            </select>
            <button type="button" className="rounded-[10px] border border-navy px-3 py-1.5 text-xs font-bold text-navy" onClick={() => download("alumni", [["الاسم", "الدفعة", "المسار", "الوضع الحالي", "متطوع للإرشاد"], ...list.map((x) => [x.name, (x as any).gradYear, x.track, DEST_LABEL[destOf(st, x.id)], mentorIds.has(x.id) ? "نعم" : "لا"])])}>
              تنزيل CSV
            </button>
          </div>
        </div>
        <div className="mt-3 max-h-96 overflow-auto">
          <table className="w-full text-start text-xs">
            <thead className="sticky top-0 bg-white text-ink-2">
              <tr><th className="py-2 text-start">الخريج</th><th className="text-start">الدفعة</th><th className="text-start">المسار</th><th className="text-start">الوضع الحالي</th><th className="text-start">جهة العمل / الدراسة</th><th className="text-start">التواصل</th><th className="text-start">متابعة</th></tr>
            </thead>
            <tbody>
              {list.map((x) => {
                const d = destOf(st, x.id);
                return (
                  <tr key={x.id} className="border-t border-[#eee9e3]">
                    <td className="py-2 font-bold text-navy">{x.name}{mentorIds.has(x.id) && <span className="ms-2 rounded-full bg-[#e3f0d9] px-2 py-0.5 text-[10px] text-orange-text">مرشد</span>}</td>
                    <td>{(x as any).gradYear}</td>
                    <td>{x.track}</td>
                    <td>{DEST_LABEL[d]}</td>
                    <td>{st.alumData[x.id] ? [st.alumData[x.id].employer || st.alumData[x.id].institution, st.alumData[x.id].title || st.alumData[x.id].program].filter(Boolean).join(" · ") || "—" : <span className="text-ink-2">لم يحدّث بياناته</span>}</td>
                    <td dir="ltr" className="text-start">{st.alumData[x.id]?.email || "—"}</td>
                    <td>
                      {d === "unknown" ? (
                        st.contacted[x.id] ? <span className="text-orange-text">تم التواصل</span> : (
                          <button type="button" className="rounded-md bg-blue px-2 py-1 font-bold text-white" onClick={() => portalActions.contactStudent(x.id)}>تواصل لتحديث وضعه</button>
                        )
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
