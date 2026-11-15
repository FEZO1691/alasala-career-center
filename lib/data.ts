import sharedStages from "@/data/shared/stages.json";
import sharedServices from "@/data/shared/services.json";
import skills from "@/data/shared/skills.json";
import naceSections from "@/data/shared/nace-sections.json";
import gateways from "@/data/shared/gateways.json";
import outcomesSpec from "@/data/shared/outcomes.json";
import features from "@/data/shared/features.json";
import chatbot from "@/data/shared/chatbot.json";

import demoInfo from "@/data/universities/demo/university.json";
import demoSemesters from "@/data/universities/demo/semesters.json";
import demoCourseSkillMap from "@/data/universities/demo/course-skill-map.json";
import demoServiceStatus from "@/data/universities/demo/service-status.json";
import demoStageSemesters from "@/data/universities/demo/stage-semesters.json";
import demoOutcomesSample from "@/data/universities/demo/outcomes-sample.json";
import demoStudentJourney from "@/data/universities/demo/student-journey.json";
import demoStudentScreens from "@/data/universities/demo/student-screens.json";
import demoStudentAssistant from "@/data/universities/demo/student-assistant.json";
import demoCertificates from "@/data/universities/demo/certificates.json";

export type ServiceStatus = "have" | "new";

export type Stage = {
  id: number;
  name: string;
  en: string;
  year: string;
  goal: string;
  services: { id: string; text: string; status: ServiceStatus }[];
  kpis: string[];
  sems: number[];
};

export type Service = {
  id: string;
  name: string;
  priority: "must" | "should";
  description: string;
  /** نقطتان نستهدفهما في الخدمة */
  targets: string[];
  /** سطر يوضح استخدام منصة ثروتي في الخدمة، إن وُجد */
  tharwati?: string;
};

/** حقول ومعادلات حاسبة الوجهة الأولى (NACE): ثابتة لكل الجامعات */
export type OutcomesSpec = {
  sectionTitle: string;
  description: string;
  calculatorTitle: string;
  ruleTitle: string;
  fields: { id: string; label: string }[];
  knowledge: {
    label: string;
    hint: string;
    knownFields: string[];
    target: number;
    formula: string;
    pass: string;
    fail: string;
  };
  results: {
    label: string;
    numeratorFields: string[];
    seekingFields: string[];
    formula: string;
  };
  messages: { over: string; unknown: string };
  cohortNote: string;
  publishNote: string;
};

/** أرقام المثال التجريبية الخاصة بالجامعة */
export type OutcomesSample = {
  badge: string;
  note: string;
  values: Record<string, number>;
};

/** المساعد الذكي التجريبي: ردود جاهزة مبنية على بيانات الموقع، بلا خادم ولا ذكاء اصطناعي */
export type ChatbotLink = { label: string; href?: string; gateway?: string };

export type ChatbotSpec = {
  name: string;
  badge: string;
  greeting: string;
  fallback: string;
  ui: {
    open: string;
    close: string;
    log: string;
    suggestions: string;
    inputLabel: string;
    placeholder: string;
    send: string;
    goTo: string;
  };
  answers: {
    id: string;
    question: string;
    /** تظهر كزر في الأسئلة المقترحة */
    suggested: boolean;
    keywords: string[];
    text: string;
    links: ChatbotLink[];
  }[];
};

/** رحلة الطالب التجريبية (قسم "جرّب تجربة الطالب"): فصل بعد فصل مع شاشات التطبيق */
export type JourneyScreenId =
  | "home"
  | "portfolio"
  | "nova"
  | "plan"
  | "skills"
  | "assistant"
  | "consult"
  | "library"
  | "cvjobs"
  | "certs";

export type JourneyTask = {
  text: string;
  status: "done" | "todo";
  optional?: boolean;
  proposed?: boolean;
};

export type JourneyScreenState = { state: "open" | "locked"; reason?: string; note?: string };

export type JourneyPeriod = {
  /** رقم الفصل (1 إلى 8) أو "graduate" بعد التخرج */
  id: number | "graduate";
  year: number | null;
  stageId: number;
  title: string;
  headline: string;
  tasks: JourneyTask[];
  /** أرقام خدمات من stages.json مثل "3-2" */
  services: string[];
  /** أرقام مهارات يقدمها المركز في هذا الفصل (delivery في skills.json) */
  centerUnits: string[];
  screens: Record<JourneyScreenId, JourneyScreenState>;
  /** نص كتبناه ولم يُنقل من ملفات المصدر (مبدئي) */
  draft: boolean;
};

