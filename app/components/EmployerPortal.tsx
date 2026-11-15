"use client";

import { useTabIntent } from "@/lib/route";
import LoginFrame from "./LoginFrame";
import Guide from "./Guide";
import { useEffect, useRef, useState } from "react";
import { CvView, Frame } from "./Platform";
import {
  COMPANY,
  COLLEGES,
  TRACKS,
  COMPS,
  stagesFor,
  isCoopItem,
  STUDENTS,
  compName,
  jobYear,
  jobYearFor,
  matchStudents,
  portalActions,
  summary,
  usePortal,
  type Job,
  CERTS,
} from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Student = (typeof STUDENTS)[number];

const NAV = ["استكشاف الخريجين", "القائمة القصيرة", "المتقدمون", "تحديات الأعمال", "الوظائف", "الشركة"];
const DEFAULT_COMPS = ["problem-solving", "communication", "data-processing", "planning"];
const TYPES = ["وظيفة", "مشروع"];

const score = (s: Student, c: string) => (s.scores as Record<string, number>)[c] ?? 0;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
        on ? "border-navy bg-blue text-white" : "border-[#d9d2ca] bg-white text-navy hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}

function Avatar({ s, size = 44 }: { s: { initial: string }; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-blue font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {s.initial}
    </span>
  );
}

const field = "w-full rounded-[10px] border border-[#d9d2ca] bg-white px-3 py-2 text-sm text-ink focus:border-navy focus:outline-none";

/* ---------- سيرة الخريج بنفس شكل سيرة الطالب الجدارية ---------- */
const comp = (id: string) => COMPS.find((c) => c.id === id)!;

const YEAR_LABEL = ["", "السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة (توظيف ومشروع)", "خريج سابق"];

