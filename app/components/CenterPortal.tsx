"use client";

import { joinSession, useTabIntent } from "@/lib/route";
import LoginFrame from "./LoginFrame";
import { useMemo, useState, type ReactNode } from "react";
import { Frame } from "./Platform";
import Guide from "./Guide";
import {
  ANY_STUDENTS,
  ALUM_MENTORS,
  MODE_LABEL,
  CERTS,
  CERT_ST,
  videoLink,
  alumniStats,
  COMPS,
  GRANTS,
  GRANTS_NOTE,
  MENTORS,
  mentorOf,
  portalActions,
  readiness,
  studentYear,
  usePortal,
  type AlumData,
  type Booking,
} from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Stu = (typeof ANY_STUDENTS)[number];
const PASS = "demo123";
const YEARS = ["", "السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "خريج سابق"];
const NAV = ["لوحة اليوم", "الجلسات", "طلابي", "الفعاليات", "الفريق"];
const SLOTS = ["غدًا 10:00", "الأحد 10:00", "الاثنين 11:00", "الثلاثاء 09:30", "الأربعاء 12:00", "الخميس 10:30"];
const field = "w-full rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";
const btn = "rounded-[10px] bg-teal px-4 py-2 text-sm font-bold text-white hover:bg-blue-bright disabled:opacity-50";
const btn2 = "rounded-[10px] border border-navy px-4 py-2 text-sm font-bold text-navy hover:bg-[#f0ece7]";
const sc = (s: Stu, c: string) => (s.scores as Record<string, number>)[c] ?? 0;
const byId = (id: string) => ANY_STUDENTS.find((s) => s.id === id)!;
const isToday = (b: Booking) => b.slot.startsWith("اليوم");
const GRANT_ST: [string, string][] = [["", "لم يُحدَّد"], ["interested", "مهتم"], ["applied", "قدّم"], ["accepted", "قُبل"], ["rejected", "لم يُقبل"]];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}
function Pill({ tone, children }: { tone: "ok" | "wait" | "idle"; children: ReactNode }) {
  const c = tone === "ok" ? ["#e3f0d9", "#3a6e22"] : tone === "wait" ? ["#f7f0da", "#7a6420"] : ["#eee9e3", "#4a5560"];
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
function Kpi({ n, l, onClick }: { n: number | string; l: string; onClick?: () => void }) {
  const inner = (
    <>
      <p className="text-3xl font-extrabold text-orange-text" dir="ltr">{n}</p>
      <p className="mt-1 text-xs text-ink-2">{l}</p>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="min-w-0 rounded-[14px] bg-white p-4 text-start shadow-sm hover:shadow-md">{inner}</button>
  ) : (
    <Card>{inner}</Card>
  );
}
const statusPill = (b: Booking) =>
  b.status === "requested" ? <Pill tone="wait">بانتظار التأكيد</Pill> : b.status === "confirmed" ? <Pill tone="ok">مؤكدة</Pill> : b.status === "done" ? <Pill tone="idle">انتهت</Pill> : <Pill tone="idle">مرفوضة</Pill>;

/* ---------- الدخول ---------- */
function Login({ onEnter }: { onEnter: (id: string) => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  return (
    <LoginFrame img="hero-1" pos="center 35%" caption={"مكتب المرشد: الجلسات والطلاب"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const m = MENTORS.find((x) => x.user === u.trim().toLowerCase());
          if (!m || p !== PASS) return setErr("اسم المستخدم أو كلمة المرور غير صحيحة.");
          setErr("");
          onEnter(m.id);
        }}
        className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-md"
      >
        <p className="text-center text-xs font-bold text-orange-text">بوابة المركز</p>
        <h3 className="mt-1 text-center text-xl font-extrabold text-navy">تسجيل الدخول</h3>
        <label className="mt-4 block text-xs font-bold text-ink-2">
          اسم المستخدم
          <input dir="ltr" autoComplete="username" className={`${field} mt-1`} value={u} onChange={(e) => setU(e.target.value)} />
        </label>
        <label className="mt-3 block text-xs font-bold text-ink-2">
          كلمة المرور
          <input dir="ltr" type="password" autoComplete="current-password" className={`${field} mt-1`} value={p} onChange={(e) => setP(e.target.value)} />
        </label>
        {err && <p role="alert" className="mt-3 rounded-[10px] bg-[#f7f0da] p-2.5 text-xs font-bold text-[#7a6420]">{err}</p>}
        <button type="submit" className="mt-5 w-full rounded-[10px] bg-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-teal">دخول</button>
        <div className="mt-5 border-t border-[#eee9e3] pt-3">
          <p className="text-[11px] font-bold text-ink-2">حسابات تجريبية (كلمة المرور: {PASS})</p>
          <ul className="mt-2 space-y-1.5">
            {MENTORS.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => { setU(m.user); setP(PASS); setErr(""); }} className="flex w-full items-center justify-between gap-2 rounded-[8px] bg-[#f8f6f3] px-3 py-1.5 text-start text-xs hover:bg-[#eee9e3]">
                  <span className="font-bold text-navy">{m.name}</span>
                  <span className="text-ink-2" dir="ltr">{m.user}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </LoginFrame>
  );
}

/* ---------- لوحة اليوم ---------- */
function Today({ mid, go }: { mid: string; go: (tab: number, who?: string) => void }) {
  const st = usePortal();
  const mine = ANY_STUDENTS.filter((s) => mentorOf(s.id).id === mid);
  const bks = st.bookings.filter((b) => mentorOf(b.studentId).id === mid);
  const req = bks.filter((b) => b.status === "requested");
  const today = bks.filter((b) => b.status === "confirmed" && isToday(b));
  const lag = mine.filter((s) => s.year >= 2 && readiness(s) < 2.5 && !st.contacted[s.id]).sort((a, b) => readiness(a) - readiness(b));
  const interest = mine.filter((s) => Object.keys(st.certPlan).some((k) => k.startsWith(`${s.id}:`))).length;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi n={today.length} l="جلسات اليوم" onClick={() => go(1)} />
        <Kpi n={req.length} l="طلبات حجز جديدة" onClick={() => go(1)} />
        <Kpi n={lag.length} l="متعثرون لم يُتواصل معهم" />
        <Kpi n={interest} l="طلاب لديهم خطة شهادات" onClick={() => go(2)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h4 className="mb-3 text-base font-extrabold text-navy">طلبات الحجز الجديدة</h4>
          {req.length ? (
            <ul className="space-y-2">
              {req.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[#f8f6f3] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy">{byId(b.studentId).name}</p>
                    <p className="text-xs text-ink-2">{b.topic} · {b.slot} · {MODE_LABEL[b.mode ?? "inperson"]}</p>
                  </div>
                  <button type="button" className={btn} onClick={() => portalActions.setBooking(b.id, { status: "confirmed" })}>تأكيد</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-2">لا طلبات جديدة. تصل هنا ما إن يحجز طالب من بوابته.</p>
          )}
        </Card>
        <Card>
          <h4 className="mb-3 text-base font-extrabold text-navy">شبكة الخريجين المرشدين</h4>
          <p className="text-sm leading-7 text-ink">
            {ALUM_MENTORS.length} خريجًا متطوعًا. طلبات اللقاء: {st.alumReqs.length} (بانتظار الرد {st.alumReqs.filter((r) => r.status === "pending").length}، مقبولة {st.alumReqs.filter((r) => r.status === "accepted").length}).
          </p>
          <p className="mt-1 text-sm leading-7 text-ink">خريجون لم يحدّثوا وضعهم المهني: {alumniStats(st).toFollow.length}.</p>
          <ul className="mt-2 space-y-1.5">
            {alumniStats(st).toFollow.slice(0, 4).map((id) => (
              <li key={id} className="flex items-center justify-between gap-2 rounded-[10px] bg-[#f8f6f3] px-3 py-2 text-xs">
                <span className="font-bold text-navy">{byId(id).name}</span>
                <button type="button" className={btn} onClick={() => portalActions.contactStudent(id)}>تواصل</button>
              </li>
            ))}
          </ul>
          {st.alumReqs.some((r) => r.status === "accepted") && (
            <ul className="mt-2 space-y-1 text-xs text-ink-2">
              {st.alumReqs.filter((r) => r.status === "accepted").map((r) => (
                <li key={r.id}>حدد موعد لقاء {byId(r.studentId).name} مع {ALUM_MENTORS.find((a) => a.id === r.alumId)?.name}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h4 className="mb-3 text-base font-extrabold text-navy">جلسات اليوم</h4>
          {today.length ? (
            <ul className="space-y-2">
              {today.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[#f8f6f3] p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-navy">{byId(b.studentId).name}</p>
                    <p className="text-xs text-ink-2">{b.topic} · {b.slot} · {MODE_LABEL[b.mode ?? "inperson"]}</p>
                    {b.mode === "video" && <p dir="ltr" className="text-xs font-bold text-orange-text">{videoLink(b.id)}</p>}
                  </div>
                  {b.mode === "video" && <button type="button" className={btn2} onClick={() => joinSession(b.id, "mentor")}>ابدأ الجلسة</button>}
                  <button type="button" className={btn2} onClick={() => go(1)}>تسجيل الملاحظات</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-2">لا جلسات مؤكدة اليوم.</p>
          )}
        </Card>
      </div>
      <Card>
        <h4 className="text-base font-extrabold text-navy">طلاب يحتاجون تواصلًا</h4>
        <p className="mb-3 mt-1 text-xs leading-6 text-ink-2">طلابك الذين متوسط جداراتهم أقل من 2.5 ولم تتواصل معهم. يخرجون من القائمة بعد التواصل.</p>
        {lag.length ? (
          <ul className="space-y-2">
            {lag.slice(0, 8).map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[#f8f6f3] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue font-extrabold text-white">{s.initial}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy">{s.name}</p>
                  <p className="text-xs text-ink-2">{YEARS[s.year]} · {s.college} · الجاهزية {readiness(s).toFixed(1)}</p>
                </div>
                <button type="button" className={btn2} onClick={() => go(2, s.id)}>الملف</button>
                <button type="button" className={btn} onClick={() => portalActions.contactStudent(s.id)}>تم التواصل</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-bold text-[#3a6e22]">لا متعثرين بانتظار التواصل.</p>
        )}
      </Card>
    </>
  );
}

/* ---------- الجلسات ---------- */
function SessionRow({ b }: { b: Booking }) {
  const s = byId(b.studentId);
  const [note, setNote] = useState(b.note);
  const [slot, setSlot] = useState(SLOTS[0]);
  return (
    <li className="rounded-[12px] border border-[#e6e0d9] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold text-navy">{s.name} <span className="text-xs font-normal text-ink-2">· {YEARS[s.year]}</span></p>
          <p className="text-xs text-ink-2">{b.topic} · {b.slot} · {MODE_LABEL[b.mode ?? "inperson"]}</p>
        </div>
        {statusPill(b)}
      </div>
      {b.status === "requested" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <button type="button" className={btn} onClick={() => portalActions.setBooking(b.id, { status: "confirmed" })}>تأكيد الموعد</button>
          <label className="text-xs font-bold text-ink-2">
            أو موعد بديل
            <select className={`${field} mt-1`} value={slot} onChange={(e) => setSlot(e.target.value)}>
              {SLOTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <button type="button" className={btn2} onClick={() => portalActions.setBooking(b.id, { status: "confirmed", slot })}>اقتراح البديل</button>
          <button type="button" className="text-xs font-bold text-[#7a6420] hover:underline" onClick={() => portalActions.setBooking(b.id, { status: "cancelled" })}>رفض</button>
        </div>
      )}
      {b.status === "confirmed" && (
        <div className="mt-3">
          <label className="block text-xs font-bold text-ink-2">
            ملاحظات الجلسة (تظهر في ملف الطالب)
            <textarea rows={2} className={`${field} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button type="button" disabled={note.trim().length < 5} className={`${btn} mt-2`} onClick={() => portalActions.setBooking(b.id, { status: "done", note: note.trim() })}>
            إنهاء الجلسة
          </button>
        </div>
      )}
      {b.status === "done" && b.note && <p className="mt-3 rounded-[10px] bg-[#f8f6f3] p-3 text-xs leading-6 text-ink">{b.note}</p>}
    </li>
  );
}
function Sessions({ mid }: { mid: string }) {
  const st = usePortal();
  const [f, setF] = useState("all");
  const all = st.bookings.filter((b) => mentorOf(b.studentId).id === mid);
  const list = all.filter((b) => f === "all" || b.status === f);
  const tabs: [string, string][] = [["all", "الكل"], ["requested", "طلبات"], ["confirmed", "مؤكدة"], ["done", "منتهية"]];
  return (
    <Card>
      <div role="tablist" aria-label="حالة الجلسات" className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" type="button" aria-selected={f === k} onClick={() => setF(k)} className={`rounded-full border px-4 py-1.5 text-sm font-bold ${f === k ? "border-navy bg-blue text-white" : "border-[#d9d2ca] bg-white text-navy hover:border-navy"}`}>
            {l} ({k === "all" ? all.length : all.filter((b) => b.status === k).length})
          </button>
        ))}
      </div>
      {list.length ? <ul className="space-y-3">{list.map((b) => <SessionRow key={`${b.id}-${b.status}`} b={b} />)}</ul> : <p className="text-sm text-ink-2">لا جلسات في هذه الحالة.</p>}
    </Card>
  );
}

/* ---------- طلابي ---------- */
function Students({ mid, focus }: { mid: string; focus: string | null }) {
  const st = usePortal();
  const [q, setQ] = useState("");
  const [year, setYear] = useState("all");
  const [sel, setSel] = useState<string | null>(focus);
  const [limit, setLimit] = useState(15);
  const mine = useMemo(() => ANY_STUDENTS.filter((s) => mentorOf(s.id).id === mid), [mid]);
  const list = mine.filter((s) => (year === "all" || s.year === Number(year)) && (!q || s.name.includes(q.trim())));
  const s = sel ? byId(sel) : null;
  if (s) {
    const svc = (s as any).svc as { nova: boolean; cv: boolean; sessions: number; roles: number };
    const goal = st.goals[s.id];
    const bks = st.bookings.filter((b) => b.studentId === s.id);
    return (
      <>
        <button type="button" onClick={() => setSel(null)} className="text-sm font-bold text-orange-text hover:underline">← كل طلابي</button>
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue text-xl font-extrabold text-white">{s.initial}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-extrabold text-navy">{s.name}</p>
              <p className="text-xs text-ink-2">{YEARS[s.year]} · كلية {s.college} · المسار: {s.track}</p>
              <p className="mt-1 text-xs text-ink-2">وجهته المهنية: {goal ? `${goal.roles.join("، ")} في ${goal.sectors.join("، ")}` : "لم يحددها بعد"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-orange-text" dir="ltr">{readiness(s).toFixed(1)}</p>
              <p className="text-[11px] text-ink-2">الجاهزية</p>
            </div>
            {!st.contacted[s.id] && readiness(s) < 2.5 && <button type="button" className={btn} onClick={() => portalActions.contactStudent(s.id)}>تم التواصل</button>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill tone={svc.nova ? "ok" : "wait"}>{svc.nova ? "أنهى Nova" : "لم ينه Nova"}</Pill>
            <Pill tone={svc.cv ? "ok" : "wait"}>{svc.cv ? "سيرته روجعت" : "سيرته لم تُراجع"}</Pill>
            <Pill tone="idle">{svc.sessions + bks.filter((b) => b.status === "done").length} جلسة</Pill>
            <Pill tone="idle">{svc.roles} أدوار مستكشفة</Pill>
            {st.practice[s.id] && <Pill tone="ok">تدريب مقابلات: {st.practice[s.id].n} أسئلة، المتوسط {(st.practice[s.id].total / st.practice[s.id].n).toFixed(1)}/5</Pill>}
            {st.cvChecks[s.id] && <Pill tone="ok">مراجعة السيرة بالمساعد: {st.cvChecks[s.id].score}/100</Pill>}
            {CERTS.filter((c) => st.certPlan[`${s.id}:${c.id}`]).map((c) => <Pill key={c.id} tone={st.certPlan[`${s.id}:${c.id}`] === "earned" ? "ok" : "idle"}>{c.name}: {CERT_ST[st.certPlan[`${s.id}:${c.id}`]]}</Pill>)}
            {bks.some((b) => b.mode === "video" && b.status !== "cancelled") && <Pill tone="idle">استخدم الفيديو في الإرشاد</Pill>}
          </div>
        </Card>
        {s.year === 5 && (
          <Card>
            <h4 className="mb-1 text-base font-extrabold text-navy">بيانات الخريج</h4>
            {st.alumData[s.id] ? (
              <>
                <p className="mb-3 text-xs text-ink-2">يحدّثها الخريج بنفسه من بوابته. آخر تحديث: {st.alumData[s.id].updated}</p>
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {([["البريد الإلكتروني", "email"], ["الجوال", "phone"], ["المدينة", "city"], ["جهة العمل", "employer"], ["المسمى الوظيفي", "title"], ["جهة الدراسة", "institution"], ["البرنامج", "program"], ["الدرجة", "degree"]] as [string, keyof AlumData][]).filter(([, k]) => st.alumData[s.id][k]).map(([l, k]) => (
                    <div key={k}><dt className="text-xs text-ink-2">{l}</dt><dd dir={k === "email" || k === "phone" ? "ltr" : undefined} className="font-bold text-navy">{st.alumData[s.id][k]}</dd></div>
                  ))}
                </dl>
              </>
            ) : <p className="text-sm text-ink-2">لم يحدّث الخريج بياناته بعد. استخدم «تواصل» لطلب التحديث.</p>}
          </Card>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h4 className="mb-3 text-base font-extrabold text-navy">جداراته</h4>
            <ul className="space-y-2">
              {COMPS.map((c) => (
                <li key={c.id} className="text-xs">
                  <div className="flex justify-between"><span className="font-bold text-navy">{c.name}</span><span dir="ltr" className="text-ink-2">{sc(s, c.id)}/5</span></div>
                  <Bar v={(100 * sc(s, c.id)) / 5} color={sc(s, c.id) < 3 ? "#cdb774" : "#3f7a24"} />
                </li>
              ))}
            </ul>
          </Card>
          <div className="space-y-4">
            <Card>
              <h4 className="mb-3 text-base font-extrabold text-navy">سجل الجلسات</h4>
              {bks.length ? (
                <ul className="space-y-2">
                  {bks.map((b) => (
                    <li key={b.id} className="rounded-[10px] bg-[#f8f6f3] p-3 text-sm">
                      <div className="flex items-center justify-between gap-2"><span className="font-bold text-navy">{b.topic}</span>{statusPill(b)}</div>
                      <p className="text-xs text-ink-2">{b.slot} · {MODE_LABEL[b.mode ?? "inperson"]}</p>
                      {b.note && <p className="mt-1 text-xs leading-6 text-ink">{b.note}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-ink-2">لا جلسات مسجلة بعد.</p>}
            </Card>
          </div>
        </div>
      </>
    );
  }
  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-2">
        <input aria-label="بحث بالاسم" placeholder="ابحث بالاسم" className={`${field} max-w-xs`} value={q} onChange={(e) => { setQ(e.target.value); setLimit(15); }} />
        <select aria-label="السنة" className={`${field} max-w-[10rem]`} value={year} onChange={(e) => { setYear(e.target.value); setLimit(15); }}>
          <option value="all">كل السنوات</option>
          {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{YEARS[y]}</option>)}
        </select>
        <span className="self-center text-xs text-ink-2">{list.length} طالب</span>
      </div>
      <ul className="divide-y divide-[#eee9e3]">
        {list.slice(0, limit).map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => setSel(x.id)} className="flex w-full items-center gap-3 py-2.5 text-start hover:bg-[#f8f6f3]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-sm font-extrabold text-white">{x.initial}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-navy">{x.name}</span>
                <span className="block text-xs text-ink-2">{YEARS[x.year]} · {x.college}</span>
              </span>
              <span className="text-xs font-bold text-ink-2" dir="ltr">{readiness(x).toFixed(1)}</span>
            </button>
          </li>
        ))}
      </ul>
      {limit < list.length && <button type="button" className={`${btn2} mt-3`} onClick={() => setLimit(limit + 15)}>عرض المزيد</button>}
    </Card>
  );
}

/* ---------- الفعاليات ---------- */
function Events() {
  const st = usePortal();
  const [f, setF] = useState({ type: "ورشة", title: "", date: "", place: "", seats: "30", text: "" });
  const [open, setOpen] = useState<string | null>(null);
  const ok = f.title.trim().length > 3 && f.date.trim() && f.place.trim() && Number(f.seats) > 0;
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">فعالية جديدة</h4>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-bold text-ink-2">النوع
            <select className={`${field} mt-1`} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["ورشة", "معرض", "لقاء", "زيارة شركة", "ساعات مفتوحة"].map((x) => <option key={x}>{x}</option>)}</select>
          </label>
          <label className="text-xs font-bold text-ink-2 sm:col-span-1 lg:col-span-2">العنوان<input className={`${field} mt-1`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
          <label className="text-xs font-bold text-ink-2">الموعد<input className={`${field} mt-1`} placeholder="الأحد 5 جمادى الأولى" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></label>
          <label className="text-xs font-bold text-ink-2">المكان<input className={`${field} mt-1`} value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} /></label>
          <label className="text-xs font-bold text-ink-2">المقاعد<input type="number" min={1} dir="ltr" className={`${field} mt-1`} value={f.seats} onChange={(e) => setF({ ...f, seats: e.target.value })} /></label>
          <label className="text-xs font-bold text-ink-2 sm:col-span-2 lg:col-span-3">الوصف<textarea rows={2} className={`${field} mt-1`} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></label>
        </div>
        <button type="button" disabled={!ok} className={`${btn} mt-3`} onClick={() => { portalActions.addEvent({ type: f.type, title: f.title.trim(), date: f.date.trim(), place: f.place.trim(), text: f.text.trim(), seats: Number(f.seats) }); setF({ ...f, title: "", date: "", place: "", text: "" }); }}>
          نشر الفعالية
        </button>
        <p className="mt-2 text-xs text-ink-2">تظهر فور نشرها في الصفحة الرئيسية وبوابة الطالب.</p>
      </Card>
      <ul className="space-y-3">
        {st.events.map((e) => {
          const isOpen = open === e.id;
          return (
            <li key={e.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Pill tone="ok">{e.type}</Pill>
                    <p className="mt-1 text-base font-extrabold text-navy">{e.title}</p>
                    <p className="text-xs text-ink-2">{e.date} · {e.place}</p>
                  </div>
                  <div className="flex items-center gap-4 text-center">
                    <div><p className="text-xl font-extrabold text-orange-text" dir="ltr">{e.registered.length}/{e.seats}</p><p className="text-[11px] text-ink-2">مسجلون</p></div>
                    <div><p className="text-xl font-extrabold text-navy" dir="ltr">{e.attended.length}</p><p className="text-[11px] text-ink-2">حضروا</p></div>
                    <button type="button" aria-expanded={isOpen} className={btn2} onClick={() => setOpen(isOpen ? null : e.id)}>{isOpen ? "إخفاء" : "التسجيل والحضور"}</button>
                  </div>
                </div>
                {isOpen && (
                  <ul className="mt-4 divide-y divide-[#eee9e3]">
                    {e.registered.length ? e.registered.map((id) => (
                      <li key={id}>
                        <label className="flex cursor-pointer items-center gap-3 py-2.5 text-sm">
                          <input type="checkbox" className="h-4 w-4 accent-[#3f7a24]" checked={e.attended.includes(id)} onChange={() => portalActions.toggleAttend(e.id, id)} />
                          <span className="font-bold text-navy">{byId(id).name}</span>
                          <span className="text-xs text-ink-2">{YEARS[studentYear(id)]}</span>
                        </label>
                      </li>
                    )) : <li className="py-2 text-sm text-ink-2">لا مسجلين بعد. يسجل الطلاب من بوابتهم.</li>}
                  </ul>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------- الفريق ---------- */
function Team() {
  const st = usePortal();
  return (
    <Card>
      <h4 className="mb-3 text-base font-extrabold text-navy">فريق الإرشاد</h4>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="text-xs text-ink-2">
              {["المرشد", "الطلاب", "طلبات جديدة", "مؤكدة", "منتهية", "متعثرون بلا تواصل"].map((h, i) => <th key={h} className={`pb-2 font-semibold ${i ? "text-center" : "text-start"}`}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {MENTORS.map((m) => {
              const mine = ANY_STUDENTS.filter((s) => mentorOf(s.id).id === m.id);
              const b = st.bookings.filter((x) => mentorOf(x.studentId).id === m.id);
              return (
                <tr key={m.id} className="border-t border-[#eee9e3]">
                  <td className="py-2.5"><p className="font-bold text-navy">{m.name}</p><p className="text-xs text-ink-2">{m.role}</p></td>
                  <td className="py-2.5 text-center">{mine.length}</td>
                  <td className="py-2.5 text-center">{b.filter((x) => x.status === "requested").length}</td>
                  <td className="py-2.5 text-center">{b.filter((x) => x.status === "confirmed").length}</td>
                  <td className="py-2.5 text-center">{b.filter((x) => x.status === "done").length}</td>
                  <td className="py-2.5 text-center">{mine.filter((s) => s.year >= 2 && readiness(s) < 2.5 && !st.contacted[s.id]).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-6 text-ink-2">يُوزَّع الطلاب على المرشدين بالتناوب، ولا يرى كل مرشد إلا طلابه. بيانات تجريبية.</p>
    </Card>
  );
}

/* ---------- البوابة ---------- */
export default function CenterPortal() {
  const st = usePortal();
  const mid = st.session.center;
  const m = MENTORS.find((x) => x.id === mid);
  const [tab, setTab] = useState(0);
  useTabIntent((k) => setTab(Number(k)));
  const [focus, setFocus] = useState<string | null>(null);
  const req = mid ? st.bookings.filter((b) => b.status === "requested" && mentorOf(b.studentId).id === mid).length : 0;
  const titles = [
    ["لوحة اليوم", "ما ينتظرك اليوم: الطلبات والجلسات والطلاب الذين يحتاجون تواصلًا"],
    ["الجلسات", "أكّد الحجوزات وسجّل ملاحظات كل جلسة"],
    ["طلابي", "كل طالب برحلته وجلساته وشهاداته"],
    ["الفعاليات", "انشر الفعاليات وتابع التسجيل والحضور"],
    ["الفريق", "المرشدون وتوزيع الطلاب والجلسات"],
  ];
  return (
    <section id="center" aria-labelledby="center-title" className="scroll-mt-28 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">بوابة المركز</p>
          <h2 id="center-title" className="mt-1 text-2xl font-extrabold text-navy md:text-3xl">مكتب المرشد: الجلسات والطلاب والفعاليات</h2>
          <p className="mt-3 leading-8 text-ink-2">التشغيل اليومي للمركز. كل ما يحجزه الطالب يصل هنا، وكل ما تؤكده يصله فورًا.</p>
          <span className="mt-3 inline-block rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">بيانات تجريبية</span>
        </div>
        <div className="mt-8">
          {!m ? (
            <Login onEnter={(id) => { setTab(0); portalActions.centerLogin(id); }} />
          ) : (
            <Frame
              v={{
                nav: NAV.map((n, i) => (i === 1 && req ? `${n} (${req})` : n)),
                navActive: tab,
                title: titles[tab][0],
                subtitle: titles[tab][1],
                user: { initial: m.name.replace("أ. ", "")[0], name: m.name, role: m.role },
              }}
              onNav={(i) => { setFocus(null); setTab(i); }}
              aside={<button type="button" onClick={() => portalActions.centerLogin(null)} className="mt-6 w-full rounded-[10px] border border-white/30 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">تسجيل الخروج</button>}
            >
              {tab === 0 && (
                <Guide
                  id="center"
                  kicker="بوابة المركز"
                  title="يومك في المركز"
                  lead="هنا التشغيل اليومي: ما يطلبه الطلاب، ومن يحتاج تواصلًا، والفعاليات."
                  steps={[
                    { title: "ابدأ بلوحة اليوم", text: "طلبات الحجز الجديدة وجلسات اليوم والمتعثرون من طلابك." },
                    { title: "أكّد الجلسات وسجّل ملاحظاتها", text: "تأكيدك يصل الطالب فورًا، وملاحظاتك تظهر في ملفه." },
                    { title: "تابع طلابك", text: "ملف كل طالب: جداراته وجلساته وشهاداته وتدريبه على المقابلات." },
                    { title: "انشر الفعاليات", text: "تظهر في الصفحة الرئيسية وبوابة الطالب، وتسجّل حضورها." },
                  ]}
                  flows={["كل حجز من الطالب يصلك هنا.", "جلساتك تتحول إلى مؤشرات «خدمات المركز» لدى الجامعة."]}
                />
              )}
              {tab === 0 && <Today mid={m.id} go={(t, who) => { setFocus(who ?? null); setTab(t); }} />}
              {tab === 1 && <Sessions mid={m.id} />}
              {tab === 2 && <Students key={focus ?? "all"} mid={m.id} focus={focus} />}
              {tab === 3 && <Events />}
              {tab === 4 && <Team />}
            </Frame>
          )}
        </div>
      </div>
    </section>
  );
}
