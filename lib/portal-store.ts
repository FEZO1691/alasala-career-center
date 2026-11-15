"use client";

import { useSyncExternalStore } from "react";
import { loadRemote, saveRemote } from "@/lib/persist";
import portal from "@/data/universities/demo/employer-portal.json";
import alumniData from "@/data/universities/demo/alumni.json";
import eventsSeed from "@/data/universities/demo/events.json";

/* مخزن حالة مشترك بين بوابات الموقع: الوظائف والقائمة القصيرة والتوظيف.
   أي تغيير فيه يظهر فورًا في بوابة أصحاب العمل ولوحة نتائج الجامعة. */

export type Job = {
  id: string;
  title: string;
  type: string;
  city: string;
  comps: string[];
  desc: string;
  deadline: string;
  status: "pending" | "published";
  /** حقول المشاريع (الفصل الثامن) */
  coop?: Coop;
};

export type Coop = { duration: string; start: string; paid: boolean; stipend: number; seats: number; supervisor: string; convert: boolean; deliverable?: string };

export type ShortItem = {
  studentId: string;
  stage: string;
  jobId: string | null;
  note: string;
  rating: number | null;
  /** عُرضت عليه وظيفة بعد التخرج (تحويل من المشاريع) */
  converted: boolean;
  /** اعتمد المشرف الأكاديمي ساعات المشروع */
  credited: boolean;
};
export type Application = { jobId: string; studentId: string };
export type Challenge = {
  id: string;
  title: string;
  desc: string;
  comps: string[];
  deadline: string;
  status: "pending" | "published";
  subs: { studentId: string; rating: number | null; text?: string }[];
};

export type Company = { id: string; name: string; sector: string; email: string; status: "approved" | "pending" };

export type Booking = { id: string; studentId: string; slot: string; topic: string; status: "requested" | "confirmed" | "done" | "cancelled"; note: string; mode?: "inperson" | "video" };
export const MODE_LABEL = { inperson: "حضوري في المركز", video: "مكالمة فيديو" } as const;
/** رابط جلسة الفيديو (تجريبي): يُنشأ للجلسة المؤكدة */
export const videoLink = (id: string) => `meet.alasala.example/${id}`;
export type EventItem = { id: string; type: string; title: string; date: string; place: string; text: string; seats: number; registered: string[]; attended: string[] };
export const MENTORS = [
  { id: "mn1", name: "أ. سارة العتيبي", user: "sara", role: "مرشدة مهنية" },
  { id: "mn2", name: "أ. ماجد الشهري", user: "majed", role: "مرشد مهني" },
];
/** توزيع الطلاب على المرشدين: بالتناوب بحسب رقم الطالب */
export const mentorOf = (studentId: string) => MENTORS[Number(studentId.slice(1)) % 2 === 0 ? 0 : 1];
export type State = {
  jobs: Job[];
  shortlist: ShortItem[];
  applications: Application[];
  challenges: Challenge[];
  companies: Company[];
  session: { employers: boolean; university: boolean; student: string | null; center: string | null };
  dest: Record<string, string>;
  /** طلاب أخفوا ملفهم عن أصحاب العمل */
  hidden: Record<string, boolean>;
  /** وجهة الطالب المهنية المستهدفة */
  goals: Record<string, { roles: string[]; sectors: string[] }>;
  /** ما علّمه الطالب بنفسه من خدمات المراحل: "studentId:serviceId" */
  ticks: Record<string, boolean>;
  bookings: Booking[];
  /** عروض رفضها الطالب */
  declined: Record<string, boolean>;
  events: EventItem[];
  /** حالة اهتمام الطالب بمنحة: "studentId:grantId" */
  grantStatus: Record<string, string>;
  /** طلاب تواصل معهم المركز بعد تعثرهم */
  contacted: Record<string, boolean>;
  /** تدريب المقابلات بالمساعد الذكي: عدد الأسئلة ومجموع الدرجات */
  practice: Record<string, { n: number; total: number }>;
  /** بطاقات التعريف التي أخفاها المستخدم: مفتاح البوابة */
  guides: Record<string, boolean>;
  /** مراجعات السيرة بالمساعد الذكي: آخر درجة وعدد المراجعات */
  cvChecks: Record<string, { score: number; n: number }>;
  /** طلبات لقاء بين طلاب وخريجين متطوعين للإرشاد */
  alumReqs: AlumReq[];
  /** خطة الشهادات المهنية: "studentId:certId" ← planned | studying | earned */
  certPlan: Record<string, string>;
  /** بيانات الخريج التي يدخلها بنفسه */
  alumData: Record<string, AlumData>;
  /** طلبات تقييم Nova للخريجين: تاريخ الطلب */
  novaReq: Record<string, string>;
};