export function cvData(s: Student, certPlan?: Record<string, string>) {
  const plan = CERTS.map((c) => ({ c, v: certPlan?.[`${s.id}:${c.id}`] })).filter((x) => x.v);
  const earned = plan.filter((x) => x.v === "earned").map((x) => x.c.name);
  const studying = plan.filter((x) => x.v === "studying").map((x) => x.c.name);
  const ranked = COMPS.map((c) => ({ c, v: score(s, c.id) })).sort((a, b) => b.v - a.v || a.c.name.localeCompare(b.c.name));
  const top = ranked.slice(0, 5);
  const avg = ranked.reduce((a, x) => a + x.v, 0) / ranked.length;
  const pre = (s as { pre?: Record<string, number> }).pre;
  const delta = pre ? ranked.reduce((a, x) => a + (x.v - (pre[x.c.id] ?? x.v)), 0) / ranked.length : 0;
  const num = String(1000 + Number(s.id.slice(1)) * 37).padStart(5, "0");
  const verified = (s as { verified?: boolean }).verified === true;
  return {
    user: { initial: s.initial },
    person: { name: s.name, meta: `كلية ${s.college} · ${YEAR_LABEL[s.year]}${s.year === 5 ? ` (دفعة ${(s as unknown as { gradYear: number }).gradYear})` : ""} · المسار: ${s.track}` },
    stamp: {
      title: "تحقق مركز المسار المهني",
      number: verified ? `رقم الشهادة YU-2027-${num}` : s.year === 5 ? "لم يمر بلجنة التحقق" : s.year === 4 ? "بانتظار لجنة التحقق" : "يُمنح عند التخرج",
      source: "قياس نوفا + لجنة تحقق مستقلة",
    },
    topTitle: "أعلى خمس جدارات",
    topNote: top.every((x) => x.v === 0) ? "لم تُقيَّم الجدارات بعد. تظهر هنا بعد تقييم Nova وتوثيق الجدارات مع المرشد." : "درجة الجدارة من 1 إلى 5 · تُعرض نقاط القوة (3 فأعلى) فقط",
    top: top.filter((x) => x.v > 0).map((x) => ({ name: `${x.c.name} (${comp(x.c.id).en})`, score: x.v, text: comp(x.c.id).text })),
    stylesTitle: "أنماط العمل الجماعي",
    styles: s.styles,
    certTitle: "الشهادة المهنية",
    cert: earned.length ? `${earned.join("، ")} · حاصل عليها` : studying.length ? `${studying.join("، ")} · قيد التحضير` : s.cert ? `${s.cert} · قيد الاختبار` : "لا توجد بعد",
    challengeTitle: "تحدي الأعمال",
    challenge: s.year === 5 ? "لم يشارك في تحدي أعمال" : s.year === 4 ? `تحدي أعمال مع مكتب مرساة للمحاماة · تقييم اللجنة ${(3.4 + (avg / 5) * 1.4).toFixed(1)}/5` : "يبدأ تحدي الأعمال في السنة الرابعة",
    deltaValue: s.year === 1 || s.year === 5 ? "—" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}`,
    deltaCaption: s.year === 5 ? "لا قياس قبلي: لم يمر بقياس Nova في الجامعة." : s.year === 1 ? "القياس القبلي الأول. لا فارق بعد." : "فارق القياس الحالي عن القياس القبلي (متوسط الجدارات الثماني)",
    deltaNote: "قياس نوفا الأول السنة الأولى",
    badgesTitle: "الشارات",
    badges: [
      { label: s.year >= 3 ? "النواة\nمكتملة" : "النواة\nقيد الإنجاز", tone: "teal" },
      { label: `مسار\n${s.track}`, tone: "navy" },
      ...(s.year === 4 ? [{ label: "تحدي\nأعمال", tone: "gold" }] : []),
    ],
  };
}

function StudentCv({ s }: { s: Student }) {
  const st = usePortal();
  const on = st.shortlist.some((x) => x.studentId === s.id);
  return (
    <CvView
      v={cvData(s)}
      shareSlot={
        <Card>
          <h4 className="mb-2 text-base font-extrabold text-navy">إجراءات صاحب العمل</h4>
          <p className="text-xs leading-6 text-ink-2">السيرة كاملة ومتاحة لك لأنك صاحب عمل معتمد من المركز.</p>
          <button
            type="button"
            aria-pressed={on}
            onClick={() => portalActions.toggleShortlist(s.id)}
            className={`mt-3 w-full rounded-[10px] px-4 py-2.5 text-sm font-bold transition-colors ${
              on ? "border-2 border-teal bg-white text-orange-text" : "bg-teal text-white hover:bg-blue-bright"
            }`}
          >
            {on ? "✓ في القائمة القصيرة" : "إضافة للقائمة القصيرة"}
          </button>
        </Card>
      }
    />
  );
}

/* ---------- استكشاف الخريجين ---------- */
function Explore({
  q,
  setQ,
  onOpen,
}: {
  q: { title: string; comps: string[]; min: number; college: string; cert: string; year: number };
  setQ: (n: any) => void;
  onOpen: (s: Student) => void;
}) {
  const st = usePortal();
  const results = matchStudents(q.comps, q.min, q.college, q.year).filter((r) => q.cert === "all" || r.s.cert === q.cert);
  const toggle = (id: string) => setQ({ ...q, comps: q.comps.includes(id) ? q.comps.filter((x) => x !== id) : [...q.comps, id] });
  return (
    <>
      <Card>
        <label className="block text-xs font-bold text-ink-2" htmlFor="ex-title">
          الوظيفة المطلوبة
        </label>
        <input id="ex-title" className={`${field} mt-1`} value={q.title} onChange={(e) => setQ({ ...q, title: e.target.value })} placeholder="مثال: مستشار قانوني مبتدئ" />
        <p className="mt-4 text-xs font-bold text-ink-2">الفئة</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip on={q.year === 4} onClick={() => setQ({ ...q, year: 4 })}>
            طلاب السنة الرابعة (توظيف ومشروع في الفصل الثامن)
          </Chip>
          <Chip on={q.year === 5} onClick={() => setQ({ ...q, year: 5 })}>
            خريجون سابقون (دفعات 2022 – 2026)
          </Chip>
        </div>
        <p className="mt-4 text-xs font-bold text-ink-2">الجدارات المطلوبة (اختر 3 فأكثر)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMPS.map((c) => (
            <Chip key={c.id} on={q.comps.includes(c.id)} onClick={() => toggle(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-bold text-ink-2">
            الحد الأدنى للدرجة
            <select className={`${field} mt-1`} value={q.min} onChange={(e) => setQ({ ...q, min: Number(e.target.value) })}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} من 5 فأعلى
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            المسار القانوني
            <select className={`${field} mt-1`} value={q.college} onChange={(e) => setQ({ ...q, college: e.target.value })}>
              <option value="all">كل المسارات</option>
              {TRACKS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-ink-2">
            الشهادة المهنية
            <select className={`${field} mt-1`} value={q.cert} onChange={(e) => setQ({ ...q, cert: e.target.value })}>
              <option value="all">أي شهادة</option>
              <option value="m1">شهادة مهنية</option>
              
            </select>
          </label>
        </div>
      </Card>

      <p className="text-sm font-bold text-navy" aria-live="polite">
        {q.comps.length < 3
          ? "اختر ثلاث جدارات على الأقل لتظهر النتائج."
          : `${results.length} ${q.year >= 4 ? "خريجًا" : "طالبًا"} يحرزون ${q.min} فأعلى في كل الجدارات المطلوبة`}
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(q.comps.length < 3 ? [] : results).slice(0, 12).map(({ s, pct }) => {
          const on = st.shortlist.some((x) => x.studentId === s.id);
          return (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <Avatar s={s} />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-navy">{s.name}</p>
                  <p className="text-xs text-ink-2">
                    كلية {s.college} · {s.track}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-navy" dir="ltr">
                    {pct}%
                  </p>
                  <p className="text-[10px] text-ink-2">تطابق الجدارات</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {q.comps.map((c) => (
                  <span key={c} className="rounded-md bg-[#e3f0d9] px-2 py-1 text-xs font-semibold text-orange-text">
                    {score(s, c)} {compName(c)}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.styles.map((x) => (
                  <span key={x} className="rounded-md bg-[#f1ede8] px-2 py-1 text-xs font-semibold text-ink-2">
                    {x}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => portalActions.toggleShortlist(s.id)}
                  className={`rounded-[10px] px-4 py-2 text-sm font-bold transition-colors ${
                    on ? "border-2 border-teal bg-white text-orange-text" : "bg-teal text-white hover:bg-blue-bright"
                  }`}
                >
                  {on ? "✓ في القائمة القصيرة" : "إضافة للقائمة القصيرة"}
                </button>
                <button type="button" onClick={() => onOpen(s)} className="rounded-[10px] border border-[#d9d2ca] px-4 py-2 text-sm font-bold text-navy hover:border-navy">
                  عرض السيرة الكاملة
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      {results.length > 12 && q.comps.length >= 3 && <p className="text-xs text-ink-2">يُعرض أعلى 12 من {results.length}. شدّد الفلاتر لتضييق القائمة.</p>}
    </>
  );
}

/* ---------- القائمة القصيرة ---------- */
function Shortlist({ onOpen, goExplore }: { onOpen: (s: Student) => void; goExplore: () => void }) {
  const st = usePortal();
  if (!st.shortlist.length)
    return (
      <Card className="text-center">
        <p className="text-base font-bold text-navy">لم تضف أحدًا للقائمة القصيرة بعد</p>
        <p className="mt-1 text-sm text-ink-2">ابحث عن خريجين بالجدارات، ثم أضف من يناسبك.</p>
        <button type="button" onClick={goExplore} className="mt-3 rounded-[10px] bg-teal px-5 py-2 text-sm font-bold text-white hover:bg-blue-bright">
          استكشاف الخريجين
        </button>
      </Card>
    );
  return (
    <ul className="space-y-4">
      {st.shortlist.map((it) => {
        const s = STUDENTS.find((x) => x.id === it.studentId)!;
        const stages = stagesFor(it.studentId);
        const idx = stages.findIndex((x) => x.id === it.stage);
        const next = stages[idx + 1];
        const coop = isCoopItem(it);
        const job = st.jobs.find((j) => j.id === it.jobId);
        const taken = job?.coop ? st.shortlist.filter((x) => x.jobId === job.id && ["accepted", "completed"].includes(x.stage)).length : 0;
        const full = !!job?.coop && next?.id === "accepted" && taken >= job.coop.seats;
        const done = it.stage === "hired" || it.stage === "completed";
        return (
          <li key={it.studentId}>
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <Avatar s={s} />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-navy">{s.name}</p>
                  <p className="text-xs text-ink-2">
                    كلية {s.college} · {s.track} · {s.year === 5 ? "خريج سابق" : coop ? "السنة الرابعة (مشروع)" : "السنة الرابعة"}
                  </p>
                  {job && (
                    <p className="text-xs text-ink-2">
                      {job.title}
                      {job.coop && ` · الطلاب: ${taken} من ${job.coop.seats}`}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => onOpen(s)} className="rounded-[10px] border border-[#d9d2ca] px-3 py-1.5 text-xs font-bold text-navy hover:border-navy">
                  عرض السيرة
                </button>
              </div>

              <ol className="mt-4 flex flex-wrap gap-1.5" aria-label={coop ? "مراحل المشاريع" : "مراحل التوظيف"}>
                {stages.map((g, i) => (
                  <li
                    key={g.id}
                    aria-current={i === idx ? "step" : undefined}
                    className="rounded-full px-3 py-1 text-xs font-bold"
                    style={{
                      background: i < idx ? "#e3f0d9" : i === idx ? "#3f7a24" : "#f1ede8",
                      color: i < idx ? "#3a6e22" : i === idx ? "#fff" : "#7a6f64",
                    }}
                  >
                    {g.name}
                  </li>
                ))}
              </ol>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {next ? (
                  <button
                    type="button"
                    disabled={full}
                    onClick={() => portalActions.setStage(it.studentId, next.id)}
                    className="rounded-[10px] bg-teal px-4 py-2 text-sm font-bold text-white enabled:hover:bg-blue-bright disabled:opacity-50"
                  >
                    الانتقال إلى: {next.name}
                  </button>
                ) : (
                  <span className="rounded-full bg-[#e3f0d9] px-3 py-1 text-xs font-bold text-[#3a6e22]">
                    {coop ? "✓ سلّم المشروع · يظهر في متابعة الجامعة" : "✓ تم التوظيف · يظهر في لوحة نتائج الجامعة"}
                  </span>
                )}
                {full && <span className="text-xs font-bold text-[#7a6420]">اكتمل عدد الطلاب في هذا المشروع</span>}
                {coop && it.stage === "accepted" && <span className="text-xs text-ink-2">الطالب ينفذ المشروع الآن. سجّل التسليم عند نهاية المدة.</span>}
                <button type="button" onClick={() => portalActions.toggleShortlist(it.studentId)} className="ms-auto text-xs font-bold text-ink-2 underline">
                  إزالة
                </button>
              </div>

              {it.stage === "shortlisted" && (
                <label className="mt-3 block text-xs font-bold text-ink-2">
                  {coop ? "المشروع المرشح له" : "الوظيفة المرشح لها"}
                  <select className={`${field} mt-1`} value={it.jobId ?? ""} onChange={(e) => portalActions.setJob(it.studentId, e.target.value || null)}>
                    <option value="">غير محدد</option>
                    {st.jobs
                      .filter((j) => j.status === "published" && jobYear(j.type) === jobYearFor(s.year) && (s.year !== 5 || j.type !== "مشروع"))
                      .map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title}
                        </option>
                      ))}
                  </select>
                </label>
              )}

              {done && (
                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                  <span className="text-xs font-bold text-ink-2">{coop ? "تقييم مشروع الطالب" : "تقييم الأداء بعد التوظيف"}</span>
                  <Rate value={it.rating} onRate={(n) => portalActions.rateHire(it.studentId, n)} label={`تقييم أداء ${s.name}`} />
                  {coop && (
                    <span className="text-xs text-ink-2">{it.credited ? "✓ اعتمد المشرف الأكاديمي ساعات المشروع" : "ساعات المشروع بانتظار اعتماد المشرف الأكاديمي"}</span>
                  )}
                </div>
              )}

              <label className="mt-3 block text-xs font-bold text-ink-2">
                ملاحظة
                <input className={`${field} mt-1`} value={it.note} onChange={(e) => portalActions.setNote(it.studentId, e.target.value)} placeholder="ملاحظة داخلية عن المرشح" />
              </label>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- الوظائف ---------- */
type JobForm = { title: string; type: string; city: string; comps: string[]; desc: string; deadline: string; duration: string; start: string; paid: boolean; stipend: string; seats: string; supervisor: string; convert: boolean; deliverable: string };
const emptyForm: JobForm = { title: "", type: "وظيفة", city: "الرياض", comps: [], desc: "", deadline: "", duration: "فصل دراسي", start: "", paid: true, stipend: "", seats: "1", supervisor: "", convert: false, deliverable: "" };
const DURATIONS = ["فصل دراسي", "صيف"];

function JobPoster({ f }: { f: JobForm }) {
  const coop = f.type === "مشروع";
  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-md">
      <div className="p-5 text-white" style={{ background: "linear-gradient(135deg,#1e1e1e 0%,#3f7a24 100%)" }}>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-navy">{COMPANY.initial}</span>
          <div>
            <p className="text-sm font-bold">{COMPANY.name}</p>
            <p className="text-xs text-white/75">{COMPANY.sector}</p>
          </div>
          <span className="ms-auto rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{f.type}</span>
        </div>
        <p className="mt-5 text-2xl font-extrabold leading-9">{f.title || (coop ? "عنوان المشروع" : "عنوان الوظيفة")}</p>
        <p className="mt-1 text-sm text-white/80">{f.city || "المدينة"}</p>
      </div>
      <div className="p-5">
        {coop && (
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
            {[
              ["المدة", f.duration],
              ["البداية", f.start || "—"],
              ["عدد الطلاب", f.seats || "—"],
              ["المخرجات", f.deliverable.trim() || "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[10px] bg-[#f8f6f3] p-2.5">
                <p className="text-ink-2">{k}</p>
                <p className="font-bold text-navy">{v}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs font-bold text-ink-2">{coop ? "الجدارات التي يبنيها المشروع" : "الجدارات المطلوبة"}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {f.comps.length ? (
            f.comps.map((c) => (
              <span key={c} className="rounded-md bg-[#e3f0d9] px-2.5 py-1 text-xs font-semibold text-orange-text">
                {compName(c)}
              </span>
            ))
          ) : (
            <span className="text-xs text-ink-2">اختر الجدارات</span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#eee9e3] pt-3 text-xs text-ink-2">
          <span>آخر موعد: {f.deadline || "—"}</span>
          <span className="rounded-full bg-blue px-3 py-1 font-bold text-white">قدّم الآن</span>
        </div>
      </div>
    </div>
  );
}

function Jobs({ onMatch }: { onMatch: (j: Job) => void }) {
  const st = usePortal();
  const [f, setF] = useState<JobForm>(emptyForm);
  const [sent, setSent] = useState(false);
  const coop = f.type === "مشروع";
  const coopOk = !coop || (Number(f.seats) >= 1 && f.supervisor.trim().length > 2 && !!f.start && f.deliverable.trim().length > 2);
  const ok = f.title.trim().length > 2 && f.comps.length >= 3 && coopOk;
  const toggle = (id: string) => setF({ ...f, comps: f.comps.includes(id) ? f.comps.filter((x) => x !== id) : [...f.comps, id] });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    portalActions.addJob({
      title: f.title.trim(),
      type: f.type,
      city: f.city,
      comps: f.comps,
      desc: f.desc,
      deadline: f.deadline,
      ...(coop ? { coop: { duration: f.duration, start: f.start, paid: false, stipend: 0, seats: Number(f.seats), supervisor: f.supervisor.trim(), convert: false, deliverable: f.deliverable.trim() } } : {}),
    });
    setF(emptyForm);
    setSent(true);
  };
  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <h4 className="text-base font-extrabold text-navy">{coop ? "إعلان مشروع جديد" : "إعلان وظيفة جديد"}</h4>
          <form onSubmit={submit} className="mt-3 space-y-3" onChange={() => setSent(false)}>
            <label className="block text-xs font-bold text-ink-2">
              {coop ? "عنوان المشروع" : "عنوان الوظيفة"}
              <input className={`${field} mt-1`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثال: باحث قانوني" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-ink-2">
                النوع
                <select className={`${field} mt-1`} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-ink-2">
                المدينة
                <input className={`${field} mt-1`} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
              </label>
            </div>
            <p className="-mt-1 text-xs leading-6 text-ink-2">الوظيفة لطلاب السنة الرابعة والخريجين، والمشاريع لطلاب الفصل الثامن.</p>
            {coop && (
              <fieldset className="space-y-3 rounded-[12px] border border-[#d9d2ca] p-3">
                <legend className="px-1 text-xs font-extrabold text-navy">تفاصيل المشاريع</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-bold text-ink-2">
                    المدة
                    <select className={`${field} mt-1`} value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })}>
                      {DURATIONS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-ink-2">
                    تاريخ البداية
                    <input type="date" className={`${field} mt-1`} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} />
                  </label>
                  <label className="text-xs font-bold text-ink-2">
                    عدد الطلاب
                    <input type="number" min={1} className={`${field} mt-1`} value={f.seats} onChange={(e) => setF({ ...f, seats: e.target.value })} />
                  </label>
                </div>
                <label className="block text-xs font-bold text-ink-2">
                  مشرف الشركة
                  <input className={`${field} mt-1`} value={f.supervisor} onChange={(e) => setF({ ...f, supervisor: e.target.value })} placeholder="اسم من سيشرف على الطلاب" />
                </label>
                <label className="block text-xs font-bold text-ink-2">
                  المخرجات المطلوبة من الطلاب
                  <input className={`${field} mt-1`} value={f.deliverable} onChange={(e) => setF({ ...f, deliverable: e.target.value })} placeholder="مثال: تقرير تحليل وعرض تقديمي" />
                </label>
              </fieldset>
            )}
            <div>
              <p className="text-xs font-bold text-ink-2">{coop ? "الجدارات التي يبنيها المشروع (3 فأكثر)" : "الجدارات المطلوبة (3 فأكثر)"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMPS.map((c) => (
                  <Chip key={c.id} on={f.comps.includes(c.id)} onClick={() => toggle(c.id)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
            </div>
            <label className="block text-xs font-bold text-ink-2">
              الوصف
              <textarea className={`${field} mt-1`} rows={3} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
            </label>
            <label className="block text-xs font-bold text-ink-2">
              آخر موعد للتقديم
              <input type="date" className={`${field} mt-1`} value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
            </label>
            <button type="submit" disabled={!ok} className="rounded-[10px] bg-teal px-5 py-2.5 text-sm font-bold text-white transition-colors enabled:hover:bg-blue-bright disabled:opacity-50">
              إرسال للاعتماد
            </button>
            {sent && (
              <p role="status" className="text-xs font-bold text-orange-text">
                أُرسل الإعلان لفريق المركز للاعتماد. يظهر للطلاب بعد اعتماده.
              </p>
            )}
          </form>
        </Card>
        <div>
          <p className="mb-2 text-xs font-bold text-ink-2">معاينة الإعلان كما يراه الطلاب</p>
          <JobPoster f={f} />
        </div>
      </div>

      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">وظائف الشركة</h4>
        <ul className="space-y-3">
          {st.jobs.map((j) => {
            const m = matchStudents(j.comps, 3, "all", jobYear(j.type)).length + (j.type !== "مشروع" ? matchStudents(j.comps, 3, "all", 5).length : 0);
            return (
              <li key={j.id} className="flex flex-wrap items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-navy">{j.title}</p>
                  <p className="text-xs text-ink-2">
                    {j.type} · {j.city} · {m} {j.type === "مشروع" ? "طالبًا" : "مرشحًا"} مطابقًا
                  </p>
                  {j.coop && (
                    <p className="text-xs text-ink-2">
                      {j.coop.duration} · يبدأ {j.coop.start || "—"} · {j.coop.seats === 1 ? "طالب واحد" : `${j.coop.seats} طلاب`} · المشرف: {j.coop.supervisor}{j.coop.deliverable ? ` · المخرجات: ${j.coop.deliverable}` : ""}
                    </p>
                  )}
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{ background: j.status === "published" ? "#e3f0d9" : "#f7f0da", color: j.status === "published" ? "#3a6e22" : "#7a6420" }}
                >
                  {j.status === "published" ? "منشورة" : "قيد اعتماد المركز"}
                </span>
                {j.status === "pending" ? (
                  <span className="text-xs text-ink-2">يعتمدها المركز من بوابة الجامعة</span>
                ) : (
                  <button type="button" onClick={() => onMatch(j)} className="rounded-[10px] bg-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-bright">
                    عرض المطابقين
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

/* ---------- تقييم بالنجوم (1 إلى 5) ---------- */
function Rate({ value, onRate, label }: { value: number | null; onRate: (n: number) => void; label: string }) {
  return (
    <span className="inline-flex gap-1" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          aria-label={`${n} من 5`}
          onClick={() => onRate(n)}
          className="h-8 w-8 rounded-full border text-sm font-bold transition-colors"
          style={{
            background: value !== null && n <= value ? "#3f7a24" : "#fff",
            color: value !== null && n <= value ? "#fff" : "#3a6e22",
            borderColor: value !== null && n <= value ? "#3f7a24" : "#d9d2ca",
          }}
        >
          {n}
        </button>
      ))}
    </span>
  );
}

/* ---------- المتقدمون ---------- */
function Applicants({ onOpen }: { onOpen: (s: Student) => void }) {
  const st = usePortal();
  const open = st.jobs.filter((j) => j.status === "published");
  const [jobId, setJobId] = useState(open[0]?.id ?? "");
  const job = open.find((j) => j.id === jobId) ?? open[0];
  if (!job)
    return (
      <Card className="text-center">
        <p className="text-base font-bold text-navy">لا توجد وظائف منشورة بعد</p>
        <p className="mt-1 text-sm text-ink-2">انشر وظيفة واعتمدها ليبدأ الطلاب بالتقدم.</p>
      </Card>
    );
  const apps = st.applications
    .filter((a) => a.jobId === job.id)
    .map((a) => {
      const s = STUDENTS.find((x) => x.id === a.studentId)!;
      const pct = Math.round((100 * job.comps.reduce((t, c) => t + score(s, c), 0)) / (5 * job.comps.length));
      return { s, pct };
    })
    .sort((a, b) => b.pct - a.pct);
  return (
    <>
      <Card>
        <p className="text-xs font-bold text-ink-2">الوظيفة</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {open.map((j) => (
            <Chip key={j.id} on={j.id === job.id} onClick={() => setJobId(j.id)}>
              {j.title} ({st.applications.filter((a) => a.jobId === j.id).length})
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-2">المتقدمون مرتبون بتطابق الجدارات: {job.comps.map(compName).join("، ")}. بيانات التقدم تجريبية.</p>
      </Card>
      <ul className="space-y-3">
        {apps.map(({ s, pct }) => {
          const on = st.shortlist.some((x) => x.studentId === s.id);
          return (
            <li key={s.id}>
              <Card className="flex flex-wrap items-center gap-3">
                <Avatar s={s} />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-navy">{s.name}</p>
                  <p className="text-xs text-ink-2">
                    كلية {s.college} · {s.track}
                  </p>
                </div>
                <span className="text-lg font-extrabold text-navy" dir="ltr">
                  {pct}%
                </span>
                <button type="button" onClick={() => onOpen(s)} className="rounded-[10px] border border-[#d9d2ca] px-3 py-1.5 text-xs font-bold text-navy hover:border-navy">
                  عرض السيرة الكاملة
                </button>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => portalActions.toggleShortlist(s.id, job.id)}
                  className={`rounded-[10px] px-3 py-1.5 text-xs font-bold ${on ? "border-2 border-teal bg-white text-orange-text" : "bg-teal text-white hover:bg-blue-bright"}`}
                >
                  {on ? "✓ في القائمة القصيرة" : "إضافة للقائمة القصيرة"}
                </button>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------- تحديات الأعمال ---------- */
function Challenges({ onOpen }: { onOpen: (s: Student) => void }) {
  const st = usePortal();
  const [f, setF] = useState({ title: "", desc: "", comps: [] as string[], deadline: "" });
  const [sent, setSent] = useState(false);
  const ok = f.title.trim().length > 2 && f.desc.trim().length > 5 && f.comps.length >= 2;
  const toggle = (id: string) => setF({ ...f, comps: f.comps.includes(id) ? f.comps.filter((x) => x !== id) : [...f.comps, id] });
  return (
    <>
      <Card>
        <h4 className="text-base font-extrabold text-navy">نشر تحدي أعمال جديد</h4>
        <p className="mt-1 text-xs leading-6 text-ink-2">مشكلة حقيقية من شركتك يحلها الطلاب. تظهر في سيرتهم، وتكشف لك من يستحق الترشيح.</p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!ok) return;
            portalActions.addChallenge({ title: f.title.trim(), desc: f.desc.trim(), comps: f.comps, deadline: f.deadline });
            setF({ title: "", desc: "", comps: [], deadline: "" });
            setSent(true);
          }}
          onChange={() => setSent(false)}
        >
          <label className="block text-xs font-bold text-ink-2">
            عنوان التحدي
            <input className={`${field} mt-1`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="مثال: تحسين تجربة العميل في الفروع" />
          </label>
          <label className="block text-xs font-bold text-ink-2">
            وصف المشكلة
            <textarea className={`${field} mt-1`} rows={3} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
          </label>
          <div>
            <p className="text-xs font-bold text-ink-2">الجدارات التي يقيسها التحدي (اثنتان فأكثر)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {COMPS.map((c) => (
                <Chip key={c.id} on={f.comps.includes(c.id)} onClick={() => toggle(c.id)}>
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>
          <label className="block text-xs font-bold text-ink-2">
            آخر موعد للتسليم
            <input type="date" className={`${field} mt-1`} value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} />
          </label>
          <button type="submit" disabled={!ok} className="rounded-[10px] bg-teal px-5 py-2.5 text-sm font-bold text-white enabled:hover:bg-blue-bright disabled:opacity-50">
            إرسال للاعتماد
          </button>
          {sent && (
            <p role="status" className="text-xs font-bold text-orange-text">
              أُرسل التحدي لفريق المركز للاعتماد. يظهر للطلاب بعد اعتماده.
            </p>
          )}
        </form>
      </Card>

      {st.challenges.map((c) => (
        <Card key={c.id}>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="min-w-0 flex-1 text-base font-extrabold text-navy">{c.title}</h4>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{ background: c.status === "published" ? "#e3f0d9" : "#f7f0da", color: c.status === "published" ? "#3a6e22" : "#7a6420" }}
            >
              {c.status === "published" ? "منشور" : "قيد اعتماد المركز"}
            </span>
            {c.status === "pending" && <span className="text-xs text-ink-2">يعتمده المركز من بوابة الجامعة</span>}
          </div>
          <p className="mt-1 text-sm leading-7 text-ink-2">{c.desc}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.comps.map((x) => (
              <span key={x} className="rounded-md bg-[#e3f0d9] px-2 py-1 text-xs font-semibold text-orange-text">
                {compName(x)}
              </span>
            ))}
          </div>
          {c.status === "published" && (
            <>
              <p className="mt-4 text-xs font-bold text-ink-2">تسليمات الطلاب ({c.subs.length}) · بيانات تجريبية</p>
              <ul className="mt-2 divide-y divide-[#eee9e3]">
                {c.subs.map((x) => {
                  const s = STUDENTS.find((y) => y.id === x.studentId)!;
                  const on = st.shortlist.some((y) => y.studentId === s.id);
                  return (
                    <li key={x.studentId} className="flex flex-wrap items-center gap-3 py-3">
                      <Avatar s={s} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-navy">{s.name}</p>
                        <button type="button" onClick={() => onOpen(s)} className="text-xs font-bold text-orange-text underline">
                          عرض السيرة
                        </button>
                      </div>
                      <Rate value={x.rating} onRate={(n) => portalActions.rateSubmission(c.id, s.id, n)} label={`تقييم تسليم ${s.name}`} />
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => portalActions.toggleShortlist(s.id)}
                        className={`rounded-[10px] px-3 py-1.5 text-xs font-bold ${on ? "border-2 border-teal bg-white text-orange-text" : "bg-teal text-white hover:bg-blue-bright"}`}
                      >
                        {on ? "✓ مرشح" : "ترشيح"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      ))}
    </>
  );
}

/* ---------- الشركة ---------- */
function Company() {
  const st = usePortal();
  const sum = summary(st);
  const open = st.jobs.filter((j) => j.status === "published");
  return (
    <>
      <div className="overflow-hidden rounded-[16px] bg-white shadow-sm">
        <div className="h-28" style={{ background: "linear-gradient(135deg,#1e1e1e 0%,#3f7a24 100%)" }} />
        <div className="px-5 pb-5">
          <span className="-mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-blue text-2xl font-extrabold text-white">{COMPANY.initial}</span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h4 className="text-xl font-extrabold text-navy">{COMPANY.name}</h4>
            <span className="rounded-full bg-[#e3f0d9] px-2.5 py-0.5 text-[11px] font-bold text-[#3a6e22]">✓ معتمدة من المركز</span>
            <span className="rounded-full bg-[#f7f0da] px-2.5 py-0.5 text-[11px] font-bold text-[#7a6420]">{COMPANY.partner}</span>
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {COMPANY.sector} · {COMPANY.size} · {COMPANY.city}
          </p>
          <p className="mt-3 text-sm leading-7 text-ink">{COMPANY.about}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {COMPANY.values.map((v) => (
              <span key={v} className="rounded-md bg-[#e3f0d9] px-2.5 py-1 text-xs font-semibold text-orange-text">
                {v}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-2">{COMPANY.contact}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [sum.jobsPublished, "وظيفة منشورة"],
          [sum.shortlisted, "في القائمة القصيرة"],
          [sum.hired, "تم توظيفهم من الجامعة"],
        ].map(([n, l]) => (
          <Card key={l as string}>
            <p className="text-3xl font-extrabold text-orange-text">{n}</p>
            <p className="mt-1 text-sm text-ink-2">{l}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h4 className="mb-3 text-base font-extrabold text-navy">الوظائف المفتوحة</h4>
        {open.length ? (
          <ul className="space-y-2">
            {open.map((j) => (
              <li key={j.id} className="rounded-[10px] bg-[#f8f6f3] p-3 text-sm font-bold text-navy">
                {j.title} <span className="text-xs font-normal text-ink-2">· {j.type} · {j.city}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-2">لا توجد وظائف منشورة.</p>
        )}
      </Card>
    </>
  );
}

/* ---------- الدخول ---------- */
function Login({ onEnter }: { onEnter: () => void }) {
  return (
    <LoginFrame img="hero-3" pos="45% center" caption={"مرشحون بجداراتهم الموثقة"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onEnter();
        }}
        className="w-full max-w-sm rounded-[16px] bg-white p-6 shadow-md"
      >
        <p className="text-center text-xs font-bold text-orange-text">بوابة أصحاب العمل</p>
        <h3 className="mt-1 text-center text-xl font-extrabold text-navy">تسجيل الدخول</h3>
        <label className="mt-4 block text-xs font-bold text-ink-2">
          البريد الإلكتروني
          <input readOnly className={`${field} mt-1 bg-[#f8f6f3]`} value="recruiting@marsa.example" />
        </label>
        <label className="mt-3 block text-xs font-bold text-ink-2">
          كلمة المرور
          <input readOnly type="password" className={`${field} mt-1 bg-[#f8f6f3]`} value="demo-access" />
        </label>
        <button type="submit" className="mt-5 w-full rounded-[10px] bg-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-teal">
          دخول
        </button>
        <p className="mt-3 text-center text-[11px] leading-5 text-ink-2">حساب تجريبي. في الواقع ينشئ المركز حساب الشركة بعد اعتمادها.</p>
      </form>
    </LoginFrame>
  );
}

