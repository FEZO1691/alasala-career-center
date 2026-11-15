"use client";

import { useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import LoginFrame from "./LoginFrame";
import journey from "@/data/universities/demo/student-journey.json";
import screens from "@/data/universities/demo/student-screens.json";
import stages from "@/data/shared/stages.json";
import outcomes from "@/data/shared/outcomes.json";
import { Frame, CvView } from "./Platform";
import Coach from "./Coach";
import Guide, { type GuideStep } from "./Guide";
import { cvData } from "./EmployerPortal";
import type Skills from "./Skills";
import certsData from "@/data/universities/demo/pro-certs.json";
import critical from "@/data/universities/demo/critical-jobs.json";
import { joinSession, useTabIntent } from "@/lib/route";
import { agendaFor } from "@/lib/agenda";
import { MODE_LABEL, videoLink, CERTS_NOTE, CERT_ST, certsFor, DEST_IDS, COLLEGES, ALUM_MENTORS, ANY_STUDENTS, COMPANY, COMPS, CERT_STEPS, destOf, jobYear, jobYearFor, mentorOf, portalActions, stagesFor, usePortal } from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Stu = (typeof ANY_STUDENTS)[number];
const sc = (s: Stu, c: string) => (s.scores as Record<string, number>)[c] ?? 0;
const PASS = "demo123";
const userOf = (s: Stu) => (s.id.startsWith("a") ? `alm${s.id.slice(1)}` : `std${s.id.slice(1)}`);
const YEARS = ["", "السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "خريج سابق"];
const field = "w-full rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";
const periods: any[] = journey.periods.filter((p: any) => typeof p.id === "number");
const DEST_LABEL: Record<string, string> = Object.fromEntries(outcomes.fields.filter((f) => f.id !== "total").map((f) => [f.id, f.label]));
const ALL_TABS: [string, string, string, string][] = [
  ["j", "رحلتي", "رحلتي", "خطواتك خلال السنوات الأربع، ووجهتك المهنية"],
  ["p", "ملفي ومهاراتي", "ملفي ومهاراتي", "سيرتك الموثقة وجداراتك ونموها منذ القياس الأول، وأنت من يتحكم في ظهورها"],
  ["sem", "الفصول", "الفصول", "مواد كل فصل والمهارات التي تنميها، وما يقدمه المركز"],
  ["jobs", "الوظائف والمشاريع", "الوظائف والمشاريع", "فرص معتمدة تناسب سنتك، ونسبة تطابقها مع ملفك"],
  ["ch", "تحديات الأعمال", "تحديات الأعمال", "حلّ مشكلة حقيقية من شركة وأضف دليلًا إلى سيرتك"],
  ["offers", "العروض والإشعارات", "العروض والإشعارات", "كل ما يصلك من الشركات والمركز"],
  ["counsel", "الإرشاد", "الإرشاد", "احجز جلسة وتابع فعاليات المركز"],
  ["gc", "الشهادات المهنية", "الشهادات المهنية", "شهادات عالمية مختارة لمسار القانون، وخطتك للحصول عليها"],
  ["coach", "المدرب الذكي", "المدرب الذكي", "تدرّب على المقابلات وراجع سيرتك بمساعد ذكي"],
];
const ALUMNI_KEYS = ["j", "p", "jobs", "offers", "counsel", "gc", "coach"];
const SECTORS = ["مكاتب محاماة", "جهات حكومية وقضائية", "إدارات قانونية في الشركات", "مصرفي ومالي", "تحكيم ووساطة", "توثيق وعدل"];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}
function Pill({ ok, children }: { ok?: boolean | null; children: ReactNode }) {
  const c = ok === true ? ["#e3f0d9", "#3a6e22"] : ok === false ? ["#f7f0da", "#7a6420"] : ["#eee9e3", "#4a5560"];
  return (
    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: c[0], color: c[1] }}>
      {children}
    </span>
  );
}
function Bar({ v, color = "#3f7a24" }: { v: number; color?: string }) {
  return (
    <span className="h-2.5 rounded-full bg-[#eee9e3]">
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, v)}%`, background: color }} />
    </span>
  );
}
const btn = "rounded-[10px] bg-teal px-4 py-2 text-sm font-bold text-white hover:bg-blue-bright disabled:opacity-50";

/* حالة المهام: ما علّمه الطالب، وإلا الافتراضي (فصول مضت = منجزة، والفصل الحالي أول مهمة) */
function useTasks(s: Stu, cur: number) {
  const st = usePortal();
  const isDone = (pid: number, i: number) => {
    const k = `${s.id}:p${pid}-${i}`;
    if (k in st.ticks) return st.ticks[k];
    const nova = (s as any).svc?.nova ?? false;
    const txt: string = periods.find((p) => p.id === pid)?.tasks?.[i]?.text ?? "";
    return pid < cur || (pid === cur && nova && (i === 0 || txt.includes("تقييم Nova")));
  };
  return { isDone, toggle: (pid: number, i: number) => portalActions.toggleTick(s.id, `p${pid}-${i}`, isDone(pid, i)) };
}

/* ---------- الدخول ---------- */
function Login({ onEnter, mode, onRegister }: { onEnter: (id: string) => void; mode: Mode; onRegister?: () => void }) {
  const st = usePortal();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const demo = useMemo(() => {
    if (mode === "alumni") return ["a1", "a31", "a4", "a7"].map((id) => ANY_STUDENTS.find((s) => s.id === id)!).filter(Boolean);
    const y = (n: number) => ANY_STUDENTS.find((s) => s.year === n)!;
    const applicant = ANY_STUDENTS.find((s) => s.id === st.applications[0]?.studentId && s.year !== 5) ?? y(4);
    return [y(1), y(2), ANY_STUDENTS.find((s) => s.id === "s401") ?? y(3), applicant];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <LoginFrame img={mode === "alumni" ? "gw-alumni" : "j-1"} pos={mode === "alumni" ? "center 30%" : "30% center"} caption={mode === "alumni" ? "مرشدك بعد التخرج لخمس سنوات" : "رحلتك المهنية من أول سنة"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const s = ANY_STUDENTS.find((x) => userOf(x) === u.trim().toLowerCase());
          if (s && (s.year === 5) !== (mode === "alumni") && p === PASS)
            return setErr(mode === "alumni" ? "هذا حساب طالب. ادخل من بوابة الطالب." : "هذا حساب خريج. ادخل من بوابة الخريجين.");
          if (!s || p !== PASS) return setErr("اسم المستخدم أو كلمة المرور غير صحيحة.");
          setErr("");
          onEnter(s.id);
        }}
        className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-md"
      >
        <p className="text-center text-xs font-bold text-orange-text">{mode === "alumni" ? "بوابة الخريجين" : "بوابة الطالب"}</p>
        <h3 className="mt-1 text-center text-xl font-extrabold text-navy">{mode === "alumni" ? "دخول الخريجين" : "دخول الطلاب"}</h3>
        <label className="mt-4 block text-xs font-bold text-ink-2">
          اسم المستخدم
          <input dir="ltr" autoComplete="username" className={`${field} mt-1`} value={u} onChange={(e) => setU(e.target.value)} />
        </label>
        <label className="mt-3 block text-xs font-bold text-ink-2">
          كلمة المرور
          <input dir="ltr" type="password" autoComplete="current-password" className={`${field} mt-1`} value={p} onChange={(e) => setP(e.target.value)} />
        </label>
        {err && (
          <p role="alert" className="mt-3 rounded-[10px] bg-[#f7f0da] p-2.5 text-xs font-bold text-[#7a6420]">
            {err}
          </p>
        )}
        <button type="submit" className="mt-5 w-full rounded-[10px] bg-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-teal">
          دخول
        </button>
        <div className="mt-5 border-t border-[#eee9e3] pt-3">
          <p className="text-[11px] font-bold text-ink-2">حسابات تجريبية (كلمة المرور: {PASS})</p>
          <ul className="mt-2 space-y-1.5">
            {demo.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setU(userOf(s));
                    setP(PASS);
                    setErr("");
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-[8px] bg-[#f8f6f3] px-3 py-1.5 text-start text-xs hover:bg-[#eee9e3]"
                >
                  <span className="font-bold text-navy">{s.name}</span>
                  <span className="text-ink-2">
                    {s.year === 5 ? `دفعة ${(s as any).gradYear}` : YEARS[s.year]} · <span dir="ltr">{userOf(s)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {mode === "alumni" && <button type="button" onClick={onRegister} className="mt-4 w-full rounded-[10px] border border-navy px-5 py-2 text-sm font-bold text-navy hover:bg-[#f4f2ef]">خريج جديد؟ سجّل في المركز</button>}
        <p className="mt-4 text-center text-xs text-ink-2">
          {mode === "alumni" ? (<>هل أنت طالب؟ <a href="#student" className="font-bold text-orange-text underline">بوابة الطالب</a></>) : (<>هل تخرجت؟ <a href="#alumni" className="font-bold text-orange-text underline">بوابة الخريجين</a></>)}
        </p>
      </form>
    </LoginFrame>
  );
}

/* ---------- رحلتي ---------- */
/* اختيار الوجهة: أدوار وقطاعات متعددة */
function GoalPicker({ s, intro, wide = false }: { s: Stu; intro: string; wide?: boolean }) {
  const st = usePortal();
  const goal = st.goals[s.id];
  const roles = screens.library.roles as any[];
  const [rs, setRs] = useState<string[]>(goal?.roles ?? []);
  const [ss, setSs] = useState<string[]>(goal?.sectors ?? []);
  const [openF, setOpenF] = useState<string | null>(null);
  const tog = (list: string[], set: (x: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${on ? "border-navy bg-blue text-white" : "border-[#d9d2ca] bg-white text-navy hover:border-navy"}`;
  const saved = goal && goal.roles.length && goal.sectors.length;
  const famCount = critical.families.filter((f) => f.roles.some((r) => rs.includes(r))).length;
  const otherCount = rs.filter((r) => !critical.families.some((f) => f.roles.includes(r))).length;
  const stepNo = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue text-xs font-extrabold text-white";
  return (
    <Card className={wide ? "lg:col-span-2" : ""}>
      <h4 className="mb-1 text-base font-extrabold text-navy">وجهتي المهنية</h4>
      <p className="mb-4 text-xs leading-6 text-ink-2">{intro}</p>

      <div className="flex items-center gap-2"><span className={stepNo}>1</span><p className="text-sm font-extrabold text-navy">اختر الوظائف التي تستهدفها</p></div>
      <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">{critical.intro} يمكنك اختيار وظيفة أو أكثر، من عائلة أو من عدة عائلات.</p>
      <ol className={`grid gap-3 ${wide ? "lg:grid-cols-2" : ""}`}>
        {critical.families.map((f) => {
          const all = f.roles.every((r) => rs.includes(r));
          const n = f.roles.filter((r) => rs.includes(r)).length;
          const open = openF === f.name;
          return (
            <li key={f.name} className={`rounded-[14px] border p-4 ${n ? "border-[#3f7a24] bg-[#eef6e8]" : "border-[#d9d2ca] bg-white"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-extrabold text-navy">{f.name}</p>
                <span className="rounded-full border border-[#3f7a24] bg-white px-2.5 py-0.5 text-[11px] font-bold text-orange-text">{f.priority}</span>
              </div>
              <p className="mt-1.5 text-xs leading-6 text-ink-2">{f.desc}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {f.roles.map((r) => (
                  <button key={r} type="button" aria-pressed={rs.includes(r)} className={chip(rs.includes(r))} onClick={() => tog(rs, setRs, r)}>{r}</button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <button type="button" className="font-bold text-orange-text hover:underline" onClick={() => setRs(all ? rs.filter((x) => !f.roles.includes(x)) : Array.from(new Set([...rs, ...f.roles])))}>{all ? "إلغاء كل الوظائف" : "اختر كل الوظائف"}</button>
                <button type="button" aria-expanded={open} className="font-bold text-ink-2 hover:underline" onClick={() => setOpenF(open ? null : f.name)}>{open ? "إخفاء التفاصيل" : "التفاصيل"}</button>
                {n ? <span className="ms-auto font-bold text-navy">اخترت {n}</span> : null}
              </div>
              {open && (
                <div className="mt-2 space-y-1 border-t border-[#e4ded6] pt-2 text-[11px] leading-6 text-ink-2">
                  <p><b className="text-navy">الشهادات: </b>{f.certs.join("، ")}{f.name === "الملكية الفكرية" ? ` (${critical.ipNote})` : ""}</p>
                  {f.courses.length ? <p><b className="text-navy">أبرز المقررات: </b>{f.courses.join("، ")}</p> : null}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <details className="mt-3 rounded-[12px] border border-[#d9d2ca] p-3">
        <summary className="cursor-pointer text-xs font-extrabold text-navy">أدوار قانونية أخرى</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          {roles.map((r) => (
            <button key={r.id} type="button" aria-pressed={rs.includes(r.title)} className={chip(rs.includes(r.title))} onClick={() => tog(rs, setRs, r.title)}>{r.title}</button>
          ))}
        </div>
      </details>

      <div className="mt-5 flex items-center gap-2"><span className={stepNo}>2</span><p className="text-sm font-extrabold text-navy">أين تريد أن تعمل؟</p></div>
      <p className="mb-2 mt-1 text-xs leading-6 text-ink-2">اختر جهة العمل أو أكثر، ليوجّهك مرشدك إلى الفرص المناسبة.</p>
      <div className="flex flex-wrap gap-2">
        {SECTORS.map((x) => (
          <button key={x} type="button" aria-pressed={ss.includes(x)} className={chip(ss.includes(x))} onClick={() => tog(ss, setSs, x)}>{x}</button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#f8f6f3] px-4 py-3">
        <p className="text-sm font-bold text-navy" aria-live="polite">
          {rs.length ? `اخترت ${rs.length} ${rs.length > 2 ? "وظائف" : "وظيفة"}${famCount ? ` من ${famCount} ${famCount > 2 ? "عائلات" : "عائلة"}` : ""}${otherCount && famCount ? ` وأدوارًا أخرى` : ""}، و${ss.length} ${ss.length > 2 ? "جهات عمل" : "جهة عمل"}` : "لم تختر وظائف بعد"}
        </p>
        <button type="button" disabled={!rs.length || !ss.length} onClick={() => portalActions.setGoal(s.id, rs, ss)} className={btn}>حفظ وجهتي</button>
      </div>
      {saved ? (
        <div className="mt-3 rounded-[10px] bg-[#e3f0d9] p-3 text-sm font-bold text-[#3a6e22]" aria-live="polite">
          تم حفظ وجهتك: {goal.roles.join("، ")} في {goal.sectors.join("، ")}. يراها مرشدك ويوجّهك على أساسها.
        </div>
      ) : null}
    </Card>
  );
}

function Journey({ s, cur, go }: { s: Stu; cur: number; go: (k: string) => void }) {
  const st = usePortal();
  const { isDone, toggle } = useTasks(s, cur);
  const all = periods.flatMap((p) => p.tasks.map((_: any, i: number) => isDone(p.id, i)));
  const pct = Math.round((100 * all.filter(Boolean).length) / all.length);
  const next = periods.flatMap((p) => p.tasks.map((t: any, i: number) => ({ p, t, i }))).find((x) => x.p.id <= cur + 1 && !isDone(x.p.id, x.i));
  const dest = destOf(st, s.id);
  const first = s.name.split(" ")[0];
  return (
    <>
      <div className="rounded-[14px] bg-blue p-4 text-white shadow-sm md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/70">
              {YEARS[s.year]} · الفصل {cur} · كلية {s.college}
            </p>
            <h4 className="mt-1 text-xl font-extrabold">أهلًا {first}</h4>
            <p className="mt-1 text-sm text-white/80">{next ? `خطوتك التالية: ${next.t.text}` : "أنجزت كل مهام رحلتك حتى الآن."}</p>
          </div>
          <div className="min-w-[10rem] text-center">
            <p className="text-3xl font-extrabold" dir="ltr">{pct}%</p>
            <p className="text-xs text-white/70">من مهام الرحلة</p>
          </div>
        </div>
      </div>

      <AgendaNotes s={s} go={go} />
      <ProgressBadges s={s} pct={pct} go={go} />

      <Card>
        <h4 className="mb-1 text-base font-extrabold text-navy">رحلتي خلال السنوات الأربع</h4>
        <p className="mb-4 text-xs text-ink-2">كل سنة مرحلة، وكل مرحلة لها مهام وخدمات من المركز. علّم ما أنجزته بنفسك.</p>
        <ol className="grid gap-3 lg:grid-cols-4">
          {stages.slice(0, 4).map((g: any) => {
            const ps = periods.filter((p) => p.year === g.id);
            const tot = ps.reduce((a, p) => a + p.tasks.length, 0);
            const dn = ps.reduce((a, p) => a + p.tasks.filter((_: any, i: number) => isDone(p.id, i)).length, 0);
            const state = s.year > g.id ? "done" : s.year === g.id ? "now" : "next";
            return (
              <li key={g.id} className="rounded-[12px] border p-3" style={{ borderColor: state === "now" ? "#3f7a24" : "#e6e0d9", background: state === "now" ? "#f0f6ea" : "#fff" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-ink-2">{g.year}</span>
                  <Pill ok={state === "done" ? true : state === "now" ? null : undefined}>{state === "done" ? "مكتملة" : state === "now" ? "أنت هنا" : "قادمة"}</Pill>
                </div>
                <p className="mt-1 text-sm font-extrabold text-navy">{g.name}</p>
                <p className="mt-1 text-xs leading-6 text-ink-2">{g.goal}</p>
                <div className="mt-2 grid grid-cols-[1fr_2.5rem] items-center gap-2 text-xs">
                  <Bar v={tot ? (100 * dn) / tot : 0} />
                  <span dir="ltr" className="text-ink-2">{dn}/{tot}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <h4 className="mb-3 text-base font-extrabold text-navy">مهام فصلي الحالي (الفصل {cur})</h4>
          {periods
            .filter((p) => p.id === cur)
            .map((p) => (
              <div key={p.id}>
                <p className="text-sm font-bold text-orange-text">{p.title}</p>
                <p className="mb-2 text-xs leading-6 text-ink-2">{p.headline}</p>
                <ul className="space-y-1.5">
                  {p.tasks.map((t: any, i: number) => (
                    <li key={i}>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] bg-[#f8f6f3] px-3 py-2 text-sm text-ink">
                        <input type="checkbox" className="h-4 w-4 accent-[#3f7a24]" checked={isDone(p.id, i)} onChange={() => toggle(p.id, i)} />
                        <span className={isDone(p.id, i) ? "text-ink-2 line-through" : ""}>{t.text}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          <button type="button" onClick={() => go("sem")} className="mt-3 text-xs font-bold text-orange-text hover:underline">
            عرض كل الفصول
          </button>
        </Card>

        <GoalPicker wide s={s} intro="اختر الأدوار والقطاعات التي تستهدفها. تُعدَّل متى شئت، ويراها مرشدك." />
      </div>

      {s.year === 4 && (
        <Card>
          <h4 className="mb-1 text-base font-extrabold text-navy">وضعي بعد التخرج</h4>
          <p className="mb-3 text-xs leading-6 text-ink-2">حدّث وضعك لتدخل في نتائج دفعتك؛ المركز يعتمد على ما تسجله هنا.</p>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="وضعي بعد التخرج"
              className={`${field} max-w-xs`}
              value={dest}
              onChange={(e) => portalActions.setDestination(s.id, e.target.value)}
              disabled={dest === "emp" && st.shortlist.some((x) => x.studentId === s.id && x.stage === "hired")}
            >
              <option value="unknown">لم أحدد بعد</option>
              {Object.entries(DEST_LABEL).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
            {st.shortlist.some((x) => x.studentId === s.id && x.stage === "hired") && <Pill ok>وُظّفت عبر المنظومة</Pill>}
          </div>
        </Card>
      )}
    </>
  );
}

/* ---------- بيانات الخريج: يدخلها ويحدّثها بنفسه ---------- */
const EMPTY_AD = { email: "", phone: "", city: "", employer: "", title: "", institution: "", program: "", degree: "ماجستير" };
function AlumData({ s, dest }: { s: Stu; dest: string }) {
  const st = usePortal();
  const saved = st.alumData[s.id];
  const [f, setF] = useState({ ...EMPTY_AD, ...(saved ?? {}) });
  const [ok, setOk] = useState(false);
  const set1 = (k: keyof typeof EMPTY_AD) => (e: { target: { value: string } }) => { setOk(false); setF({ ...f, [k]: e.target.value }); };
  const working = dest === "emp";
  const studying = dest === "edu";
  return (
    <Card>
      <h4 className="text-base font-extrabold text-navy">بياناتي</h4>
      <p className="mt-1 text-xs leading-6 text-ink-2">أنت من يحدّثها، وتصل إلى المركز والجامعة وتدخل في نتائج دفعتك.</p>
      <form
        className="mt-3 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const { updated: _u, ...d } = f as typeof f & { updated?: string };
          void _u;
          portalActions.setAlumData(s.id, d);
          setOk(true);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-bold text-ink-2">البريد الإلكتروني<input type="email" dir="ltr" className={`${field} mt-1`} value={f.email} onChange={set1("email")} /></label>
          <label className="text-xs font-bold text-ink-2">الجوال<input dir="ltr" className={`${field} mt-1`} value={f.phone} onChange={set1("phone")} /></label>
          <label className="text-xs font-bold text-ink-2">المدينة<input className={`${field} mt-1`} value={f.city} onChange={set1("city")} /></label>
        </div>
        {working && (
          <div className="grid gap-3 rounded-[12px] border border-[#e6e0d9] p-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-ink-2">جهة العمل<input className={`${field} mt-1`} value={f.employer} onChange={set1("employer")} /></label>
            <label className="text-xs font-bold text-ink-2">المسمى الوظيفي<input className={`${field} mt-1`} value={f.title} onChange={set1("title")} /></label>
          </div>
        )}
        {studying && (
          <div className="grid gap-3 rounded-[12px] border border-[#e6e0d9] p-3 sm:grid-cols-3">
            <label className="text-xs font-bold text-ink-2">الجامعة<input className={`${field} mt-1`} value={f.institution} onChange={set1("institution")} /></label>
            <label className="text-xs font-bold text-ink-2">البرنامج<input className={`${field} mt-1`} value={f.program} onChange={set1("program")} /></label>
            <label className="text-xs font-bold text-ink-2">الدرجة<select className={`${field} mt-1`} value={f.degree} onChange={set1("degree")}><option>ماجستير</option><option>دكتوراه</option><option>دبلوم عالٍ</option></select></label>
          </div>
        )}
        {!working && !studying && <p className="text-xs text-ink-2">اختر وضعك المهني أعلاه «موظف» أو «دراسة عليا» لتظهر تفاصيل جهة العمل أو الدراسة.</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={btn}>حفظ بياناتي</button>
          {ok && <span role="status" className="text-xs font-bold text-[#3a6e22]">حُفظت بياناتك.</span>}
          {saved && !ok && <span className="text-xs text-ink-2">آخر تحديث: {saved.updated}</span>}
        </div>
      </form>
    </Card>
  );
}

/* ---------- رحلة الخريج السابق ---------- */
function AlumniJourney({ s, go }: { s: Stu; go: (k: string) => void }) {
  const st = usePortal();
  const dest = destOf(st, s.id);
  const grad = (s as any).gradYear as number;
  const verified = (s as any).verified === true;
  const tasks = (journey.periods.find((p: any) => p.id === "graduate") as any)?.tasks ?? [];
  const done = (i: number) => st.ticks[`${s.id}:alm-${i}`] ?? false;
  return (
    <>
      <AgendaNotes s={s} go={go} />
      <ProgressBadges s={s} pct={Math.round((100 * tasks.filter((_: any, k: number) => done(k)).length) / Math.max(1, tasks.length))} go={go} />
      <div className="rounded-[14px] bg-blue p-4 text-white shadow-sm md:p-5">
        <p className="text-xs text-white/70">خريج دفعة {grad} · كلية {s.college}</p>
        <h4 className="mt-1 text-xl font-extrabold">أهلًا {s.name.split(" ")[0]}</h4>
        <p className="mt-1 text-sm leading-7 text-white/80">المركز يرافقك خمس سنوات بعد التخرج: وظائف، وإرشاد، وتحديث لوضعك المهني.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/15 px-3 py-1 font-bold">{verified ? "جداراتك موثقة" : "جداراتك لم تُوثَّق بعد"}</span>
          <button type="button" className="rounded-full bg-white px-3 py-1 font-bold text-navy" onClick={() => go("counsel")}>{verified ? "احجز جلسة" : "اطلب التوثيق من مرشدك"}</button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
        <Card>
          <h4 className="mb-1 text-base font-extrabold text-navy">وضعي المهني الآن</h4>
          <p className="mb-3 text-xs leading-6 text-ink-2">حدّث وضعك سنويًا. يحسبه المركز في نتائج دفعتك.</p>
          <select aria-label="وضعي المهني" className={field} value={dest} onChange={(e) => portalActions.setDestination(s.id, e.target.value)}>
            <option value="unknown">لم أحدد بعد</option>
            {Object.entries(DEST_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <h4 className="mb-2 mt-5 text-base font-extrabold text-navy">متابعتي بعد التخرج</h4>
          <ul className="space-y-1.5">
            {tasks.map((t: any, i: number) => (
              <li key={i}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] bg-[#f8f6f3] px-3 py-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[#3f7a24]" checked={done(i)} onChange={() => portalActions.toggleTick(s.id, `alm-${i}`, done(i))} />
                  <span className={done(i) ? "text-ink-2 line-through" : ""}>{t.text}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
        <AlumData s={s} dest={dest} />
        </div>
        <div className="space-y-4">
          <GoalPicker s={s} intro="الأدوار والقطاعات التي تستهدفها، ويراها مرشدك." />
          <button type="button" onClick={() => go("jobs")} className="block text-xs font-bold text-orange-text hover:underline">تصفح الوظائف المناسبة لك</button>
        </div>
      </div>
    </>
  );
}

/* ---------- ملفي ومهاراتي ---------- */
function Profile({ s }: { s: Stu }) {
  const st = usePortal();
  const visible = !st.hidden[s.id];
  const pre = (s as any).pre as Record<string, number> | undefined;
  const inList = st.shortlist.some((x) => x.studentId === s.id);
  return (
    <CvView
      v={cvData(s, st.certPlan)}
      shareSlot={
        <>
          {s.year >= 3 && (
            <Card>
              <h4 className="mb-2 text-base font-extrabold text-navy">ظهوري لأصحاب العمل</h4>
              <p className="text-xs leading-6 text-ink-2">القرار لك. إن أخفيت ملفك لن يظهر للشركات، وتبقى طلباتك الحالية كما هي.</p>
              <button
                type="button"
                aria-pressed={visible}
                onClick={() => portalActions.setVisible(s.id, !visible)}
                className={`mt-3 w-full rounded-[10px] px-4 py-2 text-sm font-bold ${visible ? "bg-teal text-white hover:bg-blue-bright" : "border border-navy text-navy hover:bg-[#f0ece7]"}`}
              >
                {visible ? "ملفي ظاهر لأصحاب العمل" : "ملفي مخفي، اضغط لإظهاره"}
              </button>
              {inList && <p className="mt-2 text-xs font-bold text-[#3a6e22]">أضافتك {COMPANY.name} إلى قائمتها.</p>}
            </Card>
          )}
          <Card>
            <h4 className="text-base font-extrabold text-navy">كل جداراتي</h4>
            <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">
              الدرجة من 1 إلى 5. {pre ? "الأول من Nova في السنة الأولى، والحالي آخر قياس، والفارق نموك." : "هذا قياسك الحالي، ولا قياس سابق للمقارنة."}
            </p>
            {pre && (
              <p className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-2">
                <span className="flex items-center gap-1"><span className="h-2 w-5 rounded-full bg-teal" />الحالي</span>
                <span className="flex items-center gap-1"><span className="h-3 w-0.5 bg-blue" />القياس الأول</span>
              </p>
            )}
            <ul className="space-y-3">
              {COMPS.map((c) => {
                const now = sc(s, c.id);
                const first = pre ? pre[c.id] : undefined;
                const d = first === undefined ? null : now - first;
                return (
                  <li key={c.id} className="text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-bold text-navy">{c.name}</span>
                      <span className="flex items-center gap-2 text-ink-2">
                        {first !== undefined && <span>الأول: {first}</span>}
                        <span className="font-bold text-navy">الحالي: {now} من 5</span>
                        {d !== null && d !== 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${d > 0 ? "bg-[#e3f0d9] text-[#3a6e22]" : "bg-[#fdecea] text-[#a93226]"}`}>{d > 0 ? `+${d}` : d}</span>}
                        {d === 0 && <span className="rounded-full bg-[#f1ece5] px-2 py-0.5 text-[10px] font-bold text-ink-2">ثابت</span>}
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-2 rounded-full bg-[#e9e3db]">
                      <div className="absolute inset-y-0 start-0 rounded-full bg-teal" style={{ width: `${(100 * now) / 5}%` }} />
                      {first !== undefined && <span aria-hidden="true" className="absolute -top-0.5 h-3 w-0.5 bg-blue" style={{ insetInlineStart: `${(100 * first) / 5}%` }} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      }
    />
  );
}

/* ---------- الفصول ---------- */
function Semesters({ s, cur, setCur, data }: { s: Stu; cur: number; setCur: (n: number) => void; data: ComponentProps<typeof Skills> }) {
  const [sel, setSel] = useState(cur);
  const { isDone, toggle } = useTasks(s, cur);
  const skillById = new Map(data.skills.categories.flatMap((c) => c.skills).map((k) => [k.id, k]));
  const allSkills = [...skillById.values()];
  const covered = (upTo: number) => {
    const ids = new Set<string>();
    data.semesters.filter((x) => x.semester <= upTo).forEach((x) => x.courses.forEach((c) => ((data.courseSkillMap as any)[c.code] ?? []).forEach((i: string) => ids.add(i))));
    allSkills.filter((k) => (k as any).centerSemesters?.some((n: number) => n <= upTo)).forEach((k) => ids.add(k.id));
    return ids;
  };
  const gotten = covered(cur);
  const sem = data.semesters.find((x) => x.semester === sel)!;
  const per = periods.find((p) => p.id === sel);
  const here = allSkills.filter((k: any) => k.centerSemesters?.includes(sel));
  const state = (n: number) => (n < cur ? "done" : n === cur ? "now" : "next");
  const centerAll = allSkills.filter((k: any) => k.centerSemesters?.length).sort((a: any, b: any) => a.centerSemesters[0] - b.centerSemesters[0]) as any[];
  const semHas = (n: number) => centerAll.some((k) => k.centerSemesters.includes(n));
  return (
    <>
      <section aria-label="مهارات يقدمها المركز" className="overflow-hidden rounded-[14px] border border-navy/20 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-blue px-5 py-3 text-white">
          <div>
            <h4 className="text-base font-extrabold">مهارات يقدمها لك المركز</h4>
            <p className="text-xs leading-6 text-white/80">{centerAll.length} مهارات من {allSkills.length} لا تغطيها مواد الجامعة، يقدمها المركز في فصول محددة.</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">أنت في الفصل {cur}</span>
        </div>
        <ul className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {centerAll.map((k) => {
            const n = k.centerSemesters[0];
            const st2 = state(n);
            return (
              <li key={k.id}>
                <button
                  type="button"
                  onClick={() => setSel(n)}
                  className={`h-full w-full rounded-[12px] border p-3 text-start transition-colors hover:border-navy ${st2 === "now" ? "border-blue bg-[#f3ecdc]" : st2 === "done" ? "border-[#cfe6df] bg-[#f1f8ec]" : "border-[#e3ddd5] bg-[#faf8f5]"}`}
                >
                  <span className="flex items-center justify-between gap-2 text-[11px] font-bold">
                    <span className="rounded-full bg-blue px-2 py-0.5 text-white">الفصل {n}</span>
                    <span className={st2 === "now" ? "text-orange-text" : st2 === "done" ? "text-[#3a6e22]" : "text-ink-2"}>{st2 === "done" ? "مضى" : st2 === "now" ? "الحالي" : "قادم"}</span>
                  </span>
                  <span className="mt-2 block text-sm font-extrabold text-navy">{k.name}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-ink-2">{k.centerUnit?.title ?? ""}{k.delivery === "optional" ? " · اختياري" : ""}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h4 className="text-base font-extrabold text-navy">خطتي الدراسية والمهارية</h4>
            <p className="mt-1 text-xs leading-6 text-ink-2">كل مادة تنمّي مهارات، وما لا تغطيه الجامعة يقدمه المركز. حتى الفصل {cur}: {gotten.size} من {allSkills.length} مهارة.</p>
          </div>
          <label className="text-xs font-bold text-ink-2">
            أنا الآن في الفصل
            <select
              className={`${field} mt-1 block`}
              value={cur}
              onChange={(e) => {
                setCur(Number(e.target.value));
                setSel(Number(e.target.value));
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_3rem] items-center gap-2 text-xs">
          <Bar v={(100 * gotten.size) / allSkills.length} />
          <span dir="ltr" className="text-ink-2">{Math.round((100 * gotten.size) / allSkills.length)}%</span>
        </div>
        <div role="tablist" aria-label="الفصول" className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              role="tab"
              type="button"
              aria-selected={sel === n}
              onClick={() => setSel(n)}
              className={`rounded-[10px] border px-2 py-2 text-center text-xs font-bold transition-colors ${sel === n ? "border-navy bg-blue text-white" : "border-[#d9d2ca] bg-white text-navy hover:border-navy"}`}
            >
              <span className="block text-sm">{n}</span>
              <span className={`block text-[10px] ${sel === n ? "text-white/80" : "text-ink-2"}`}>{state(n) === "done" ? "مضى" : state(n) === "now" ? "الحالي" : "قادم"}</span>
              {semHas(n) && <span className={`mt-1 inline-block rounded-full px-1.5 text-[9px] font-bold ${sel === n ? "bg-white text-navy" : "bg-blue text-white"}`}>المركز</span>}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h4 className="mb-3 text-base font-extrabold text-navy">مواد الفصل {sel}</h4>
          <ul className="space-y-2">
            {sem.courses.map((c) => {
              const ks: string[] = (data.courseSkillMap as any)[c.code] ?? [];
              return (
                <li key={c.code} className="rounded-[10px] bg-[#f8f6f3] p-3">
                  <p className="text-sm font-bold text-navy">
                    {c.name ?? "مادة اختيارية"} <span className="text-xs font-normal text-ink-2" dir="ltr">{c.name ? c.code : ""}</span>
                  </p>
                  {ks.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {ks.map((k) => (
                        <span key={k} className="rounded-md bg-[#e3f0d9] px-2 py-0.5 text-xs font-semibold text-orange-text">{skillById.get(k)?.name ?? k}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-ink-2">{c.name ? "لا مهارات مربوطة بها بعد" : "تختارها بحسب رغبتك"}</p>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs leading-6 text-ink-2">الربط بين المواد والمهارات تجريبي ومبني على أسماء المواد.</p>
        </Card>

        <div className="space-y-4">
          <div className={`overflow-hidden rounded-[14px] border bg-white ${here.length ? "border-blue shadow-sm" : "border-[#e3ddd5]"}`}>
           <div className={`px-4 py-2.5 text-sm font-extrabold ${here.length ? "bg-blue text-white" : "bg-[#f1ece5] text-navy"}`}>ما يقدمه المركز في الفصل {sel}</div>
           <div className="p-4">
            {here.length ? (
              <ul className="space-y-2">
                {here.map((k: any) => (
                  <li key={k.id} className="rounded-[10px] bg-[#f3ecdc] p-3 text-sm">
                    <p className="font-bold text-navy">{k.centerUnit?.title ?? k.name}</p>
                    <p className="text-xs text-ink-2">ينمّي: {k.name}{k.delivery === "optional" ? " · اختياري" : ""}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-2">لا وحدات إضافية من المركز في هذا الفصل.</p>
            )}
           </div>
          </div>
          {per && (
            <Card>
              <h4 className="mb-1 text-base font-extrabold text-navy">{per.title}</h4>
              <p className="mb-2 text-xs leading-6 text-ink-2">{per.headline}</p>
              <ul className="space-y-1.5">
                {per.tasks.map((t: any, i: number) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] bg-[#f8f6f3] px-3 py-2 text-sm">
                      <input type="checkbox" className="h-4 w-4 accent-[#3f7a24]" checked={isDone(per.id, i)} onChange={() => toggle(per.id, i)} />
                      <span className={isDone(per.id, i) ? "text-ink-2 line-through" : ""}>{t.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

import ProjectShowcase from "./ProjectShowcase";

/* ---------- الوظائف والمشاريع ---------- */
function Jobs({ s }: { s: Stu }) {
  const st = usePortal();
  const mine = st.applications.filter((a) => a.studentId === s.id);
  const item = st.shortlist.find((x) => x.studentId === s.id);
  if (s.year < 4)
    return (
      <Card>
        <h4 className="text-base font-extrabold text-navy">تفتح الوظائف والمشاريع في السنة الرابعة</h4>
        <p className="mt-2 text-sm leading-7 text-ink-2">{s.year === 3 ? "في سنتك هذه تحدّد مسارك وتجهّز سيرتك وتتدرب على المقابلات. المشاريع في الفصل الثامن، والوظائف في السنة الرابعة." : "في سنتك الحالية تركّز على فهم نفسك واستكشاف الأدوار. المشاريع في الفصل الثامن، والوظائف في السنة الرابعة."} تابع رحلتك لتصل إليها جاهزًا.</p>
      </Card>
    );
  const list = st.jobs.filter((j) => j.status === "published" && jobYear(j.type) === jobYearFor(s.year) && (s.year !== 5 || j.type !== "مشروع"));
  const rows = list
    .map((j) => {
      const sc2 = j.comps.map((c) => sc(s, c));
      return { j, pct: Math.round((100 * sc2.reduce((a, b) => a + b, 0)) / (5 * j.comps.length)), miss: j.comps.filter((c) => sc(s, c) < 3), applied: mine.some((a) => a.jobId === j.id) };
    })
    .sort((a, b) => b.pct - a.pct);
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">{s.year === 5 ? "الوظائف المتاحة" : "الوظائف وفرص المشاريع"}</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">
          هنا ما اعتمده المركز فقط. التطابق هو متوسط درجاتك في الجدارات المطلوبة. {item && "طلباتك تتحول إلى قائمة الشركة تلقائيًا."}
        </p>
        {!rows.length ? (
          <p className="mt-3 text-sm text-ink-2">لا توجد فرص معتمدة الآن. تظهر هنا ما إن تنشرها شركة ويعتمدها المركز.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map(({ j, pct, miss, applied }) => (
              <li key={j.id} className="rounded-[12px] border border-[#e6e0d9] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold text-navy">{j.title}</p>
                    <p className="text-xs text-ink-2">{COMPANY.name} · {j.type} · {j.city}{j.deadline ? ` · آخر موعد ${j.deadline}` : ""}</p>
                    <p className="mt-2 text-sm leading-7 text-ink">{j.desc}</p>
                    {j.coop && (
                      <p className="mt-1 text-xs leading-6 text-ink-2">
                        {j.coop.duration} · يبدأ {j.coop.start || "—"} · {j.coop.seats === 1 ? "طالب واحد" : `${j.coop.seats} طلاب`} · المشرف: {j.coop.supervisor}
                        {j.coop.deliverable && <><br />المخرجات: {j.coop.deliverable}</>}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {j.comps.map((c) => (
                        <span key={c} className="rounded-md px-2 py-0.5 text-xs font-semibold" style={sc(s, c) >= 3 ? { background: "#e3f0d9", color: "#3a6e22" } : { background: "#f7f0da", color: "#7a6420" }}>
                          {COMPS.find((x) => x.id === c)?.name} {sc(s, c)}/5
                        </span>
                      ))}
                    </div>
                    {miss.length > 0 && <p className="mt-1.5 text-xs text-[#7a6420]">ينقصك للوصول للحد الأدنى: {miss.map((c) => COMPS.find((x) => x.id === c)?.name).join("، ")}. يمكنك التقديم، لكن فرصتك أضعف.</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-orange-text" dir="ltr">{pct}%</p>
                    <p className="mb-2 text-[11px] text-ink-2">تطابق</p>
                    {applied ? (
                      <button type="button" onClick={() => portalActions.withdrawJob(s.id, j.id)} className="rounded-[10px] border border-navy px-4 py-2 text-sm font-bold text-navy hover:bg-[#f0ece7]">
                        سحب الطلب
                      </button>
                    ) : (
                      <button type="button" onClick={() => portalActions.applyJob(s.id, j.id)} className={btn}>
                        تقدّم
                      </button>
                    )}
                  </div>
                </div>
                {applied && <p className="mt-2 text-xs font-bold text-[#3a6e22]">أُرسل طلبك إلى {COMPANY.name}.</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
      {item && (
        <Card>
          <h4 className="mb-3 text-base font-extrabold text-navy">حالتي لدى {COMPANY.name}</h4>
          <ol className="flex flex-wrap gap-2">
            {stagesFor(s.id).map((g, i, a) => {
              const at = a.findIndex((x) => x.id === item.stage);
              return (
                <li key={g.id} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: i <= at ? "#3f7a24" : "#eee9e3", color: i <= at ? "#fff" : "#4a5560" }}>
                  {g.name}
                </li>
              );
            })}
          </ol>
        </Card>
      )}
      {s.year !== 5 && <ProjectShowcase />}
    </>
  );
}

/* ---------- تحديات الأعمال ---------- */
function Challenges({ s }: { s: Stu }) {
  const st = usePortal();
  const [text, setText] = useState<Record<string, string>>({});
  if (s.year !== 4)
    return (
      <Card>
        <h4 className="text-base font-extrabold text-navy">تحديات الأعمال لطلاب السنة الرابعة</h4>
        <p className="mt-2 text-sm leading-7 text-ink-2">شركات تطرح مشكلات حقيقية تحلها، وتقيّم لجنتها الحلول. تُفتح في السنة الرابعة.</p>
      </Card>
    );
  const list = st.challenges.filter((c) => c.status === "published");
  return (
    <>
      <p className="text-sm leading-7 text-ink-2">حل التحدي يضيف إلى سيرتك دليلًا عمليًا، وتقييم الشركة يظهر في ملفك.</p>
      {!list.length && (
        <Card>
          <p className="text-sm text-ink-2">لا توجد تحديات معتمدة الآن.</p>
        </Card>
      )}
      {list.map((c) => {
        const mine = c.subs.find((x) => x.studentId === s.id);
        const fit = Math.round((100 * c.comps.reduce((a, k) => a + sc(s, k), 0)) / (5 * c.comps.length));
        return (
          <Card key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold text-navy">{c.title}</p>
                <p className="text-xs text-ink-2">{COMPANY.name}{c.deadline ? ` · آخر موعد ${c.deadline}` : ""}</p>
                <p className="mt-2 text-sm leading-7 text-ink">{c.desc}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.comps.map((k) => (
                    <span key={k} className="rounded-md bg-[#e3f0d9] px-2 py-0.5 text-xs font-semibold text-orange-text">{COMPS.find((x) => x.id === k)?.name}</span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-orange-text" dir="ltr">{fit}%</p>
                <p className="text-[11px] text-ink-2">ملاءمتك</p>
              </div>
            </div>
            {mine?.rating ? (
              <p className="mt-3 rounded-[10px] bg-[#e3f0d9] p-3 text-sm font-bold text-[#3a6e22]">قيّمت {COMPANY.name} حلّك: {mine.rating} من 5</p>
            ) : (
              <>
                <label className="mt-3 block text-xs font-bold text-ink-2">
                  {mine ? "حلّك المسلَّم (يمكنك تعديله قبل التقييم)" : "حلّك المقترح"}
                  <textarea
                    rows={4}
                    className={`${field} mt-1`}
                    value={text[c.id] ?? mine?.text ?? ""}
                    onChange={(e) => setText({ ...text, [c.id]: e.target.value })}
                    placeholder="لخّص تحليلك وتصميمك البديل والمؤشرات التي ستقيس بها النجاح."
                  />
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" disabled={(text[c.id] ?? mine?.text ?? "").trim().length < 20} onClick={() => portalActions.joinChallenge(c.id, s.id, (text[c.id] ?? mine?.text ?? "").trim())} className={btn}>
                    {mine ? "تحديث التسليم" : "سلّم الحل"}
                  </button>
                  {mine && <Pill ok>تم التسليم، بانتظار التقييم</Pill>}
                </div>
              </>
            )}
          </Card>
        );
      })}
    </>
  );
}

/* ---------- الإشعارات ---------- */
export function useNotes(s: Stu | undefined) {
  const st = usePortal();
  const notes: { id: string; tone: "ok" | "act" | "info"; title: string; text: string }[] = [];
  if (!s) return notes;
  const it = st.shortlist.find((x) => x.studentId === s.id);
  if (it) {
    const job = st.jobs.find((j) => j.id === it.jobId);
    const w = job ? ` (${job.title})` : "";
    if (it.stage === "shortlisted") notes.push({ id: "sl", tone: "info", title: `أضافتك ${COMPANY.name} إلى قائمتها`, text: `أبدت الشركة اهتمامًا بملفك${w}.` });
    if (it.stage === "interview") notes.push({ id: "iv", tone: "act", title: "دعتك الشركة إلى مقابلة", text: `${COMPANY.name}${w}. استعد وراجع سيرتك.` });
    if (it.stage === "offer") notes.push({ id: "of", tone: "act", title: "وصلك عرض", text: `${COMPANY.name}${w}. اقبله أو اعتذر منه.` });
    if (it.stage === "hired") notes.push({ id: "hr", tone: "ok", title: "تم توظيفك", text: `مبارك. وجهتك بعد التخرج: موظف لدى ${COMPANY.name}${w}.` });
    if (it.stage === "accepted") notes.push({ id: "ac", tone: "ok", title: "أُسند إليك مشروع", text: `${COMPANY.name}${w}${job?.coop ? ` · ${job.coop.duration} · المشرف: ${job.coop.supervisor}` : ""}.` });
    if (it.stage === "completed") notes.push({ id: "cm", tone: "ok", title: "سلّمت المشروع", text: it.rating ? `تقييم الشركة لك: ${it.rating} من 5.` : "بانتظار تقييم الشركة." });
    if (it.converted) notes.push({ id: "cv", tone: "ok", title: "عُرضت عليك وظيفة بعد التخرج", text: `${COMPANY.name} تريد استمرارك معها بعد المشروع.` });
    if (it.credited) notes.push({ id: "cr", tone: "ok", title: "اعتُمدت ساعات مشروعك", text: "اعتمد المشرف الأكاديمي الساعات." });
    if (it.rating && it.stage === "hired") notes.push({ id: "rt", tone: "info", title: "تقييم الأداء", text: `${it.rating} من 5` });
  }
  st.challenges.filter((c) => c.status === "published").forEach((c) => {
    const m = c.subs.find((x) => x.studentId === s.id);
    if (m?.rating) notes.push({ id: `ch${c.id}`, tone: "ok", title: `قيّمت الشركة حلّك: ${c.title}`, text: `${m.rating} من 5` });
  });
  st.applications.filter((a) => a.studentId === s.id).forEach((a) => {
    const j = st.jobs.find((x) => x.id === a.jobId);
    if (j) notes.push({ id: `ap${a.jobId}`, tone: "info", title: `استلمت الشركة طلبك: ${j.title}`, text: "ستجده في قائمة المتقدمين لدى الشركة." });
  });
  if (st.contacted[s.id] && s.year === 5 && destOf(st, s.id) === "unknown") notes.push({ id: "ct", tone: "act", title: "تواصل معك المركز", text: "حدّث وضعك المهني من صفحة «رحلتي» ليصل إلى نتائج الجامعة." });
  if (st.contacted[s.id] && s.year !== 5) notes.push({ id: "ct", tone: "act", title: "تواصل معك مرشدك", text: "احجز جلسة من صفحة «الإرشاد» لتتابع خطتك." });
  st.alumReqs.forEach((r) => {
    if (r.alumId === s.id && r.status === "pending") notes.push({ id: `ar${r.id}`, tone: "act", title: "طلب إرشاد من طالب", text: `${ANY_STUDENTS.find((x) => x.id === r.studentId)?.name}: ${r.topic}. ردّ من صفحة «الإرشاد».` });
    if (r.studentId === s.id && r.status !== "pending") notes.push({ id: `ar${r.id}`, tone: r.status === "accepted" ? "ok" : "info", title: r.status === "accepted" ? "قبل خريج إرشادك" : "اعتذر خريج عن الإرشاد", text: `${ALUM_MENTORS.find((x) => x.id === r.alumId)?.name} · ${r.topic}` });
  });
  st.bookings.filter((b) => b.studentId === s.id).forEach((b) => {
    const m = mentorOf(s.id).name;
    if (b.status === "confirmed") notes.push({ id: `bk${b.id}`, tone: "ok", title: "أكّد المرشد موعدك", text: `${m} · ${b.topic} · ${b.slot}` });
    if (b.status === "done" && b.note) notes.push({ id: `bk${b.id}`, tone: "info", title: "ملاحظات جلستك", text: `${m}: ${b.note}` });
    if (b.status === "cancelled") notes.push({ id: `bk${b.id}`, tone: "act", title: "تعذّر موعدك", text: `${b.topic}. اطلب موعدًا آخر.` });
  });
  st.events.filter((e) => e.registered.includes(s.id)).forEach((e) => notes.push({ id: `ev${e.id}`, tone: "info", title: `سجّلت في: ${e.title}`, text: `${e.date} · ${e.place}${e.attended.includes(s.id) ? " · سُجّل حضورك" : ""}` }));
  if ((s as any).verified) notes.push({ id: "vf", tone: "ok", title: "اجتزت لجنة التحقق", text: "شهادة الجدارات موثقة في سيرتك." });
  return notes;
}

function Offers({ s }: { s: Stu }) {
  const st = usePortal();
  const notes = useNotes(s);
  const it = st.shortlist.find((x) => x.studentId === s.id);
  return (
    <>
      {it?.stage === "offer" && (
        <Card className="border-2 border-gold">
          <h4 className="text-base font-extrabold text-navy">عرض بانتظار ردك</h4>
          <p className="mt-1 text-sm text-ink-2">{COMPANY.name} تعرض عليك وظيفة. بعد قبولك تُحسب ضمن الموظفين في نتائج دفعتك.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className={btn} onClick={() => portalActions.respondOffer(s.id, true)}>
              قبول العرض
            </button>
            <button type="button" className="rounded-[10px] border border-navy px-4 py-2 text-sm font-bold text-navy hover:bg-[#f0ece7]" onClick={() => portalActions.respondOffer(s.id, false)}>
              اعتذار
            </button>
          </div>
        </Card>
      )}
      {st.declined[s.id] && !it && (
        <Card>
          <p className="text-sm text-ink-2">اعتذرت عن عرض سابق. يمكنك التقديم على غيره من تبويب الوظائف.</p>
        </Card>
      )}
      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">الإشعارات</h4>
        {notes.length ? (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: n.tone === "act" ? "#cdb774" : n.tone === "ok" ? "#3f7a24" : "#3f7a24" }} />
                <div>
                  <p className="text-sm font-bold text-navy">{n.title}</p>
                  <p className="text-xs leading-6 text-ink-2">{n.text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-2">لا إشعارات بعد. ستصلك هنا تحديثات الشركات والمركز.</p>
        )}
      </Card>
    </>
  );
}

/* ---------- الإرشاد ---------- */
const SLOTS = ["اليوم 14:00", "غدًا 10:00", "الأحد 10:00", "الاثنين 11:00", "الثلاثاء 09:30", "الأربعاء 12:00", "الخميس 10:30"];
const TOPICS_ALUM = ["تفسير نتيجة Nova للخريجين", "مراجعة السيرة", "التحضير للمقابلة", "تطوير المسار المهني", "الدراسة العليا", "طلب توثيق الجدارات"];
const TOPICS = ["تفسير نتيجة Nova", "طلب توثيق الجدارات", "مراجعة السيرة", "التحضير للمقابلة", "اختيار المسار", "الدراسة العليا"];
function Counsel({ s }: { s: Stu }) {
  const st = usePortal();
  const [slot, setSlot] = useState(SLOTS[1]);
  const [topic, setTopic] = useState((s.year === 5 ? TOPICS_ALUM : TOPICS)[0]);
  const [mode, setMode] = useState<"inperson" | "video">("inperson");
  const [link, setLink] = useState<string | null>(null);
  const svc = (s as any).svc as { nova: boolean; cv: boolean; sessions: number; roles: number };
  const mine = st.bookings.filter((b) => b.studentId === s.id && b.status !== "cancelled");
  const mentor = mentorOf(s.id);
  const evs = st.events;
  const alumNova = s.year === 5 && !svc.nova;
  const novaReq = st.novaReq[s.id];
  return (
    <>
      {alumNova && (
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-extrabold text-navy">تقييم Nova للخريجين</h4>
            <span className="rounded-full bg-[#f7f0da] px-2.5 py-0.5 text-[11px] font-bold text-[#7a6420]">مقترح</span>
          </div>
          <p className="mt-1 text-sm leading-7 text-ink-2">لم تُجرِ تقييم Nova بعد. أجرِه الآن لتصير نتيجته قياسك الأول.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["للطالب في السنة الأولى", "يساعده على اختيار المسار والتخصص ويبدأ من الصفر."],
              ["للخريج", "يقيّم ملاءمة دورك الحالي، ويحدد مسارك التالي: ترقية أو انتقال أو دراسة عليا."],
              ["الأسئلة", "تركّز على خبرتك العملية وبيئة العمل التي تناسبك، لا على اختيار التخصص."],
              ["جلسة التفسير", "تُحجز بموضوع «تفسير نتيجة Nova للخريجين» مع مرشدك."],
            ].map(([t, x]) => (
              <li key={t} className="rounded-[10px] bg-[#f8f6f3] p-3 text-xs leading-6"><b className="text-navy">{t}: </b>{x}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" disabled={!!novaReq} className={btn} onClick={() => portalActions.requestNova(s.id)}>{novaReq ? "تم طلب التقييم" : "اطلب تقييم Nova"}</button>
            {novaReq && <span role="status" className="text-xs font-bold text-[#3a6e22]">أُرسل رابط التقييم إلى بريدك بتاريخ {novaReq}. بعد إكماله احجز جلسة التفسير.</span>}
          </div>
        </Card>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [svc.nova ? "مكتمل" : st.novaReq[s.id] ? "مطلوب" : "لم يبدأ", "تقييم Nova"],
          [svc.cv || st.cvChecks[s.id] ? "تمت" : "لم تتم", "مراجعة السيرة بالذكاء الاصطناعي"],
          [String(svc.sessions + mine.filter((b) => b.status === "done").length), "جلسات إرشاد منتهية"],
        ].map(([n, l]) => (
          <Card key={l}>
            <p className="text-2xl font-extrabold text-orange-text">{n}</p>
            <p className="mt-1 text-xs text-ink-2">{l}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h4 className="text-base font-extrabold text-navy">احجز جلسة مع مرشدك</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">مرشدك: {mentor.name}. يؤكد طلبك أو يقترح موعدًا بديلًا. وللمركز ساعات مفتوحة كل خميس بلا حجز.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-bold text-ink-2">
            الموعد
            <select className={`${field} mt-1`} value={slot} onChange={(e) => setSlot(e.target.value)}>
              {SLOTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            الموضوع
            <select className={`${field} mt-1`} value={topic} onChange={(e) => setTopic(e.target.value)}>
              {(s.year === 5 ? TOPICS_ALUM : TOPICS).map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        </div>
        <fieldset className="mt-3">
          <legend className="text-xs font-bold text-ink-2">طريقة اللقاء</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {(["inperson", "video"] as const).map((m) => (
              <label key={m} className={`flex cursor-pointer items-start gap-2.5 rounded-[10px] border p-3 text-sm ${mode === m ? "border-teal bg-[#f0f6ea]" : "border-[#e6e0d9] bg-white"}`}>
                <input type="radio" name="bk-mode" className="mt-1 accent-[#3f7a24]" checked={mode === m} onChange={() => setMode(m)} />
                <span>
                  <span className="block font-bold text-navy">{m === "video" ? "مكالمة فيديو" : "لقاء حضوري"}</span>
                  <span className="block text-xs leading-6 text-ink-2">{m === "video" ? "ينشئ المركز رابطًا عند تأكيد الموعد. مناسب لمن خارج الجامعة أو وقته ضيق." : "في مقر المركز المهني بالجامعة. مناسب لمراجعة السيرة وجلسات التخطيط."}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" disabled={mine.some((b) => b.slot === slot)} className={`${btn} mt-3`} onClick={() => portalActions.bookSession(s.id, slot, topic, mode)}>
          طلب الحجز
        </button>
        {mine.some((b) => b.slot === slot) && <p className="mt-2 text-xs font-bold text-[#7a6420]">لديك طلب في هذا الموعد. اختر موعدًا آخر أو ألغِ طلبك أولًا.</p>}
        {mine.length > 0 && (
          <ul className="mt-4 space-y-2" aria-live="polite">
            {mine.map((b) => (
              <li key={b.id} className="rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-navy">{b.topic}</span>
                  <span className="text-xs text-ink-2">{b.slot} · {MODE_LABEL[b.mode ?? "inperson"]}</span>
                  <Pill ok={b.status === "requested" ? null : b.status === "confirmed" ? true : undefined}>{b.status === "requested" ? "بانتظار تأكيد المرشد" : b.status === "confirmed" ? "مؤكدة" : "انتهت"}</Pill>
                </div>
                {b.status === "confirmed" && b.mode === "video" && (
                  <div className="mt-2">
                    <button type="button" className={btn} onClick={() => joinSession(b.id, "student")}>ادخل غرفة الجلسة</button>
                    <span dir="ltr" className="ms-3 text-xs text-ink-2">{videoLink(b.id)}</span>
                  </div>
                )}
                {b.status === "confirmed" && b.mode !== "video" && <p className="mt-2 text-xs text-ink-2">مقر المركز المهني بالجامعة. احضر قبل الموعد بخمس دقائق.</p>}
                {b.status === "done" && b.note && <p className="mt-2 text-xs leading-6 text-ink">ملاحظات المرشد: {b.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {s.year === 5 ? <AlumRequests s={s} /> : <AlumNetwork s={s} />}

      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">فعاليات المركز</h4>
        <ul className="space-y-2">
          {evs.map((e) => {
            const on = e.registered.includes(s.id);
            const full = !on && e.registered.length >= e.seats;
            return (
              <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy">{e.title} <Pill ok={null}>{e.type}</Pill></p>
                  <p className="text-xs text-ink-2">{e.date} · {e.place} · {e.registered.length}/{e.seats} مقعد</p>
                </div>
                <button type="button" disabled={full} aria-pressed={on} className={on ? "rounded-[10px] border border-navy px-4 py-2 text-sm font-bold text-navy hover:bg-[#f0ece7]" : btn} onClick={() => portalActions.toggleRegister(e.id, s.id)}>
                  {on ? "إلغاء التسجيل" : full ? "اكتمل" : "سجّل"}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

/* ---------- دليل الطالب بحسب سنته ---------- */
const STUDENT_GUIDE: Record<number, { lead: string; steps: GuideStep[]; flows: string[] }> = {
  1: {
    lead: "أنت في السنة الأولى: «اعرف نفسك». هدفك ميولك ونقاط قوتك والتعرّف على المركز.",
    steps: [
      { title: "أجرِ تقييم Nova", text: "ثم احجز جلسة تفسير مع مرشدك من تبويب «الإرشاد»." },
      { title: "افتح ملفك", text: "سترى جداراتك الثماني وأنماط عملك، وتنمو معك كل سنة." },
      { title: "تابع مهام فصلك", text: "علّم ما أنجزته في «رحلتي» وسيتقدم شريط مرحلتك." },
      { title: "حدّد وجهتك المبدئية", text: "اختر الدور والقطاع الذي يستهويك، وغيّره متى شئت." },
    ],
    flows: ["مرشدك يرى جلساتك وتقدمك.", "إنجازاتك تدخل في مؤشرات خدمات المركز لدى الجامعة."],
  },
  2: {
    lead: "أنت في السنة الثانية: مرحلة «استكشف». هدفك أن تتعرف على الأدوار والقطاعات المناسبة لتخصصك.",
    steps: [
      { title: "استكشف ثلاثة أدوار على الأقل", text: "ابدأ من «وجهتي المهنية» في رحلتي، وادخل فعاليات المركز." },
      { title: "سجّل في لقاءات الخريجين والزيارات", text: "من تبويب «الإرشاد» تجد فعاليات المركز وتسجّل بضغطة." },
      { title: "حدّث خطتك المهنية", text: "بعد كل استكشاف عدّل وجهتك، ويطّلع مرشدك عليها." },
      { title: "تدرّب مبكرًا", text: "في «المدرب الذكي» جرّب المقابلات لتعتاد الأسئلة." },
    ],
    flows: ["تسجيلك في الفعاليات يصل مرشدي المركز.", "تقدمك يظهر في ملفك لدى الجامعة."],
  },
  3: {
    lead: "أنت في السنة الثالثة: «حدّد وجهّز». هدفك مسارك وسيرتك قبل مشاريع الفصل الثامن.",
    steps: [
      { title: "ابنِ سيرتك وراجعها", text: "في «المدرب الذكي» حلّل سيرتك وأضف ما يقترحه." },
      { title: "تدرّب على المقابلات", text: "المدرب الذكي يسألك ويقيّم إجاباتك، فتصل إلى التقديم في السنة الرابعة جاهزًا." },
      { title: "حدّد وجهتك", text: "اختر الدور والقطاع المستهدفين من «رحلتي» ليراهما مرشدك." },
    ],
    flows: ["تدريبك على المقابلات وسيرتك المراجعة تظهر للمركز والجامعة."],
  },
  4: {
    lead: "أنت في السنة الرابعة: «انطلق». هدفك مشروع الفصل الثامن، ثم أول وظيفة بملف موثق.",
    steps: [
      { title: "تقدّم للمشاريع والوظائف", text: "المشاريع في الفصل الثامن: تُسند إليك من شركة، وتسلّمها وتُقيَّم. قدّم من «الوظائف والمشاريع»." },
      { title: "حلّ تحديًا من شركة", text: "في «تحديات الأعمال» تسلّم حلًّا حقيقيًا تقيّمه الشركة ويضاف لسيرتك." },
      { title: "اجتز لجنة التحقق", text: "تتحقق اللجنة من جداراتك، وتظهر شارة التوثيق في سيرتك." },
      { title: "رُدّ على العروض", text: "عرض الشركة يصلك في «العروض والإشعارات»، وقبولك يسجّلك موظفًا." },
      { title: "سجّل وضعك بعد التخرج", text: "يدخل وضعك في نتائج دفعتك." },
    ],
    flows: ["قبولك في المشاريع يظهر في بوابة الجامعة لمتابعة ساعاتك.", "الشركة ترى سيرتك فقط إن أبقيت ظهورك مفتوحًا، وتخفيه من ملفك.", "توظيفك يغيّر نتائج دفعتك في بوابة الجامعة فورًا."],
  },
  5: {
    lead: "أنت خريج: يرافقك المركز خمس سنوات. هدفك فرصة مناسبة وبيانات محدّثة.",
    steps: [
      { title: "حدّث وضعك المهني", text: "موظف أو دراسة أو غيرهما. يحسبه المركز في نتائج دفعتك." },
      { title: "اطلب توثيق جداراتك", text: "احجز جلسة بعنوان «طلب توثيق الجدارات» مع مرشدك." },
      { title: "تصفح الوظائف", text: "وظائف الخريجين المعتمدة، والتقديم بضغطة." },
      { title: "تدرّب على المقابلات", text: "المدرب الذكي يسألك ويقيّم إجاباتك ويراجع سيرتك." },
    ],
    flows: ["أصحاب العمل يرونك ضمن «الخريجين السابقين» بشارة توثيق أو بدونها.", "تحديثك لوضعك يدخل في نتائج دفعتك لدى الجامعة."],
  },
};

/* ---------- البوابة ---------- */
function StudentGuide({ s }: { s: Stu }) {
  const g = STUDENT_GUIDE[s.year];
  const stage = stages.find((x: any) => x.id === Math.min(s.year, 4)) as any;
  return (
    <Guide
      id={`student-${s.year}`}
      kicker={s.year === 5 ? "خريج" : `${YEARS[s.year]} · ${stage?.name ?? ""}`}
      title={`أهلًا ${s.name.split(" ")[0]}، هذا ما ينتظرك`}
      lead={g.lead}
      steps={g.steps}
      flows={g.flows}
    />
  );
}

type Mode = "student" | "alumni";

export default function StudentPortal({ skills, mode }: { skills: ComponentProps<typeof Skills>; mode: Mode }) {
  const st = usePortal();
  const sid = st.session.student;
  const found = sid ? ANY_STUDENTS.find((x) => x.id === sid) : undefined;
  // الحساب المسجّل يظهر في بوابته فقط: الطالب في بوابة الطالب والخريج في بوابة الخريجين
  const s = found && (found.year === 5) === (mode === "alumni") ? found : undefined;
  const alum = mode === "alumni";
  const [reg, setReg] = useState(false);
  const wantRef = useRef(false);
  const [tab, setTab] = useState(0);
  const [cur, setCur] = useState(0);
  const sem = cur || (s ? Math.min(s.year, 4) * 2 - 1 : 1);
  const notes = useNotes(s).filter((n) => n.tone === "act").length;
  const tabs = ALL_TABS.filter((t) => !s || s.year !== 5 || ALUMNI_KEYS.includes(t[0])).map((t) => (s?.year === 5 && t[0] === "jobs" ? ["jobs", "الوظائف", "الوظائف", "وظائف معتمدة تناسب خبرتك، ونسبة تطابقها مع ملفك"] as [string, string, string, string] : s?.year === 5 && t[0] === "p" ? ["p", "ملفي ومهاراتي", "ملفي ومهاراتي", "سيرتك الموثقة وجداراتك، وأنت من يتحكم في ظهورها"] as [string, string, string, string] : t));
  const idx = Math.min(tab, tabs.length - 1);
  const key = tabs[idx][0];
  const goKey = (k: string) => setTab(Math.max(0, tabs.findIndex((t) => t[0] === k)));
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  useTabIntent((k) => ((wantRef.current = true), setTab(Math.max(0, tabsRef.current.findIndex((t) => t[0] === k)))));
  return (
    <section id="student" aria-labelledby="student-title" className="scroll-mt-28 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">{alum ? "بوابة الخريجين" : "بوابة الطالب"}</p>
          <h2 id="student-title" className="mt-1 text-2xl font-extrabold text-navy md:text-3xl">{alum ? "مسيرتك بعد التخرج في مكان واحد" : "رحلتك المهنية في مكان واحد"}</h2>
          <p className="mt-3 leading-8 text-ink-2">{alum ? "للخريجين فقط: وظائف معتمدة، وتوثيق جداراتك، وإرشاد من المركز لمدة خمس سنوات بعد التخرج." : "تتابع وجهتك من السنة الأولى حتى أول وظيفة، وما تفعله يصل المركز والشركات."}</p>
          <span className="mt-3 inline-block rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">بيانات تجريبية</span>
        </div>
        <div className="mt-8">
          {!s ? (
            reg ? (
              <Register onDone={() => { setTab(0); setCur(0); setReg(false); }} onBack={() => setReg(false)} />
            ) : (
              <Login mode={mode} onRegister={() => setReg(true)} onEnter={(id) => { if (!wantRef.current) setTab(0); wantRef.current = false; setCur(0); portalActions.studentLogin(id); }} />
            )
          ) : (
            <Frame
              v={{
                nav: tabs.map((t) => (t[0] === "offers" && notes ? `${t[1]} (${notes})` : t[1])),
                navActive: idx,
                title: tabs[idx][2],
                subtitle: alum && key === "j" ? "وضعك المهني بعد التخرج وما يقدمه المركز لك" : alum && key === "counsel" ? "جلسات المركز وإرشاد الطلاب" : tabs[idx][3],
                user: { initial: s.initial, name: s.name, role: s.year === 5 ? `خريج دفعة ${(s as any).gradYear} · كلية ${s.college}` : `${YEARS[s.year]} · كلية ${s.college}` },
              }}
              onNav={(i) => setTab(i)}
              brand={alum ? { name: "مركز المسار المهني", sub: "بوابة الخريجين" } : undefined}
              aside={
                <>
                {alum && <p className="mt-4 rounded-[10px] bg-white/25 px-3 py-2 text-center text-xs font-bold text-white">حساب خريج</p>}
                <button type="button" onClick={() => portalActions.studentLogin(null)} className="mt-6 w-full rounded-[10px] border border-white/30 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
                  تسجيل الخروج
                </button>
                </>
              }
            >
              {key === "j" && <StudentGuide s={s} />}
              {key === "j" && (s.year === 5 ? <AlumniJourney s={s} go={goKey} /> : <Journey s={s} cur={sem} go={goKey} />)}
              {key === "p" && <Profile s={s} />}
              {key === "sem" && <Semesters s={s} cur={sem} setCur={setCur} data={skills} />}
              {key === "jobs" && <Jobs s={s} />}
              {key === "ch" && <Challenges s={s} />}
              {key === "offers" && <Offers s={s} />}
              {key === "counsel" && <Counsel s={s} />}
              {key === "gc" && <GrantsCerts s={s} go={goKey} />}
              {key === "coach" && <Coach sid={s.id} jobTitles={st.jobs.filter((j) => j.status === "published").map((j) => j.title)} />}
            </Frame>
          )}
        </div>
      </div>
    </section>
  );
}


function AlumNetwork({ s }: { s: Stu }) {
  const st = usePortal();
  const list = useMemo(() => {
    const same = ALUM_MENTORS.filter((a) => a.track === s.track);
    return [...same, ...ALUM_MENTORS.filter((a) => a.track !== s.track)].slice(0, 6);
  }, [s.track]);
  return (
    <Card>
      <h4 className="text-base font-extrabold text-navy">مرشدون من الخريجين</h4>
      <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">خريجون متطوعون يشاركونك تجربتهم. اطلب لقاءً قصيرًا ويردّون عليه في بوابتهم. بيانات تجريبية.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((a) => {
          const r = st.alumReqs.find((x) => x.studentId === s.id && x.alumId === a.id && x.status !== "declined");
          const declined = st.alumReqs.find((x) => x.studentId === s.id && x.alumId === a.id && x.status === "declined");
          return (
            <li key={a.id} className="rounded-[10px] bg-[#f8f6f3] p-3">
              <p className="text-sm font-bold text-navy">{a.name}</p>
              <p className="text-xs text-ink-2">خريج دفعة {a.gradYear} · {a.track}</p>
              <p className="mt-1 text-xs text-ink">يرشد في: {a.topic}</p>
              <div className="mt-2">
                {r ? (
                  <Pill ok={r.status === "accepted" ? true : null}>{r.status === "accepted" ? "قبل اللقاء، سيتواصل معك المركز لتحديد الموعد" : "بانتظار رد الخريج"}</Pill>
                ) : (
                  <button type="button" className={btn} onClick={() => portalActions.requestAlum(s.id, a.id, a.topic)}>
                    {declined ? "اعتذر الخريج، جرّب غيره أو أعد الطلب" : "اطلب لقاء"}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function AlumRequests({ s }: { s: Stu }) {
  const st = usePortal();
  const me = ALUM_MENTORS.find((a) => a.id === s.id);
  if (!me)
    return (
      <Card>
        <h4 className="text-base font-extrabold text-navy">الإرشاد للطلاب</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">يمكنك التطوع لإرشاد طلاب الجامعة بلقاء قصير. اطلب من المركز تفعيل ذلك لحسابك.</p>
      </Card>
    );
  const mine = st.alumReqs.filter((r) => r.alumId === s.id);
  return (
    <Card>
      <h4 className="text-base font-extrabold text-navy">طلبات الطلاب لإرشادك</h4>
      <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">أنت متطوع في: {me.topic}. ردّك يصل للطالب فورًا.</p>
      {mine.length ? (
        <ul className="space-y-2" aria-live="polite">
          {mine.map((r) => {
            const stu = ANY_STUDENTS.find((x) => x.id === r.studentId);
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
                <span className="font-bold text-navy">{stu?.name} <span className="text-xs font-normal text-ink-2">· {r.topic}</span></span>
                {r.status === "pending" ? (
                  <span className="flex gap-2">
                    <button type="button" className={btn} onClick={() => portalActions.respondAlum(r.id, true)}>قبول</button>
                    <button type="button" className="rounded-[10px] border border-navy px-4 py-2 text-sm font-bold text-navy" onClick={() => portalActions.respondAlum(r.id, false)}>اعتذار</button>
                  </span>
                ) : (
                  <Pill ok={r.status === "accepted"}>{r.status === "accepted" ? "قبلت" : "اعتذرت"}</Pill>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-ink-2">لا توجد طلبات حتى الآن.</p>
      )}
    </Card>
  );
}


const ALUM_COLLEGE = "الحقوق";
const ALUM_TRACK = "القانون الخاص";
const DEST_FORM: Record<string, string> = { emp: "أعمل في وظيفة", mil: "الخدمة العسكرية", edu: "أدرس دراسة عليا", seekJob: "أبحث عن وظيفة", seekEdu: "أبحث عن دراسة", not: "لا أبحث حاليًا" };

/* ---------- تسجيل خريج جديد ---------- */
function Register({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [f, setF] = useState({ name: "", college: ALUM_COLLEGE, track: ALUM_TRACK, gradYear: 2026, dest: "seekJob", mentor: false });
  const tracks = [ALUM_TRACK];
  const track = f.track && tracks.includes(f.track) ? f.track : tracks[0] ?? "";
  const ok = f.name.trim().length > 2;
  void DEST_IDS;
  return (
    <div className="flex min-h-[460px] items-center justify-center rounded-[16px] border border-line/40 p-4 shadow-md" style={{ background: "#f4f2ef" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          portalActions.registerAlumnus({ ...f, track });
          onDone();
        }}
        className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-md"
      >
        <p className="text-center text-xs font-bold text-orange-text">بوابة الخريجين</p>
        <h3 className="mt-1 text-center text-xl font-extrabold text-navy">تسجيل خريج جديد</h3>
        <p className="mt-1 text-center text-xs leading-6 text-ink-2">بعد التسجيل يظهر ملفك للجامعة والمركز، ويدخل في نتائج دفعتك. نموذج تجريبي.</p>
        <label className="mt-4 block text-xs font-bold text-ink-2">
          الاسم الكامل
          <input className={`${field} mt-1`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </label>
        <p className="mt-3 rounded-[10px] bg-[#f4f2ef] px-3 py-2 text-xs leading-6 text-ink-2">الكلية: {ALUM_COLLEGE} · المسار: {ALUM_TRACK}. التسجيل لخريجي هذا البرنامج، وعليه تُبنى الشهادات المهنية.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-ink-2">
            سنة التخرج
            <select className={`${field} mt-1`} value={f.gradYear} onChange={(e) => setF({ ...f, gradYear: Number(e.target.value) })}>
              {[2026, 2025, 2024, 2023, 2022].map((y) => <option key={y}>{y}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            وضعي الآن
            <select className={`${field} mt-1`} value={f.dest} onChange={(e) => setF({ ...f, dest: e.target.value })}>
              {Object.entries(DEST_FORM).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs font-bold text-ink-2">
          <input type="checkbox" className="h-4 w-4 accent-[#3f7a24]" checked={f.mentor} onChange={(e) => setF({ ...f, mentor: e.target.checked })} />
          أرغب بالتطوع لإرشاد طلاب الجامعة
        </label>
        <button type="submit" disabled={!ok} className="mt-5 w-full rounded-[10px] bg-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-teal disabled:opacity-50">إنشاء الحساب والدخول</button>
        <button type="button" onClick={onBack} className="mt-2 w-full text-xs font-bold text-orange-text underline">لدي حساب، العودة للدخول</button>
      </form>
    </div>
  );
}


/* ---------- الشهادات المهنية ---------- */
function GrantsCerts({ s, go }: { s: Stu; go: (k: string) => void }) {
  const st = usePortal();
  const alum = s.year === 5;
  const certs = certsFor(s);
  const [openC, setOpenC] = useState<string | null>(null);
  const mine = Object.keys(st.certPlan).filter((k) => k.startsWith(`${s.id}:`)).length;
  const best = certs.filter((c) => (c as any).best);
  const rest = certs.filter((c) => !(c as any).best);
  const CertCard = ({ c }: { c: (typeof certs)[number] }) => {
    const v = st.certPlan[`${s.id}:${c.id}`];
    const isOpen = openC === c.id;
    const x = c as any;
    return (
      <li className="rounded-[10px] bg-[#f8f6f3] p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy">{c.name}</p>
            <p className="text-xs text-ink-2">{c.body} · {c.level} · {c.duration}</p>
          </div>
          {x.best && <span className="rounded-full bg-[#f7f0da] px-2 py-0.5 text-[10px] font-bold text-[#7a6420]">الأنسب لمسارك</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {c.comps.filter((k) => COMPS.some((y) => y.id === k)).map((k) => <span key={k} className="rounded-md bg-[#e3f0d9] px-1.5 py-0.5 text-[10px] font-semibold text-orange-text">{COMPS.find((y) => y.id === k)?.name}</span>)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {v ? (
            <>
              <select aria-label="حالة الشهادة" className="rounded-[8px] border border-[#d9d2ca] bg-white px-2 py-1 text-xs" value={v} onChange={(e) => portalActions.setCert(s.id, c.id, e.target.value)}>
                {Object.entries(CERT_ST).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <button type="button" className="text-xs font-bold text-orange-text underline" onClick={() => portalActions.setCert(s.id, c.id, null)}>إزالة</button>
            </>
          ) : s.year >= 4 ? (
            <button type="button" className={btn} onClick={() => portalActions.setCert(s.id, c.id, "planned")}>أضفها لخطتي</button>
          ) : (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-2 ring-1 ring-[#d9d2ca]">تبدأ في السنة الرابعة</span>
          )}
          <button type="button" aria-expanded={isOpen} className="text-xs font-bold text-orange-text hover:underline" onClick={() => setOpenC(isOpen ? null : c.id)}>{isOpen ? "إخفاء التفاصيل" : "عن الشهادة"}</button>
        </div>
        {isOpen && (
          <dl className="mt-3 space-y-2 border-t border-[#e4ded6] pt-3 text-xs leading-6">
            {([
              ["ما هي؟", x.what],
              ["لماذا تناسب مسارك؟", x.why],
              ["شكل الاختبار", x.format],
              ["المتطلبات", x.req],
              ["الصلاحية والتجديد", x.renew],
            ] as [string, string][]).map(([k, t]) => (
              <div key={k}><dt className="font-extrabold text-navy">{k}</dt><dd className="text-ink">{t}</dd></div>
            ))}
            <div><dt className="font-extrabold text-navy">وظائف تفتحها</dt><dd className="mt-1 flex flex-wrap gap-1">{(x.roles as string[]).map((r) => <span key={r} className="rounded-md bg-white px-2 py-0.5 text-[11px] text-navy ring-1 ring-line/30">{r}</span>)}</dd></div>
            <div><dt className="font-extrabold text-navy">مقررات خطتك المرتبطة بها</dt><dd className="mt-1 flex flex-wrap gap-1">{(x.courses as string[]).map((r) => <span key={r} className="rounded-md bg-white px-2 py-0.5 text-[11px] text-navy ring-1 ring-line/30">{r}</span>)}</dd></div>
          </dl>
        )}
      </li>
    );
  };
  return (
    <>

      {!alum && (
        <Card>
          <h4 className="text-base font-extrabold text-navy">كيف أحصل على شهادة مهنية؟</h4>
          <p className="mt-1 text-xs leading-6 text-ink-2">شهادات مختارة لمسار {certsData.track}، تبدأ في السنة الرابعة (الفصلان 7 و8).</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-5">
            {CERT_STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-[10px] bg-[#f8f6f3] p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue text-xs font-bold text-white">{i + 1}</span>
                <p className="mt-2 text-sm font-bold text-navy">{t}</p>
                <p className="mt-1 text-xs leading-6 text-ink-2">{d}</p>
              </li>
            ))}
          </ol>
          <button type="button" className={`${btn} mt-3`} onClick={() => go("counsel")}>احجز جلسة مع مرشد</button>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-extrabold text-navy">الشهادات المهنية لمسار {certsData.track}</h4>
          <span className="text-xs font-bold text-ink-2">في خطتي: {mine}</span>
        </div>
        <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">{CERTS_NOTE}</p>
        {certs.length ? (
          <>
            <ul className="grid gap-2 sm:grid-cols-2">{best.map((c) => <CertCard key={c.id} c={c} />)}</ul>
            {rest.length > 0 && <p className="mb-2 mt-4 text-xs font-extrabold text-navy">خيارات أخرى</p>}
            <ul className="grid gap-2 sm:grid-cols-2">{rest.map((c) => <CertCard key={c.id} c={c} />)}</ul>
          </>
        ) : (
          <p className="text-sm leading-7 text-ink-2">تظهر الشهادات في السنة الرابعة. الآن ركّز على مسارك وسيرتك والمقابلات، ثم تختار شهادتك مع مرشدك.</p>
        )}
      </Card>
    </>
  );
}


/* ---------- تقدمي وشاراتي ---------- */
const LEVELS: [number, string][] = [[0, "مستكشف"], [3, "متدرب"], [6, "جاهز"], [9, "محترف"]];

function ProgressBadges({ s, pct, go }: { s: Stu; pct: number; go: (k: string) => void }) {
  const st = usePortal();
  const svc = (s as any).svc as { nova: boolean; cv: boolean; sessions: number };
  const item = st.shortlist.find((x) => x.studentId === s.id);
  const alum = s.year === 5;
  const badges: { id: string; name: string; hint: string; ok: boolean; tab: string; show: boolean }[] = [
    { id: "nova", name: "عرفت نفسي", hint: "أكمل تقييم Nova مع جلسة تفسير", ok: !!svc?.nova, tab: "counsel", show: true },
    { id: "cv", name: "سيرة جاهزة", hint: "راجع سيرتك بالمدرب الذكي", ok: !!svc?.cv || !!st.cvChecks[s.id], tab: "coach", show: true },
    { id: "iv", name: "مستعد للمقابلة", hint: "أجب عن 3 أسئلة تدريبية على الأقل", ok: (st.practice[s.id]?.n ?? 0) >= 3, tab: "coach", show: true },
    { id: "ses", name: "أول جلسة إرشاد", hint: "احجز جلسة مع مرشدك", ok: (svc?.sessions ?? 0) > 0 || st.bookings.some((b) => b.studentId === s.id && b.status !== "cancelled"), tab: "counsel", show: true },
    { id: "vid", name: "جلسة بالفيديو", hint: "اختر مكالمة فيديو عند الحجز", ok: st.bookings.some((b) => b.studentId === s.id && b.mode === "video" && b.status !== "cancelled"), tab: "counsel", show: true },
    { id: "goal", name: "وجهتي محددة", hint: "اختر أدوارك وقطاعاتك المستهدفة", ok: !!(st.goals[s.id]?.roles.length && st.goals[s.id]?.sectors.length), tab: "j", show: true },
    { id: "ev", name: "حاضر فعالية", hint: "سجّل في فعالية من «الإرشاد»", ok: st.events.some((e) => e.registered.includes(s.id)), tab: "counsel", show: true },
    { id: "cert", name: "خطة شهادات", hint: "أضف شهادة مهنية لخطتك", ok: Object.keys(st.certPlan).some((k) => k.startsWith(`${s.id}:`)), tab: "gc", show: true },
    { id: "app", name: "المتقدّم", hint: "تقدّم لفرصة", ok: st.applications.some((a) => a.studentId === s.id), tab: "jobs", show: s.year >= 4 },
    { id: "ch", name: "حلّال التحديات", hint: "سلّم حلًّا لتحدي أعمال", ok: st.challenges.some((c) => c.subs.some((x) => x.studentId === s.id)), tab: "ch", show: s.year === 4 },
    { id: "ver", name: "موثّق", hint: "اجتز لجنة التحقق", ok: (s as any).verified === true, tab: "p", show: s.year >= 4 },
    { id: "job", name: alum ? "أول وظيفة" : "قُبلت", hint: alum ? "وظّفتك شركة عبر المركز" : "اقبل عرض تدريب أو وظيفة", ok: !!item && ["hired", "accepted", "completed"].includes(item.stage), tab: "offers", show: s.year >= 4 },
  ];
  const list = badges.filter((b) => b.show);
  const got = list.filter((b) => b.ok);
  const level = [...LEVELS].reverse().find(([n]) => got.length >= n)![1];
  const nextB = list.find((b) => !b.ok);
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-extrabold text-navy">تقدّمي وشاراتي</h4>
          <p className="mt-1 text-xs text-ink-2">مستواك الآن: <span className="font-bold text-orange-text">{level}</span> · {got.length} من {list.length} شارة</p>
        </div>
        <div className="min-w-[11rem] flex-1 sm:max-w-xs">
          <div className="flex justify-between text-[11px] font-bold text-ink-2"><span>مهام الرحلة</span><span dir="ltr">{pct}%</span></div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#eee9e3]"><div className="h-full rounded-full bg-teal transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 flex justify-between text-[11px] font-bold text-ink-2"><span>الشارات</span><span dir="ltr">{Math.round((100 * got.length) / list.length)}%</span></div>
          <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#eee9e3]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(100 * got.length) / list.length}%`, background: "#cdb774" }} /></div>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((b) => (
          <li key={b.id} title={b.ok ? "تم الحصول عليها" : b.hint} className={`flex flex-col items-center rounded-[12px] border p-2.5 text-center ${b.ok ? "border-[#cdb774]/60 bg-[#f4f9ef]" : "border-[#e6e0d9] bg-[#f8f6f3]"}`}>
            <span aria-hidden="true" className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${b.ok ? "bg-[#cdb774] text-white" : "bg-[#e5e0da] text-[#a49d95]"}`}>{b.ok ? "★" : "☆"}</span>
            <span className={`mt-1.5 text-[11px] font-extrabold leading-4 ${b.ok ? "text-navy" : "text-ink-2"}`}>{b.name}</span>
            <span className="sr-only">{b.ok ? "مكتسبة" : "غير مكتسبة"}</span>
          </li>
        ))}
      </ul>
      {nextB && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-2">
          الشارة التالية: <b className="text-navy">{nextB.name}</b> ({nextB.hint})
          <button type="button" className="font-bold text-orange-text underline" onClick={() => go(nextB.tab)}>اذهب إليها</button>
        </p>
      )}
    </Card>
  );
}


/* ---------- جدولي والإشعارات ---------- */
const KIND_COLOR: Record<string, string> = { جلسة: "#3f7a24", فعالية: "#3f7a24", وظيفة: "#3f7a24", منحة: "#b79c55", شهادة: "#7b003a" };

function AgendaNotes({ s, go }: { s: Stu; go: (k: string) => void }) {
  const st = usePortal();
  const items = agendaFor(st, s.id);
  const notes = useNotes(s).slice(0, 4);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h4 className="mb-1 text-base font-extrabold text-navy">جدولي القادم</h4>
        <p className="mb-3 text-xs leading-6 text-ink-2">جلساتك وفعالياتك ومواعيد التقديم في مكان واحد.</p>
        {items.length ? (
          <ul className="space-y-2">
            {items.slice(0, 6).map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-[10px] bg-[#f8f6f3] p-2.5">
                <span className="mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: KIND_COLOR[a.kind] }}>{a.kind}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-navy">{a.title}</span>
                  <span className="block text-xs text-ink-2">{a.when}{a.note ? ` · ${a.note}` : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-7 text-ink-2">لا مواعيد قادمة. احجز جلسة أو سجّل في فعالية لتظهر هنا.</p>
        )}
        <button type="button" className="mt-3 text-xs font-bold text-orange-text underline" onClick={() => go("counsel")}>احجز جلسة أو سجّل في فعالية</button>
      </Card>
      <Card>
        <h4 className="mb-1 text-base font-extrabold text-navy">آخر الإشعارات</h4>
        <p className="mb-3 text-xs leading-6 text-ink-2">كل ما يصلك من الشركات والمركز والخريجين.</p>
        {notes.length ? (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="rounded-[10px] bg-[#f8f6f3] p-2.5">
                <p className="text-sm font-bold text-navy"><span aria-hidden="true" className="me-2 inline-block h-2 w-2 rounded-full" style={{ background: n.tone === "act" ? "#d98b00" : n.tone === "ok" ? "#3f7a24" : "#8a949f" }} />{n.title}</p>
                <p className="text-xs leading-6 text-ink-2">{n.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-7 text-ink-2">لا إشعارات جديدة. ستظهر هنا عند أي تحديث يخصك.</p>
        )}
        <button type="button" className="mt-3 text-xs font-bold text-orange-text underline" onClick={() => go("offers")}>كل الإشعارات</button>
      </Card>
    </div>
  );
}