export type AlumData = { email: string; phone: string; city: string; employer: string; title: string; institution: string; program: string; degree: string; updated: string };

export type AlumReq = { id: string; studentId: string; alumId: string; topic: string; status: "pending" | "accepted" | "declined" };

/** حساب الطالب التجريبي المباشر: لا يُقدَّم عنه تلقائيًا، ليجرّب التقديم والتسليم بنفسه */
const LIVE_DEMO = new Set(["s13"]);
const topMatches = (comps: string[], n: number, year = 4, skipLive = false) => matchStudents(comps, 3, "all", year).filter((r) => !(skipLive && LIVE_DEMO.has(r.s.id))).slice(0, n).map((r) => r.s.id);

let state: State = {
  jobs: portal.jobs as Job[],
  shortlist: [],
  applications: [],
  challenges: [],
  session: { employers: false, university: false, student: null, center: null },
  dest: {},
  hidden: {},
  goals: {},
  ticks: {},
  bookings: [
    { id: "b1", studentId: "s401", slot: "غدًا 10:00", topic: "اختيار المسار", status: "requested", note: "" },
    { id: "b2", studentId: "s12", slot: "اليوم 11:00", topic: "تفسير نتيجة Nova", status: "confirmed", note: "" },
    { id: "b3", studentId: "s13", slot: "اليوم 13:00", topic: "مراجعة السيرة", status: "confirmed", note: "", mode: "video" },
    { id: "b4", studentId: "s20", slot: "الاثنين 11:00", topic: "التحضير للمقابلة", status: "requested", note: "" },
    { id: "b5", studentId: "s7", slot: "الأحد الماضي 10:00", topic: "اختيار المسار", status: "done", note: "حدد المسار التحليلي، وقرر التقديم على ماجستير بعد التدريب." },
    { id: "b6", studentId: "s30", slot: "الثلاثاء 09:30", topic: "الدراسة العليا", status: "requested", note: "" },
  ],
  declined: {},
  events: eventsSeed.map((e, i) => ({ ...e, seats: [200, 40, 60, 25][i] ?? 30, registered: [], attended: [] })),
  grantStatus: {},
  contacted: {},
  practice: {},
  cvChecks: {},
  alumData: {},
  novaReq: {},
  guides: {},
  alumReqs: [],
  certPlan: {},
  companies: [
    { id: "m1", name: portal.company.name, sector: portal.company.sector, email: "recruiting@marsa.example", status: "approved" },
    { id: "m2", name: "أفق للاستشارات القانونية", sector: "استشارات قانونية", email: "hr@ofoq.example", status: "pending" },
    { id: "m3", name: "الإدارة القانونية، مصرف الريادة", sector: "قانون مصرفي", email: "talent@riyada.example", status: "pending" },
    { id: "m4", name: "نبراس للمحاماة", sector: "محاماة", email: "talent@nibras.example", status: "approved" },
    { id: "m5", name: "واحة للتحكيم", sector: "تحكيم ووساطة", email: "hr@waha.example", status: "approved" },
    { id: "m6", name: "سديم للملكية الفكرية", sector: "ملكية فكرية", email: "jobs@sadeem.example", status: "approved" },
    { id: "m7", name: "بيان للتوثيق", sector: "توثيق", email: "careers@bayan.example", status: "approved" },
    { id: "m8", name: "قوافل للمحاماة التجارية", sector: "عقود تجارية", email: "hr@qawafil.example", status: "approved" },
    { id: "m9", name: "سنا للقانون الطبي", sector: "قانون طبي", email: "talent@sana.example", status: "approved" },
    { id: "m10", name: "نخلة للأعمال المصرفية", sector: "قانون مصرفي", email: "hr@nakhla.example", status: "approved" },
    { id: "m11", name: "حصن للامتثال", sector: "امتثال وحوكمة", email: "jobs@hisn.example", status: "approved" },
    { id: "m12", name: "جسور للقانون البحري", sector: "قانون بحري", email: "hr@jusoor.example", status: "approved" },
    { id: "m13", name: "ميزان للزكاة والضرائب", sector: "زكاة وضرائب", email: "talent@mizan.example", status: "approved" },
    { id: "m14", name: "ظلال للعقود التجارية", sector: "عقود تجارية", email: "hr@zilal.example", status: "approved" },
    { id: "m15", name: "رواسي للقانون العقاري", sector: "عقار ورهن", email: "jobs@rawasi.example", status: "approved" },
    { id: "m16", name: "غيم لقانون الأعمال", sector: "قانون أعمال", email: "careers@ghaym.example", status: "approved" },
    { id: "m17", name: "رؤى لقانون الشركات", sector: "شركات", email: "hr@ruaa.example", status: "approved" },
    { id: "m18", name: "صدى لتسوية المنازعات", sector: "تسوية منازعات", email: "talent@sada.example", status: "approved" },
    { id: "m19", name: "مدار للاستشارات القانونية", sector: "استشارات قانونية", email: "jobs@madar.example", status: "approved" },
  ],
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: State) => {
  state = next;
  emit();
  // الجلسة (من سجّل الدخول) لا تُحفظ: كل زيارة تبدأ من صفحة الدخول
  const { session: _s, ...persisted } = next;
  void _s;
  saveRemote(persisted);
};