export type JourneyScreenDef = {
  title: string;
  /** nav: شريط التنقل السفلي، card: بطاقة في الرئيسية */
  placement: "nav" | "card";
  summary?: string;
  sees: string;
  draft: boolean;
};

export type StudentJourney = {
  persona: { name: string; major: string; note: string };
  screens: Record<JourneyScreenId, JourneyScreenDef>;
  periods: JourneyPeriod[];
};

type PeriodId = number | "graduate";

/** محتوى شاشات التطبيق التجريبية (Nova، الخطة، المهارات، الاستشارة، المكتبة، السيرة والوظائف) */
export type StudentScreens = {
  demoNote: string;
  portfolio: {
    caption: string;
    counters: { tasks: string; services: string; skills: string };
    pastNote: string;
    timelineLabel: string;
    doneLabel: string;
    nowLabel: string;
    todoLabel: string;
    futureLine: string;
    certsLabel: string;
    share: { label: string; tag: string; note: string };
    sees: string;
  };
  draft: boolean;
  nova: {
    start: { title: string; text: string; button: string };
    questionsTitle: string;
    questions: { text: string; options: string[] }[];
    questionsOf: string;
    next: string;
    finish: string;
    doneMessage: string;
    resultLabel: string;
    inProgress: string;
    interestsTitle: string;
    interestsNote: string;
    interests: { name: string; pct: number }[];
    skillsTitle: string;
    skillsNote: string;
    /** قيم توضيحية لكل فئة (رقم الفئة من skills.json) */
    scores: Record<string, number>;
    compareTitle: string;
    compareBadge: string;
    compareNote: string;
    before: string;
    after: string;
    scoresAfter: Record<string, number>;
    sees: { start: string; questions: string; done: string; result: string; compare: string };
  };
  plan: {
    title: string;
    intro: string;
    steps: { title: string; opensAt: number; periodId: number }[];
    status: { done: string; current: string; locked: string };
    opensAtText: string;
    sees: string;
  };
  skills: {
    title: string;
    coverageTitle: string;
    coverageNote: string;
    centerTitle: string;
    more: string;
    gridTitle: string;
    gridUntil: string;
    counter: string;
    newBadge: string;
    legend: { university: string; center: string; optional: string; none: string };
    coveredMark: string;
    notCoveredMark: string;
    sees: string;
  };
  consult: {
    title: string;
    intro: string;
    daysTitle: string;
    days: string[];
    times: string[];
    mentorsTitle: string;
    mentorNote: string;
    mentors: { name: string; role: string }[];
    confirm: string;
    confirmedTitle: string;
    again: string;
    fixedLine: string;
    sees: { pick: string; confirmed: string };
  };
  library: {
    title: string;
    intro: string;
    rolesTitle: string;
    skillsLabel: string;
    jobsLabel?: string;
    roles: { id: string; title: string; text: string; skills: string[]; draft: boolean; jobs?: { title: string; code: string }[] }[];
    market: { title: string; text: string; draft: boolean };
    sees: string;
  };
  cvjobs: {
    title: string;
    cv: {
      title: string;
      serviceId: string;
      workshopServiceId: string;
      periods: PeriodId[];
      sampleTitle: string;
      sample: { headline: string; lines: string[] };
      notesTitle: string;
      notes: string[];
      sees: string;
    };
    jobs: {
      title: string;
      serviceId: string;
      periods: PeriodId[];
      note: string;
      items: { title: string; org: string; kind: string; match: string }[];
      sees: string;
    };
    coop: { title: string; code: string; serviceId: string; periods: PeriodId[] };
    lifelong: { title: string; serviceId: string; periods: PeriodId[] };
    followup: { title: string; text: string; serviceId: string; periods: PeriodId[] };
    sees: { cv: string; full: string; graduate: string };
  };
};

/** الشهادات المهنية (ترشيح داخل تطبيق الطالب): نوع الدعم delivery يحدد الوسم والصياغة من البيانات */
export type CertificateDelivery = "recommend" | "prepare" | "deliver";

export type Certificates = {
  draft: boolean;
  intro: string;
  skillsLabel: string;
  sees: string;
  delivery: Record<CertificateDelivery, { tag: string; line: string }>;
  assistant: { intro: string };
  items: {
    id: string;
    name: string;
    title: string;
    issuer: string;
    description: string;
    /** معرّفات مهارات من skills.json */
    skills: string[];
    /** الفصول التي تظهر فيها الشهادة */
    periods: number[];
    delivery: CertificateDelivery;
    draft: boolean;
    note: string;
  }[];
};

