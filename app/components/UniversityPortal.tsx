"use client";

import { useTabIntent } from "@/lib/route";
import LoginFrame from "./LoginFrame";
import { useState, type ComponentProps } from "react";
import data from "@/data/universities/demo/platform.json";
import { Frame } from "./Platform";
import Guide from "./Guide";
import UniversityDash from "./UniversityDash";
import Skills from "./Skills";
import { MarketGap, Performance, ServicesUsage, Accreditation } from "./UniversityInsights";
import { Alumni, Destination, Students, Verification, type StudentsPreset } from "./UniversityTabs";
import { ALL_STUDENTS, PROJECT_BASE, isCoopItem, compName, portalActions, studentYear, summary, usePortal } from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
const uni: any = data.views.find((x: any) => x.id === "university");

const NAV = ["لوحة القيادة", "الطلاب", "التحقق", "الأداء والمقارنة", "المهارات والمناهج", "خدمات المركز", "الاعتمادات", "المشاريع", "أصحاب العمل", "الوجهة والتقارير", "الخريجون"];
const field = "w-full rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}

function Comps({ ids }: { ids: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {ids.map((c) => (
        <span key={c} className="rounded-md bg-[#e3f0d9] px-2 py-1 text-xs font-semibold text-orange-text">
          {compName(c)}
        </span>
      ))}
    </div>
  );
}

function ApproveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-[10px] bg-teal px-4 py-2 text-sm font-bold text-white hover:bg-blue-bright">
      اعتماد
    </button>
  );
}

/* ---------- الاعتمادات ---------- */
function Approvals() {
  const st = usePortal();
  const jobs = st.jobs.filter((j) => j.status === "pending");
  const chs = st.challenges.filter((c) => c.status === "pending");
  const cos = st.companies.filter((c) => c.status === "pending");
  const sum = summary(st);
  const section = (title: string, n: number, children: React.ReactNode, empty: string) => (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-base font-extrabold text-navy">{title}</h4>
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: n ? "#f7f0da" : "#e3f0d9", color: n ? "#7a6420" : "#3a6e22" }}>
          {n ? `${n} بانتظار الاعتماد` : "لا شيء معلّق"}
        </span>
      </div>
      {n ? <ul className="mt-3 space-y-3">{children}</ul> : <p className="mt-2 text-sm text-ink-2">{empty}</p>}
    </Card>
  );
  return (
    <>
      <p className="text-sm font-bold text-navy" aria-live="polite">
        {sum.pendingApprovals ? `${sum.pendingApprovals} طلبات بانتظار اعتماد المركز` : "لا توجد طلبات معلّقة."}
      </p>
      {section(
        "طلبات انضمام الشركات",
        cos.length,
        cos.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-navy">{c.name}</p>
              <p className="text-xs text-ink-2">
                {c.sector} · {c.email}
              </p>
            </div>
            <ApproveBtn onClick={() => portalActions.approveCompany(c.id)} />
          </li>
        )),
        "كل الشركات المسجلة معتمدة."
      )}
      {section(
        "وظائف أصحاب العمل",
        jobs.length,
        jobs.map((j) => (
          <li key={j.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-navy">{j.title}</p>
              <p className="text-xs text-ink-2">
                {j.type} · {j.city}
              </p>
              {j.coop && (
                <p className="text-xs leading-6 text-ink-2">
                  {j.coop.duration} · يبدأ {j.coop.start || "—"} · {j.coop.seats === 1 ? "طالب واحد" : `${j.coop.seats} طلاب`} · المشرف: {j.coop.supervisor}
                </p>
              )}
              <Comps ids={j.comps} />
            </div>
            <ApproveBtn onClick={() => portalActions.approveJob(j.id)} />
          </li>
        )),
        "لا توجد وظائف بانتظار الاعتماد. تظهر هنا ما إن تنشرها شركة من بوابتها."
      )}
      {section(
        "تحديات الأعمال",
        chs.length,
        chs.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-navy">{c.title}</p>
              <p className="text-xs leading-6 text-ink-2">{c.desc}</p>
              <Comps ids={c.comps} />
            </div>
            <ApproveBtn onClick={() => portalActions.approveChallenge(c.id)} />
          </li>
        )),
        "لا توجد تحديات بانتظار الاعتماد."
      )}
    </>
  );
}

import ProjectShowcase from "./ProjectShowcase";