// استرجاع الحالة المحفوظة (إن كان Supabase مفعّلًا) بعد تحميل الصفحة
if (typeof window !== "undefined") {
  void loadRemote<Omit<State, "session">>().then((saved) => {
    if (saved && typeof saved === "object") {
      state = { ...state, ...saved, session: state.session };
      emit();
    }
  });
}

export const STAGES = portal.stages;
/** مراحل المشاريع (الفصل الثامن، السنة الرابعة) */
/** سجل الجامعة التجريبي للمشاريع قبل أي نشاط في المنصة، تُضاف إليه المشاريع التي تُسند وتُسلَّم هنا */
export const PROJECT_BASE = { assigned: 52, delivered: 31, rated: 27, credited: 22 };
export const COOP_STAGES = [
  { id: "shortlisted", name: "مرشّح للمشروع" },
  { id: "interview", name: "مناقشة المشروع" },
  { id: "accepted", name: "أُسند إليه المشروع" },
  { id: "completed", name: "سلّم المشروع" },
];
/** خريجون سابقون (دفعات قبل الحالية): يراهم أصحاب العمل فئة مستقلة */
export const ALUMNI = alumniData.alumni;
/** خريجون يتطوعون للإرشاد (كل ثالث خريج في البيانات التجريبية) */
export const ALUM_TOPICS = ["مقابلات العمل", "أول سنة في الوظيفة", "اختيار المسار", "الدراسة العليا"];
export const ALUM_MENTORS = ALUMNI.filter((_, i) => i % 3 === 0).map((a, i) => ({ ...a, topic: ALUM_TOPICS[i % ALUM_TOPICS.length] }));
/** وجهة الخريجين المسجلة سلفًا (بيانات تجريبية): يتركها بعضهم بلا تحديث ليتابعهم المركز */
const ALUM_SEED: Dest0[] = ["emp", "emp", "edu", "emp", "seekJob", "emp", "emp", "emp", "unknown", "unknown"];
type Dest0 = "emp" | "mil" | "edu" | "seekJob" | "seekEdu" | "not" | "unknown";
const ALUM_DEST: Record<string, string> = Object.fromEntries(ALUMNI.map((a, i) => [a.id, ALUM_SEED[i % 10]]));
export const ANY_STUDENTS = [...portal.students, ...ALUMNI] as unknown as typeof portal.students;
export const studentYear = (id: string) => ANY_STUDENTS.find((y) => y.id === id)?.year ?? 4;
/** سنة الوظائف التي يراها الطالب: الخريج السابق يرى وظائف الخريجين */
export const jobYearFor = (year: number) => (year === 5 ? 4 : year);
/** هل ترشيح الطالب لمشروع (الفصل الثامن) لا لوظيفة */
export const isCoopItem = (x: { jobId?: string | null }) => state.jobs.find((j) => j.id === x.jobId)?.type === "مشروع";
export const stagesFor = (studentId: string) => {
  const it = state.shortlist.find((x) => x.studentId === studentId);
  return it && isCoopItem(it) ? COOP_STAGES : STAGES;
};
export const ALL_STUDENTS = portal.students;
/** يراهم أصحاب العمل: السنة الرابعة (مشروع في الفصل الثامن وتوظيف) والخريجون فقط */
export const STUDENTS = ANY_STUDENTS.filter((x) => x.year >= 4);
/** الوظيفة والمشاريع (الفصل الثامن) كلاهما لطلاب السنة الرابعة */
export const jobYear = (_type: string) => 4;
export const COMPS = portal.competencies;
export const COLLEGES = Array.from(new Set(portal.students.map((x) => x.college)));
/** مسارات القانون الثمانية: تحل محل المقارنة بين الكليات، فالموقع لكلية واحدة */
export const TRACKS = Array.from(new Set(portal.students.map((x) => x.track)));
export const DEST_IDS = ["emp", "mil", "edu", "seekJob", "seekEdu", "not", "unknown"] as const;
export type Dest = (typeof DEST_IDS)[number];