/** مساعد التطبيق (شاشة المساعد): أسئلة مقترحة بحسب الفصل وردود جاهزة مبنية على بيانات الموقع */
export type AssistantAnswerDef = {
  id: string;
  kind: "text" | "course" | "center-skills" | "plan" | "roles" | "path" | "certs";
  question: string;
  keywords: string[];
  text?: string;
  intro?: string;
  outro?: string;
  courseQuery?: string;
  screens?: JourneyScreenId[];
  draft: boolean;
};

export type StudentAssistant = {
  draft: boolean;
  greeting: string;
  suggestionsLabel: string;
  goTo: string;
  lockedSuffix: string;
  sees: { start: string; answered: string };
  /** ردود من chatbot.json تُستخدم هنا، ومعها الشاشات التي تفتحها روابطها */
  reuse: Record<string, JourneyScreenId[]>;
  /** نص بديل لرد معاد استخدامه عندما يختلف المقصود في التطبيق عن الموقع */
  textOverrides?: Record<string, string>;
  /** اسم مادة بالعربية إلى أكواد المواد (للأسئلة عن المواد) */
  courseAliases: Record<string, string[]>;
  course: { intro: string; line: string; outro: string; screens: JourneyScreenId[] };
  answers: AssistantAnswerDef[];
  suggested: Record<string, string[]>;
};

export type JourneyTab = { key: string; label: string; periodIds: (number | "graduate")[] };

export function getJourneyPeriod(journey: StudentJourney, id: number | "graduate"): JourneyPeriod {
  const p = journey.periods.find((x) => x.id === id);
  if (!p) throw new Error(`فصل غير موجود في رحلة الطالب: ${id}`);
  return p;
}

/** تبويبات السنوات (من stages.json) و"بعد التخرج"، وتحت كل تبويب فصوله */
export function getJourneyTabs(journey: StudentJourney, stages: Stage[]): JourneyTab[] {
  const tabs: JourneyTab[] = [];
  for (const p of journey.periods) {
    const key = p.year === null ? "graduate" : `year-${p.year}`;
    let tab = tabs.find((t) => t.key === key);
    if (!tab) {
      const stage = stages.find((s) => s.id === p.stageId)!;
      tab = { key, label: p.year === null ? stage.name : stage.year, periodIds: [] };
      tabs.push(tab);
    }
    tab.periodIds.push(p.id);
  }
  return tabs;
}

/** فيتشر من docs/features.md (رقم واسم) */
export type Feature = { id: string; name: string };

export type Gateway = {
  id: string;
  name: string;
  /** عنوان لوحة البوابة (بالتعريف): "بوابة الطالب" */
  panelTitle: string;
  /** اسم البوابة في قائمة تسجيل الدخول: "الطالب" */
  menuLabel: string;
  who: string;
  /** رابط زر "جرّب تجربة الطالب" (للبوابة التي لها تجربة) */
  experienceLink?: { label: string; href: string };
  /** كل الفيتشرز المربوطة بالبوابة (أرقام F..) */
  features: string[];
  /** النقاط الظاهرة في البطاقة */
  highlights: string[];
};

/** المهارات العامة (قاموس مهارات القطاع الرقمي 2025) في خمس فئات */
export type Skill = {
  id: string;
  name: string;
  /** من يقدّم المهارة: الجامعة، أو المركز، أو المقررات الاختيارية */
  delivery: "university" | "center" | "optional";
  /** فصول تقديمها في المركز (فارغة لمن تقدمه الجامعة) */
  centerSemesters: number[];
  /** الوحدة المقترحة في المركز (مبدئي) */
  centerUnit?: { title: string; draft: boolean };
  note?: string;
};

export type Skills = {
  source: string;
  classificationNote: string;
  levels: { id: number; name: string }[];
  categories: { id: string; name: string; skills: Skill[] }[];
};