/* ---------- البوابة ---------- */
export function EmployersSection() {
  const st = usePortal();
  const auth = st.session.employers;
  const setAuth = (on: boolean) => portalActions.setSession("employers", on);
  const [tab, setTab] = useState(0);
  useTabIntent((k) => setTab(Number(k)));
  const [viewing, setViewing] = useState<Student | null>(null);
  const [q, setQ] = useState({ title: "مستشار قانوني مبتدئ", comps: DEFAULT_COMPS, min: 3, college: "all", cert: "all", year: 4 });

  const titles = [
    ["استكشاف الخريجين", "المواءمة بالجدارات الموثقة لا بالشهادة وحدها"],
    ["القائمة القصيرة", "تابع المرشحين مرحلة بعد مرحلة حتى التوظيف"],
    ["المتقدمون", "من تقدّم لوظائفك مرتبًا بنسبة تطابق الجدارات"],
    ["تحديات الأعمال", "مشكلة حقيقية من شركتك يحلها الطلاب وتكشف لك المواهب"],
    ["الوظائف", "انشر إعلانك ليراه الطلاب مع نسبة تطابق جداراتهم"],
    ["الشركة", "صفحة شركتك كما يراها الطلاب"],
  ];
  const v = {
    nav: NAV.map((n, i) => (i === 1 ? `${n} (${st.shortlist.length})` : i === 2 ? `${n} (${st.applications.length})` : n)),
    navActive: tab,
    title: viewing ? viewing.name : titles[tab][0],
    subtitle: viewing ? "السيرة الجدارية الموثقة · كاملة بدرجاتها" : titles[tab][1],
    user: { initial: COMPANY.initial, name: COMPANY.name, role: COMPANY.role },
  };

  return (
    <section id="employers" aria-labelledby="employers-title" className="scroll-mt-28 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">بوابة أصحاب العمل</p>
          <h2 id="employers-title" className="mt-1 text-2xl font-extrabold text-navy md:text-3xl">
            بوابة مستقلة لصاحب العمل: يبحث وينشر ويوظّف
          </h2>
          <p className="mt-3 leading-8 text-ink-2">
            لكل شركة معتمدة حساب خاص: تبحث بالجدارات، وتنشر وظائفها، وتتابع مرشحيها، ويظهر كل توظيف في بوابة الجامعة.
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
                setViewing(null);
                setTab(i);
              }}
              aside={
                <button type="button" onClick={() => setAuth(false)} className="mt-6 w-full rounded-[10px] border border-white/30 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">
                  تسجيل الخروج
                </button>
              }
            >
              {viewing ? (
                <>
                  <button type="button" onClick={() => setViewing(null)} className="mb-2 rounded-[10px] border border-[#d9d2ca] bg-white px-4 py-2 text-sm font-bold text-navy hover:border-navy">
                    ← رجوع
                  </button>
                  <StudentCv s={viewing} />
                </>
              ) : (
                <>
                  {tab === 0 && (
                    <Guide
                      id="employer"
                      kicker="بوابة أصحاب العمل"
                      title="كيف تصل إلى مرشحيك"
                      lead="ابحث بالجدارات لا بالمعدلات، وانشر وظائفك وتحدياتك، وتابع كل مرشح حتى التوظيف."
                      steps={[
                        { title: "استكشف المرشحين", text: "اختر الفئة (طلاب السنة الرابعة أو خريجون سابقون) والجدارات المطلوبة، وسترى نسب التطابق." },
                        { title: "أضف إلى القائمة القصيرة", text: "انقل المرشح بين المراحل: مقابلة، عرض، توظيف. وللمشاريع: قبول وإنهاء." },
                        { title: "انشر وظيفة أو تحديًا", text: "يراجعها المركز ويعتمدها قبل أن تصل إلى الطلاب." },
                        { title: "تابع المتقدمين", text: "من تقدم لوظائفك يظهر في تبويب المتقدمين بنسبة تطابقه." },
                        { title: "قيّم بعد التوظيف", text: "تقييمك يحسّن توصيات المركز ويدخل في مؤشرات الجامعة." },
                      ]}
                      flows={["وظيفتك تصل الطلاب بعد اعتماد المركز.", "كل توظيف يظهر فورًا في نتائج الجامعة.", "الطالب هو من يقرر ظهور ملفه لك، وردّه على عرضك يصلك مباشرة."]}
                    />
                  )}
                  {tab === 0 && <Explore q={q} setQ={setQ} onOpen={setViewing} />}
                  {tab === 1 && <Shortlist onOpen={setViewing} goExplore={() => setTab(0)} />}
                  {tab === 2 && <Applicants onOpen={setViewing} />}
                  {tab === 3 && <Challenges onOpen={setViewing} />}
                  {tab === 4 && (
                    <Jobs
                      onMatch={(j) => {
                        setQ({ ...q, title: j.title, comps: j.comps, min: 3, year: jobYear(j.type) });
                        setTab(0);
                      }}
                    />
                  )}
                  {tab === 5 && <Company />}
                </>
              )}
            </Frame>
          )}
        </div>
      </div>
    </section>
  );
}