/* ---------- المشاريع ---------- */
function Coop() {
  const st = usePortal();
  const rows = st.shortlist.filter((x) => isCoopItem(x) && ["accepted", "completed"].includes(x.stage));
  const sum = summary(st);
  const cohort = ALL_STUDENTS.filter((x) => studentYear(x.id) === 4).length;
  /* سجل الجامعة التجريبي قبل أي نشاط في المنصة، تُضاف إليه المشاريع التي تُسند وتُسلَّم هنا */
  const BASE = PROJECT_BASE;
  const liveDone = rows.filter((x) => x.stage === "completed").length;
  const assigned = BASE.assigned + rows.length;
  const delivered = BASE.delivered + liveDone;
  const inProgress = assigned - delivered;
  const unassigned = Math.max(0, cohort - assigned);
  const rated = BASE.rated + rows.filter((x) => x.rating).length;
  const credited = sum.credited;
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">حالة مشاريع السنة الرابعة</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">من {cohort} طالبًا في السنة الرابعة: كم أُسند إليهم مشروع، وكم سلّموه، وكم لم يسلّموا بعد.</p>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-[#ece7e1]" role="img" aria-label={`سلّم ${delivered}، قيد التنفيذ ${inProgress}، بلا مشروع ${unassigned}`}>
          <span style={{ width: `${(100 * delivered) / (cohort || 1)}%`, background: "#3f7a24" }} />
          <span style={{ width: `${(100 * inProgress) / (cohort || 1)}%`, background: "#cdb774" }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            [cohort, "طلاب السنة الرابعة", "#3a6e22"],
            [assigned, "أُسند إليهم مشروع", "#3f7a24"],
            [delivered, "سلّموا المشروع", "#3f7a24"],
            [inProgress, "لم يسلّموا بعد", "#c2790a"],
            [unassigned, "لم يُسند إليهم", "#c2455a"],
          ].map(([n, l, c]) => (
            <div key={l as string} className="rounded-[12px] bg-[#f8f6f3] p-3">
              <p className="text-3xl font-extrabold" style={{ color: c as string }} dir="ltr">{n}</p>
              <p className="mt-1 text-xs font-bold text-ink-2">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-2">قُيّم {rated} مشروعًا واعتُمدت ساعات {credited}. نسبة التسليم: {assigned ? Math.round((100 * delivered) / assigned) : 0}%. الأرقام تشمل سجل الجامعة (تجريبي) وما يُسند عبر المنصة.</p>
      </Card>
      <Card>
        <h4 className="text-base font-extrabold text-navy">المشاريع المُسندة عبر المنصة</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">طلاب الفصل الثامن المقبولون لدى الشركات. يعتمد المشرف الساعات بعد المشروع وتقييم الشركة.</p>
        {rows.length ? (
          <ul className="mt-3 space-y-3">
            {rows.map((it) => {
              const s = ALL_STUDENTS.find((x) => x.id === it.studentId)!;
              const job = st.jobs.find((j) => j.id === it.jobId);
              const done = it.stage === "completed";
              const can = done && !!it.rating && !it.credited;
              return (
                <li key={it.studentId} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue font-extrabold text-white">{s.initial}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-navy">{s.name}</p>
                    <p className="text-xs text-ink-2">
                      {s.track} · {job ? job.title : "مشروع غير محدد"} · {done ? "سلّم المشروع" : "قيد التنفيذ"}
                    </p>
                    {job?.coop && <p className="text-xs text-ink-2">{job.coop.duration} · المشرف: {job.coop.supervisor}</p>}
                  </div>
                  <span className="text-xs font-bold text-ink-2">{it.rating ? `تقييم الشركة ${it.rating}/5` : "بانتظار التقييم"}</span>
                  {it.credited ? (
                    <span className="rounded-full bg-[#e3f0d9] px-3 py-1 text-xs font-bold text-[#3a6e22]">✓ اعتُمدت الساعات</span>
                  ) : (
                    <button
                      type="button"
                      disabled={!can}
                      onClick={() => portalActions.approveCredit(it.studentId)}
                      className="rounded-[10px] bg-teal px-4 py-2 text-sm font-bold text-white enabled:hover:bg-blue-bright disabled:opacity-50"
                    >
                      اعتماد الساعات
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-2">لا مشاريع بعد. تظهر هنا حين تُسند شركة مشروعًا إلى طالب.</p>
        )}
      </Card>
      <ProjectShowcase />
    </>
  );
}

/* ---------- أصحاب العمل ---------- */
function Employers() {
  const st = usePortal();
  const [f, setF] = useState({ name: "", sector: "", email: "" });
  const [made, setMade] = useState<string | null>(null);
  const ok = f.name.trim().length > 2 && /\S+@\S+/.test(f.email);
  const approved = st.companies.filter((c) => c.status === "approved");
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">إنشاء حساب لشركة</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">المركز يمنح صاحب العمل الدخول، والحساب المنشأ هنا معتمد مباشرة.</p>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ok) return;
            portalActions.addCompany(f.name.trim(), f.sector.trim() || "غير محدد", f.email.trim());
            setMade(f.name.trim());
            setF({ name: "", sector: "", email: "" });
          }}
        >
          <label className="text-xs font-bold text-ink-2">
            اسم الشركة
            <input className={`${field} mt-1`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </label>
          <label className="text-xs font-bold text-ink-2">
            القطاع
            <input className={`${field} mt-1`} value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })} />
          </label>
          <label className="text-xs font-bold text-ink-2">
            بريد مسؤول التوظيف
            <input dir="ltr" className={`${field} mt-1`} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </label>
          <div className="sm:col-span-3">
            <button type="submit" disabled={!ok} className="rounded-[10px] bg-teal px-5 py-2.5 text-sm font-bold text-white enabled:hover:bg-blue-bright disabled:opacity-50">
              إنشاء الحساب وإرسال الدعوة
            </button>
            {made && (
              <p role="status" className="mt-2 text-xs font-bold text-orange-text">
                أُنشئ حساب {made}. أُرسلت دعوة الدخول إلى بريد مسؤول التوظيف.
              </p>
            )}
          </div>
        </form>
      </Card>
      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">الشركات الشريكة ({approved.length})</h4>
        <ul className="space-y-3">
          {approved.map((c) => {
            const mine = c.id === "m1";
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue font-extrabold text-white">{c.name.replace(/^(شركة|مصرف)\s/, "")[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-navy">{c.name}</p>
                  <p className="text-xs text-ink-2">
                    {c.sector} · {c.email}
                  </p>
                </div>
                {mine && (
                  <span className="text-xs font-semibold text-ink-2">
                    {st.jobs.filter((j) => j.status === "published").length} وظائف · {st.shortlist.length} مرشحين · {st.shortlist.filter((x) => x.stage === "hired").length} موظفين
                  </span>
                )}
                <span className="rounded-full bg-[#e3f0d9] px-2.5 py-0.5 text-[11px] font-bold text-[#3a6e22]">معتمدة</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

/* ---------- الدخول ---------- */
function Login({ onEnter }: { onEnter: () => void }) {
  return (
    <LoginFrame img="ev-alumni" pos="70% center" caption={"نتائج الخريجين في مكان واحد"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onEnter();
        }}
        className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-md"
      >
        <p className="text-center text-xs font-bold text-orange-text">بوابة الجامعة</p>
        <h3 className="mt-1 text-center text-xl font-extrabold text-navy">تسجيل الدخول</h3>
        <label className="mt-4 block text-xs font-bold text-ink-2">
          البريد الإلكتروني
          <input readOnly dir="ltr" className={`${field} mt-1 bg-[#f8f6f3]`} value="deanship@model-university.example" />
        </label>
        <label className="mt-3 block text-xs font-bold text-ink-2">
          كلمة المرور
          <input readOnly type="password" className={`${field} mt-1 bg-[#f8f6f3]`} value="demo-access" />
        </label>
        <button type="submit" className="mt-5 w-full rounded-[10px] bg-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-teal">
          دخول
        </button>
        <p className="mt-3 text-center text-[11px] leading-5 text-ink-2">حساب تجريبي لعمادة شؤون الطلاب ومركز الخدمات المهنية.</p>
      </form>
    </LoginFrame>
  );
}

/* ---------- المهارات والمناهج: فجوة السوق + تغطية المقررات ---------- */
function SkillsAndMarket({ skills }: { skills: ComponentProps<typeof Skills> }) {
  const [sub, setSub] = useState(0);
  return (
    <>
      <div role="tablist" aria-label="المهارات والمناهج" className="flex flex-wrap gap-2">
        {["فجوة السوق", "تغطية المقررات"].map((t, i) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={sub === i}
            onClick={() => setSub(i)}
            className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${sub === i ? "border-navy bg-blue text-white" : "border-[#d9d2ca] bg-white text-navy hover:border-navy"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {sub === 0 ? <MarketGap /> : <Skills {...skills} embedded />}
    </>
  );
}

/* ---------- البوابة ---------- */
export default function UniversityPortal({ skills }: { skills: ComponentProps<typeof Skills> }) {
  const st = usePortal();
  const auth = st.session.university;
  const setAuth = (on: boolean) => portalActions.setSession("university", on);
  const [tab, setTab] = useState(0);
  useTabIntent((k) => setTab(Number(k)));
  const [preset, setPreset] = useState<StudentsPreset>(null);
  const [who, setWho] = useState<string | null>(null);
  const pend = summary(st).pendingApprovals;
  const titles = [
    ["لوحة القيادة", "مؤشرات الجامعة كلها، وبيانات أصحاب العمل تصل إليها مباشرة"],
    ["الطلاب", "كل طالب بسيرته وحالته في المنظومة"],
    ["التحقق", "نتيجة لجنة التحقق المستقلة للخريجين"],
    ["الأداء والمقارنة", "الدفعات والمسارات القانونية ورضا أصحاب العمل، جنبًا إلى جنب"],
    ["المهارات والمناهج", "ما يطلبه السوق، وما يتقنه الخريجون، وما تغطيه المقررات"],
    ["خدمات المركز", "كل خدمة من الخدمات الثماني مقيسة بهدفها"],
    ["الاعتمادات", "ما تنشره الشركات يصل الطلاب بعد اعتماد المركز"],
    ["المشاريع", "متابعة طلاب الفصل الثامن واعتماد ساعاتهم"],
    ["أصحاب العمل", "امنح الشركات دخول بوابتها وتابع نشاطها"],
    ["الوجهة والتقارير", "نتائج الخريجين بمعيار NACE محسوبة من بياناتهم، ومؤشرات الاعتماد وتقارير للتنزيل"],
    ["الخريجون", "من تخرجوا فعلًا: وضعهم المهني، ومن وُظّف عبر المركز، ومن يحتاج متابعة"],
  ];
  const v = {
    nav: NAV.map((n, i) => (i === 6 && pend ? `${n} (${pend})` : n)),
    navActive: tab,
    title: tab === 1 && who ? who : titles[tab][0],
    subtitle: tab === 1 && who ? "ملف الطالب وكل ما يخصه في المنظومة" : titles[tab][1],
    user: uni.user,
  };
  return (
    <section id="university" aria-labelledby="university-title" className="scroll-mt-28 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">بوابة الجامعة</p>
          <h2 id="university-title" className="mt-1 text-2xl font-extrabold text-navy md:text-3xl">
            بوابة العمادة: تتابع النتائج وتعتمد وتدير الشركاء
          </h2>
          <p className="mt-3 leading-8 text-ink-2">
            ما يفعله الطلاب وأصحاب العمل يصل هنا تلقائيًا، ومنه يعتمد المركز ما يُنشر ويمنح الشركات دخولها.
          </p>
          <span className="mt-3 inline-block rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">بيانات تجريبية</span>
        </div>
        <div className="mt-8">
          {!auth ? (
            <Login onEnter={() => setAuth(true)} />
          ) : (
            <Frame
              v={v}
              onNav={(i: number) => {
                if (i === 1) setPreset(null);
                setWho(null);
                setTab(i);
              }}
              aside={
                <button type="button" onClick={() => setAuth(false)} className="mt-6 w-full rounded-[10px] border border-white/30 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
                  تسجيل الخروج
                </button>
              }
            >
              {tab === 0 && (
                <Guide
                  id="university"
                  kicker="بوابة الجامعة"
                  title="ما تراه هنا وما تفعله"
                  lead="لوحة واحدة لطلابك وشركائك ونتائج خريجيك، بلا إدخال يدوي."
                  steps={[
                    { title: "تابع لوحة القيادة", text: "الجاهزية والجدارات والمسارات والمتعثرون، مع تصفية بالكلية والسنة والمسار." },
                    { title: "اعتمد ما تنشره الشركات", text: "الشركات والوظائف والتحديات تنتظر اعتمادك قبل أن تصل الطلاب (تبويب الاعتمادات)." },
                    { title: "راجع التحقق والمشاريع", text: "نتيجة لجنة التحقق، وساعات المشاريع التي تعتمدها بعد تقييم الشركة." },
                    { title: "قارن واتخذ القرار", text: "الدفعات والمسارات، وفجوة السوق، ورضا أصحاب العمل، وخدمات المركز." },
                    { title: "أصدر تقارير الاعتماد", text: "الوجهة بمعيار NACE ومؤشرات الجودة جاهزة للتنزيل." },
                  ]}
                  flows={["اعتمادك يفتح الفرص للطلاب فورًا.", "كل توظيف أو تقييم أو جلسة تتحدث أرقامه هنا تلقائيًا."]}
                />
              )}
              {tab === 0 && (
                <UniversityDash
                  onLagging={() => {
                    setPreset({ lag: true });
                    setWho(null);
                    setTab(1);
                  }}
                />
              )}
              {tab === 1 && <Students key={JSON.stringify(preset)} preset={preset} onTitle={setWho} />}
              {tab === 2 && <Verification />}
              {tab === 3 && <Performance />}
              {tab === 4 && <SkillsAndMarket skills={skills} />}
              {tab === 5 && <ServicesUsage />}
              {tab === 6 && <Approvals />}
              {tab === 7 && <Coop />}
              {tab === 8 && <Employers />}
              {tab === 10 && <Alumni />}
              {tab === 9 && (
                <>
                  <Destination />
                  <Accreditation />
                </>
              )}
            </Frame>
          )}
        </div>
      </div>
    </section>
  );
}