export type University = {
  id: string;
  name: string;
  program: { code: string; name: string };
  /** ملاحظة الجامعة تحت تنبيه أضعف فئة ومهارة */
  skillsGapNote: string;
  outcomes: { spec: OutcomesSpec; sample: OutcomesSample };
  stages: Stage[];
  semesters: { semester: number; courses: { code: string; name: string | null }[] }[];
  /** ربط تجريبي: كود المادة (أو اسم الاختياري) إلى أرقام المهارات */
  courseSkillMap: Record<string, string[]>;
  /** وسم حالة الربط ("ربط تجريبي") */
  courseSkillMapStatus: string;
  /** مواد خارج الربط ("اختياري، غير مصنّف") */
  unclassifiedCourses: { label: string; courses: string[] };
  services: Service[];
  skills: Skills;
  naceSections: { id: string; name: string; requirement: string }[];
  gateways: Gateway[];
  features: Feature[];
  chatbot: ChatbotSpec;
  studentJourney: StudentJourney;
  studentScreens: StudentScreens;
  studentAssistant: StudentAssistant;
  certificates: Certificates;
};

type UniversityFiles = {
  info: {
    id: string;
    name: string;
    program: { code: string; name: string };
    skillsGapNote: string;
  };
  outcomesSample: OutcomesSample;
  semesters: University["semesters"];
  courseSkillMap: Record<string, string[]>;
  courseSkillMapStatus: string;
  unclassifiedCourses: University["unclassifiedCourses"];
  serviceStatus: Record<string, Record<string, string>>;
  stageSemesters: Record<string, number[]>;
  studentJourney: StudentJourney;
  studentScreens: StudentScreens;
  studentAssistant: StudentAssistant;
  certificates: Certificates;
};

// لإضافة جامعة جديدة: أنشئ مجلد data/universities/<id>/ بنفس الملفات وسجّلها هنا
const registry: Record<string, UniversityFiles> = {
  demo: {
    info: demoInfo,
    semesters: demoSemesters,
    courseSkillMap: demoCourseSkillMap.map,
    courseSkillMapStatus: demoCourseSkillMap.status,
    unclassifiedCourses: demoCourseSkillMap.unclassified,
    serviceStatus: demoServiceStatus,
    stageSemesters: demoStageSemesters,
    outcomesSample: demoOutcomesSample,
    // ملف JSON يستنتج state نصًّا عامًّا، والقيم مفحوصة في getUniversity
    studentJourney: demoStudentJourney as unknown as StudentJourney,
    studentScreens: demoStudentScreens as StudentScreens,
    studentAssistant: demoStudentAssistant as StudentAssistant,
    certificates: demoCertificates as Certificates,
  },
};