/** الوجهة الأولى للخريج: المسجّلة مسبقًا، أو ما سجّله المركز، أو "موظف" إن وُظّف عبر بوابة أصحاب العمل */
export function destOf(st: { shortlist: ShortItem[]; dest: Record<string, string> }, id: string): Dest {
  if (st.shortlist.some((x) => x.studentId === id && x.stage === "hired")) return "emp";
  return (st.dest[id] ?? ((portal.students.find((y) => y.id === id) as { dest?: string } | undefined)?.dest ?? ALUM_DEST[id] ?? "unknown")) as Dest;
}

export function destCounts(st: { shortlist: ShortItem[]; dest: Record<string, string> }) {
  const out = Object.fromEntries(DEST_IDS.map((k) => [k, 0])) as Record<Dest, number>;
  portal.students.filter((x) => x.year === 4).forEach((x) => (out[destOf(st, x.id)] += 1));
  return out;
}

/** الموظفون من الخريجين */
export function placedIds(st: { shortlist: ShortItem[]; dest: Record<string, string> }) {
  return new Set(portal.students.filter((x) => x.year === 4 && destOf(st, x.id) === "emp").map((x) => x.id));
}

/** نتائج الخريجين بعد التخرج: دفعات 2022 – 2026 */
export function alumniStats(st: { shortlist: ShortItem[]; dest: Record<string, string>; applications: { studentId: string }[]; alumReqs: AlumReq[]; contacted: Record<string, boolean> }) {
  const c = Object.fromEntries(DEST_IDS.map((k) => [k, 0])) as Record<Dest, number>;
  ALUMNI.forEach((a) => (c[destOf(st, a.id)] += 1));
  const total = ALUMNI.length;
  const known = total - c.unknown;
  return {
    total,
    counts: c,
    known,
    knownRate: Math.round((100 * known) / total),
    employed: c.emp,
    hiredViaCenter: st.shortlist.filter((x) => x.stage === "hired" && ALUMNI.some((a) => a.id === x.studentId)).length,
    applicants: new Set(st.applications.filter((x) => ALUMNI.some((a) => a.id === x.studentId)).map((x) => x.studentId)).size,
    reqs: st.alumReqs.length,
    toFollow: ALUMNI.filter((a) => destOf(st, a.id) === "unknown" && !st.contacted[a.id]).map((a) => a.id),
  };
}