export function getUniversity(id: string): University {
  const u = registry[id];
  if (!u) throw new Error(`جامعة غير معروفة: ${id}`);

  const stages: Stage[] = sharedStages.map((s) => ({
    ...s,
    services: s.services.map((svc) => {
      const status = u.serviceStatus[String(s.id)]?.[svc.id];
      if (status !== "have" && status !== "new") {
        throw new Error(`حالة الخدمة ${svc.id} ناقصة في جامعة ${id}`);
      }
      return { ...svc, status };
    }),
    sems: u.stageSemesters[String(s.id)] ?? [],
  }));

  // تحقق من روابط رحلة الطالب: المراحل والخدمات ووحدات المركز موجودة فعلًا
  for (const p of u.studentJourney.periods) {
    const stage = stages.find((s) => s.id === p.stageId);
    if (!stage) throw new Error(`مرحلة غير موجودة في رحلة الطالب (${p.id}): ${p.stageId}`);
    for (const sid of p.services) {
      if (!stage.services.some((s) => s.id === sid)) {
        throw new Error(`خدمة ${sid} ليست في مرحلة ${p.stageId} (فصل ${p.id})`);
      }
    }
    for (const kid of p.centerUnits) {
      const sk = (skills as Skills).categories.flatMap((c) => c.skills).find((s) => s.id === kid);
      if (!sk || sk.delivery === "university") {
        throw new Error(`وحدة مركز غير صالحة في فصل ${p.id}: ${kid}`);
      }
    }
  }

  // تحقق من شاشات التطبيق: المهارات والخدمات والفصول المذكورة موجودة فعلًا
  const allSkills = (skills as Skills).categories.flatMap((c) => c.skills);
  const allServices = stages.flatMap((s) => s.services);
  const scr = u.studentScreens;
  const need = (ok: boolean, msg: string) => {
    if (!ok) throw new Error(`شاشات التطبيق: ${msg}`);
  };
  for (const r of scr.library.roles) {
    for (const k of r.skills) need(allSkills.some((s) => s.id === k), `مهارة غير موجودة: ${k}`);
  }
  for (const c of (skills as Skills).categories) {
    need(c.id in scr.nova.scores && c.id in scr.nova.scoresAfter, `قيمة Nova ناقصة للفئة ${c.id}`);
  }
  for (const st of scr.plan.steps) {
    need(u.studentJourney.periods.some((p) => p.id === st.periodId), `فصل غير موجود: ${st.periodId}`);
  }
  for (const key of ["cv", "jobs", "coop", "lifelong", "followup"] as const) {
    const sec = scr.cvjobs[key];
    need(allServices.some((s) => s.id === sec.serviceId), `خدمة غير موجودة: ${sec.serviceId}`);
  }
  need(allServices.some((s) => s.id === scr.cvjobs.cv.workshopServiceId), "خدمة الورشة غير موجودة");

  // تحقق من مساعد التطبيق: الردود المستعملة والأسئلة المقترحة وأكواد المواد موجودة فعلًا
  const asst = u.studentAssistant;
  const asstIds = new Set([...chatbot.answers.map((a) => a.id), ...asst.answers.map((a) => a.id)]);
  const courseCodes = new Set(u.semesters.flatMap((s) => s.courses.map((c) => c.code)));
  const screenIds = new Set(Object.keys(u.studentJourney.screens));
  for (const id of Object.keys(asst.reuse)) {
    need(chatbot.answers.some((a) => a.id === id), `رد غير موجود في chatbot.json: ${id}`);
  }
  for (const [key, list] of Object.entries(asst.suggested)) {
    need(key === "graduate" || u.studentJourney.periods.some((p) => String(p.id) === key), `فصل غير موجود في أسئلة المساعد: ${key}`);
    for (const id of list) {
      need(asstIds.has(id), `سؤال مقترح غير موجود: ${id}`);
      need(id in asst.reuse || asst.answers.some((a) => a.id === id), `سؤال مقترح بلا رابط شاشة: ${id}`);
    }
  }
  for (const codes of Object.values(asst.courseAliases)) {
    for (const code of codes) need(courseCodes.has(code), `مادة غير موجودة: ${code}`);
  }
  for (const s of [...Object.values(asst.reuse).flat(), ...asst.answers.flatMap((a) => a.screens ?? []), ...asst.course.screens]) {
    need(screenIds.has(s), `شاشة غير موجودة: ${s}`);
  }

  // تحقق من الشهادات المهنية: المهارات والفصول موجودة، وحالة الشاشة في كل فصل تطابق فصول الشهادات
  const cert = u.certificates;
  for (const c of cert.items) {
    need(c.delivery in cert.delivery, `نوع دعم غير معروف للشهادة ${c.id}: ${c.delivery}`);
    for (const k of c.skills) need(allSkills.some((s) => s.id === k), `مهارة غير موجودة في الشهادة ${c.id}: ${k}`);
    for (const p of c.periods) need(u.studentJourney.periods.some((x) => x.id === p), `فصل غير موجود في الشهادة ${c.id}: ${p}`);
  }
  for (const p of u.studentJourney.periods) {
    const shown = cert.items.some((c) => typeof p.id === "number" && c.periods.includes(p.id));
    need((p.screens.certs.state === "open") === shown, `حالة شاشة الشهادات المهنية لا تطابق فصول الشهادات (فصل ${p.id})`);
  }

  return {
    id: u.info.id,
    name: u.info.name,
    program: u.info.program,
    skillsGapNote: u.info.skillsGapNote,
    outcomes: { spec: outcomesSpec, sample: u.outcomesSample },
    stages,
    semesters: u.semesters,
    courseSkillMap: u.courseSkillMap,
    courseSkillMapStatus: u.courseSkillMapStatus,
    unclassifiedCourses: u.unclassifiedCourses,
    services: sharedServices.map((svc) => {
      if (svc.targets.length !== 2) {
        throw new Error(`الخدمة ${svc.id} يجب أن تحمل نقطتين مستهدفتين`);
      }
      return { ...svc, priority: svc.priority as Service["priority"] };
    }),
    // ملف JSON يستنتج delivery نصًّا عامًّا، والقيم الثلاث مفحوصة في التحقق
    skills: skills as Skills,
    naceSections,
    gateways,
    features,
    chatbot,
    studentJourney: u.studentJourney,
    studentScreens: u.studentScreens,
    studentAssistant: u.studentAssistant,
    certificates: u.certificates,
  };
}