export const COMPANY = portal.company;
export const COHORT = portal.cohortSize;

export const compName = (id: string) => COMPS.find((c) => c.id === id)?.name ?? id;

export function usePortal() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state
  );
}

export const portalActions = {
  addJob(j: Omit<Job, "id" | "status">) {
    set({ ...state, jobs: [{ ...j, id: `j${Date.now()}`, status: "pending" }, ...state.jobs] });
  },
  approveJob(id: string) {
    const job = state.jobs.find((j) => j.id === id);
    // بيانات تجريبية: يتقدم لكل وظيفة معتمدة أعلى المطابقين
    const apps = job && !state.applications.some((a) => a.jobId === id) ? topMatches(job.comps, 6, jobYear(job.type), true).map((studentId) => ({ jobId: id, studentId })) : [];
    set({ ...state, jobs: state.jobs.map((j) => (j.id === id ? { ...j, status: "published" } : j)), applications: [...state.applications, ...apps] });
  },
  setSession(key: "employers" | "university", on: boolean) {
    set({ ...state, session: { ...state.session, [key]: on } });
  },
  studentLogin(id: string | null) {
    set({ ...state, session: { ...state.session, student: id } });
  },
  setVisible(id: string, visible: boolean) {
    set({ ...state, hidden: { ...state.hidden, [id]: !visible } });
  },
  setGoal(id: string, roles: string[], sectors: string[]) {
    set({ ...state, goals: { ...state.goals, [id]: { roles, sectors } } });
  },
  toggleTick(id: string, serviceId: string, current: boolean) {
    set({ ...state, ticks: { ...state.ticks, [`${id}:${serviceId}`]: !current } });
  },
  applyJob(studentId: string, jobId: string) {
    if (state.applications.some((a) => a.studentId === studentId && a.jobId === jobId)) return;
    set({ ...state, applications: [...state.applications, { jobId, studentId }] });
  },
  withdrawJob(studentId: string, jobId: string) {
    set({ ...state, applications: state.applications.filter((a) => !(a.studentId === studentId && a.jobId === jobId)) });
  },
  joinChallenge(challengeId: string, studentId: string, text: string) {
    set({
      ...state,
      challenges: state.challenges.map((c) =>
        c.id !== challengeId ? c : { ...c, subs: c.subs.some((x) => x.studentId === studentId) ? c.subs.map((x) => (x.studentId === studentId ? { ...x, text } : x)) : [...c.subs, { studentId, rating: null, text }] }
      ),
    });
  },
  respondOffer(studentId: string, accept: boolean) {
    set(
      accept
        ? { ...state, shortlist: state.shortlist.map((x) => (x.studentId === studentId ? { ...x, stage: "hired" } : x)) }
        : { ...state, shortlist: state.shortlist.filter((x) => x.studentId !== studentId), declined: { ...state.declined, [studentId]: true } }
    );
  },
  bookSession(studentId: string, slot: string, topic: string, mode: "inperson" | "video" = "inperson") {
    if (state.bookings.some((b) => b.studentId === studentId && b.slot === slot && b.status !== "cancelled")) return;
    set({ ...state, bookings: [...state.bookings, { id: `b${Date.now()}`, studentId, slot, topic, status: "requested", note: "", mode }] });
  },
  centerLogin(id: string | null) {
    set({ ...state, session: { ...state.session, center: id } });
  },
  setBooking(id: string, patch: Partial<Booking>) {
    set({ ...state, bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  },
  setGrantStatus(studentId: string, grantId: string, status: string) {
    set({ ...state, grantStatus: { ...state.grantStatus, [`${studentId}:${grantId}`]: status } });
  },
  recordPractice(studentId: string, score: number) {
    const p = state.practice[studentId] ?? { n: 0, total: 0 };
    set({ ...state, practice: { ...state.practice, [studentId]: { n: p.n + 1, total: p.total + score } } });
  },
  recordCv(studentId: string, score: number) {
    const c = state.cvChecks[studentId];
    set({ ...state, cvChecks: { ...state.cvChecks, [studentId]: { score, n: (c?.n ?? 0) + 1 } } });
  },
  requestAlum(studentId: string, alumId: string, topic: string) {
    if (state.alumReqs.some((r) => r.studentId === studentId && r.alumId === alumId && r.status !== "declined")) return;
    set({ ...state, alumReqs: [...state.alumReqs, { id: `r${Date.now()}`, studentId, alumId, topic, status: "pending" }] });
  },
  respondAlum(id: string, ok: boolean) {
    set({ ...state, alumReqs: state.alumReqs.map((r) => (r.id === id ? { ...r, status: ok ? "accepted" : "declined" } : r)) });
  },
  /** تسجيل خريج جديد: يضاف إلى قوائم الخريجين فتراه الجامعة والمركز وأصحاب العمل */
  registerAlumnus(f: { name: string; college: string; track: string; gradYear: number; dest: string; mentor: boolean }) {
    const n = ALUMNI.reduce((m, a) => Math.max(m, Number(a.id.slice(1))), 0) + 1;
    const scores = Object.fromEntries(COMPS.map((c) => [c.id, 0]));
    const a = {
      id: `a${n}`,
      name: f.name.trim(),
      initial: f.name.trim().charAt(0),
      college: f.college,
      track: f.track,
      year: 5,
      gradYear: f.gradYear,
      scores,
      styles: [],
      cert: null,
      verified: false,
      svc: { nova: false, cv: false, sessions: 0, roles: 0 },
    } as unknown as (typeof ALUMNI)[number];
    ALUMNI.push(a);
    (ANY_STUDENTS as unknown as unknown[]).push(a);
    (STUDENTS as unknown as unknown[]).push(a);
    if (f.mentor) ALUM_MENTORS.push({ ...a, topic: ALUM_TOPICS[n % ALUM_TOPICS.length] });
    set({ ...state, dest: { ...state.dest, [a.id]: f.dest }, session: { ...state.session, student: a.id } });
    return a.id;
  },
  setCert(studentId: string, certId: string, status: string | null) {
    const next = { ...state.certPlan };
    if (status) next[`${studentId}:${certId}`] = status;
    else delete next[`${studentId}:${certId}`];
    set({ ...state, certPlan: next });
  },
  setGuide(id: string, hidden: boolean) {
    set({ ...state, guides: { ...state.guides, [id]: hidden } });
  },
  contactStudent(studentId: string) {
    set({ ...state, contacted: { ...state.contacted, [studentId]: true } });
  },
  addEvent(e: Omit<EventItem, "id" | "registered" | "attended">) {
    set({ ...state, events: [{ ...e, id: `e${Date.now()}`, registered: [], attended: [] }, ...state.events] });
  },
  toggleRegister(eventId: string, studentId: string) {
    set({
      ...state,
      events: state.events.map((e) => {
        if (e.id !== eventId) return e;
        const on = e.registered.includes(studentId);
        return { ...e, registered: on ? e.registered.filter((x) => x !== studentId) : [...e.registered, studentId], attended: on ? e.attended.filter((x) => x !== studentId) : e.attended };
      }),
    });
  },
  toggleAttend(eventId: string, studentId: string) {
    set({ ...state, events: state.events.map((e) => (e.id !== eventId ? e : { ...e, attended: e.attended.includes(studentId) ? e.attended.filter((x) => x !== studentId) : [...e.attended, studentId] })) });
  },
  approveCompany(id: string) {
    set({ ...state, companies: state.companies.map((c) => (c.id === id ? { ...c, status: "approved" } : c)) });
  },
  addCompany(name: string, sector: string, email: string) {
    set({ ...state, companies: [...state.companies, { id: `m${Date.now()}`, name, sector, email, status: "approved" }] });
  },
  setAlumData(studentId: string, d: Omit<AlumData, "updated">) {
    set({ ...state, alumData: { ...state.alumData, [studentId]: { ...d, updated: new Date().toISOString().slice(0, 10) } } });
  },
  requestNova(studentId: string) {
    set({ ...state, novaReq: { ...state.novaReq, [studentId]: new Date().toISOString().slice(0, 10) } });
  },
  setDestination(studentId: string, dest: string) {
    set({ ...state, dest: { ...state.dest, [studentId]: dest } });
  },
  setJob(studentId: string, jobId: string | null) {
    set({ ...state, shortlist: state.shortlist.map((x) => (x.studentId === studentId ? { ...x, jobId } : x)) });
  },
  convertOffer(studentId: string) {
    set({ ...state, shortlist: state.shortlist.map((x) => (x.studentId === studentId ? { ...x, converted: true } : x)) });
  },
  approveCredit(studentId: string) {
    set({ ...state, shortlist: state.shortlist.map((x) => (x.studentId === studentId ? { ...x, credited: true } : x)) });
  },
  addChallenge(c: Omit<Challenge, "id" | "status" | "subs">) {
    set({ ...state, challenges: [{ ...c, id: `c${Date.now()}`, status: "pending", subs: [] }, ...state.challenges] });
  },
  approveChallenge(id: string) {
    const ch = state.challenges.find((c) => c.id === id);
    const subs = ch ? topMatches(ch.comps, 4, 4, true).map((studentId) => ({ studentId, rating: null })) : [];
    set({ ...state, challenges: state.challenges.map((c) => (c.id === id ? { ...c, status: "published", subs } : c)) });
  },
  rateSubmission(challengeId: string, studentId: string, rating: number) {
    set({
      ...state,
      challenges: state.challenges.map((c) =>
        c.id === challengeId ? { ...c, subs: c.subs.map((x) => (x.studentId === studentId ? { ...x, rating } : x)) } : c
      ),
    });
  },
  rateHire(studentId: string, rating: number) {
    set({ ...state, shortlist: state.shortlist.map((s) => (s.studentId === studentId ? { ...s, rating } : s)) });
  },
  toggleShortlist(studentId: string, jobId: string | null = null) {
    const has = state.shortlist.some((s) => s.studentId === studentId);
    set({
      ...state,
      shortlist: has
        ? state.shortlist.filter((s) => s.studentId !== studentId)
        : [...state.shortlist, { studentId, stage: "shortlisted", jobId, note: "", rating: null, converted: false, credited: false }],
    });
  },
  setStage(studentId: string, stage: string) {
    set({ ...state, shortlist: state.shortlist.map((s) => (s.studentId === studentId ? { ...s, stage } : s)) });
  },
  setNote(studentId: string, note: string) {
    set({ ...state, shortlist: state.shortlist.map((s) => (s.studentId === studentId ? { ...s, note } : s)) });
  },
};

/** نسبة التطابق: متوسط درجات الجدارات المطلوبة من 5، بشرط بلوغ الحد الأدنى في كل واحدة */
export function matchStudents(comps: string[], min: number, college: string, year = 4) {
  if (!comps.length) return [];
  return STUDENTS.filter((s) => !state.hidden[s.id] && s.year === year && (college === "all" || s.track === college) && comps.every((c) => (s.scores as Record<string, number>)[c] >= min))
    .map((s) => ({
      s,
      pct: Math.round((100 * comps.reduce((a, c) => a + (s.scores as Record<string, number>)[c], 0)) / (5 * comps.length)),
    }))
    .sort((a, b) => b.pct - a.pct);
}

export function summary(st: State) {
  const hired = st.shortlist.filter((x) => x.stage === "hired").length;
  const rated = st.shortlist.filter((x) => (x.stage === "hired" || x.stage === "completed") && x.rating);
  const trainees = st.shortlist.filter((x) => isCoopItem(x) && ["accepted", "completed"].includes(x.stage));
  return {
    jobsPublished: st.jobs.filter((j) => j.status === "published").length,
    jobsPending: st.jobs.filter((j) => j.status === "pending").length,
    shortlisted: st.shortlist.length,
    interviews: st.shortlist.filter((x) => ["interview", "offer", "hired", "accepted", "completed"].includes(x.stage)).length,
    hired,
    hiredRate: Math.round((100 * placedIds(st).size) / COHORT),
    placed: placedIds(st).size,
    coop: PROJECT_BASE.assigned + trainees.length,
    delivered: PROJECT_BASE.delivered + trainees.filter((x) => x.stage === "completed").length,
    credited: PROJECT_BASE.credited + trainees.filter((x) => x.credited).length,
    converted: st.shortlist.filter((x) => x.converted).length,
    pendingApprovals:
      st.jobs.filter((j) => j.status === "pending").length +
      st.challenges.filter((c) => c.status === "pending").length +
      st.companies.filter((c) => c.status === "pending").length,
    applicants: st.applications.length,
    challengesPublished: st.challenges.filter((c) => c.status === "published").length,
    submissions: st.challenges.reduce((a, c) => a + c.subs.length, 0),
    evaluated: rated.length,
    satisfaction: rated.length ? Math.round((10 * rated.reduce((a, x) => a + (x.rating ?? 0), 0)) / rated.length) / 10 : null,
  };
}

// بذور تجريبية: متقدمون على الوظيفة المنشورة وتحدٍ منشور
state = {
  ...state,
  applications: state.jobs.filter((j) => j.status === "published").flatMap((j) => topMatches(j.comps, 6, jobYear(j.type)).map((studentId) => ({ jobId: j.id, studentId }))),
  challenges: [
    {
      id: "c1",
      title: "إعادة تصميم عملية إقفال شهري",
      desc: "حلّل عملية الإقفال الحالية، وحدّد الاختناقات، وقدّم تصميمًا بديلًا بمؤشرات قياس واضحة.",
      comps: ["problem-solving", "communication", "planning"],
      deadline: "",
      status: "published",
      subs: topMatches(["problem-solving", "communication", "planning"], 4, 4).map((studentId) => ({ studentId, rating: null })),
    },
  ],
};

/* ---------- الشهادات المهنية ---------- */
import certData from "@/data/universities/demo/pro-certs.json";
export const CERTS = certData.certs;
export const CERTS_NOTE = certData.note;
export const CERT_ST: Record<string, string> = { planned: "في خطتي", studying: "أحضّر لها", earned: "حصلت عليها" };
/** الشهادات المناسبة: سنته ضمن المسموح، ومسارها يطابق مساره أو مفتوحة لكل المسارات */
export const CERT_STEPS = certData.steps as string[][];
/** الشهادات مرتبطة بمسار القانون وحده، وتبدأ في السنة الرابعة */
export const certsFor = (s: { year: number }) => CERTS.filter((c) => c.years.includes(s.year));

/* ---------- المنح ---------- */
import grantsData from "@/data/universities/demo/grants.json";
export const GRANTS = grantsData.grants;
export const GRANTS_NOTE = grantsData.note;
export type Grant = (typeof GRANTS)[number];
export const readiness = (s: { scores: unknown }) => {
  const sc = s.scores as Record<string, number>;
  return COMPS.reduce((a, c) => a + (sc[c.id] ?? 0), 0) / COMPS.length;
};
/** المنح المناسبة لطالب: سنته ضمن المسموح، وكليته، وجاهزيته بلغت الحد */
export function grantsFor(s: { year: number; college: string; scores: unknown }) {
  if (s.year !== 5) return []; // المنح للخريجين فقط، وتُوسَّع للطلاب لاحقًا
  const r = readiness(s);
  return GRANTS.filter((g) => g.years.includes(s.year) && (g.colleges.length === 0 || g.colleges.includes(s.college)) && r >= g.minReady);
}
