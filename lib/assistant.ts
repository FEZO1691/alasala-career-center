// مساعد التطبيق: أسئلة مقترحة بحسب الفصل، وردود جاهزة تُبنى من بيانات الموقع (الخدمات والمهارات والرحلة والمواد)
import type { AssistantAnswerDef, Certificates, ChatbotSpec, JourneyScreenId, StudentAssistant, StudentScreens, University } from "@/lib/data";
import { centerUnitStatus, semestersText } from "@/lib/skills";

export type PeriodKey = number | "graduate";

export type AssistantReply = { text: string; draft: boolean; screens: JourneyScreenId[] };

// توحيد الحروف لمطابقة الكلمات: بلا تشكيل، وهمزات الألف والياء والتاء المربوطة
export const normalizeArabic = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

const stripAl = (t: string) => t.replace(/^ال/, "");

type Ctx = {
  chatbot: ChatbotSpec;
  assistant: StudentAssistant;
  screens: StudentScreens;
  certificates: Certificates;
  skills: University["skills"];
  semesters: University["semesters"];
  courseSkillMap: University["courseSkillMap"];
};

export function createAssistant(ctx: Ctx) {
  const { chatbot, assistant, screens, certificates, skills, semesters, courseSkillMap } = ctx;
  const allSkills = skills.categories.flatMap((c) => c.skills);
  const skillName = new Map(allSkills.map((s) => [s.id, s.name]));
  const semOf = (p: PeriodKey) => (p === "graduate" ? 8 : p);

  const courses = semesters.flatMap((s) =>
    s.courses.filter((c) => c.name).map((c) => ({ code: c.code, name: c.name as string, semester: s.semester }))
  );
  const byCode = new Map(courses.map((c) => [c.code, c]));

  // كلمات أسماء المواد النادرة (في مادتين أو أقل) تدل على مادة بعينها
  const tokensOf = (name: string) =>
    normalizeArabic(name)
      .split(" ")
      .map(stripAl)
      .filter((t) => t.length >= 4);
  const freq = new Map<string, number>();
  courses.forEach((c) => new Set(tokensOf(c.name)).forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)));

  const courseReply = (codes: string[]): AssistantReply | null => {
    const list = codes
      .map((c) => byCode.get(c))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .sort((a, b) => a.semester - b.semester);
    const lines = list
      .map((c) => {
        const names = (courseSkillMap[c.code] ?? []).map((id) => skillName.get(id)).filter(Boolean) as string[];
        if (!names.length) return null;
        return assistant.course.line
          .replace("{name}", c.name)
          .replace("{code}", c.code)
          .replace("{semester}", String(c.semester))
          .replace("{skills}", names.join("، "));
      })
      .filter(Boolean) as string[];
    if (!lines.length) return null;
    return {
      text: [assistant.course.intro, ...lines, assistant.course.outro].join("\n"),
      draft: true,
      screens: assistant.course.screens,
    };
  };

  // أكواد المواد التي يذكرها السؤال صراحةً (كود أو اسم معروف)، أو كلمات اسمها النادرة
  const explicitCourses = (input: string) => {
    const n = normalizeArabic(input);
    const compact = n.replace(/\s/g, "");
    const codes = new Set<string>();
    for (const [alias, list] of Object.entries(assistant.courseAliases)) {
      if (n.includes(normalizeArabic(alias))) list.forEach((c) => codes.add(c));
    }
    for (const c of courses) if (compact.includes(c.code.toLowerCase().replace(/\s/g, ""))) codes.add(c.code);
    return [...codes];
  };
  const tokenCourses = (input: string) => {
    const tokens = new Set(
      normalizeArabic(input)
        .split(" ")
        .map(stripAl)
        .filter((t) => t.length >= 4)
    );
    return courses.filter((c) => tokensOf(c.name).some((t) => tokens.has(t) && (freq.get(t) ?? 9) <= 2)).map((c) => c.code);
  };

  const planSteps = screens.plan.steps;
  const centerOrder = [...allSkills.filter((s) => s.delivery === "center"), ...allSkills.filter((s) => s.delivery === "optional")];

  const build = (def: AssistantAnswerDef, period: PeriodKey): AssistantReply | null => {
    const draft = def.draft;
    const links = def.screens ?? [];
    switch (def.kind) {
      case "text":
        return { text: def.text ?? "", draft, screens: links };
      case "course":
        return courseReply(explicitCourses(def.courseQuery ?? ""));
      case "center-skills": {
        const sem = semOf(period);
        const lines = centerOrder.map((s) => {
          const status = centerUnitStatus(s, sem).label;
          const unit = s.centerUnit ? `${s.centerUnit.title} ` : "";
          return `• ${s.name}: ${unit}(${semestersText(s.centerSemesters)})، ${status}`;
        });
        return { text: [def.intro ?? "", ...lines].join("\n"), draft, screens: links };
      }
      case "plan":
        return {
          text: [
            `${def.intro ?? ""} ${planSteps.map((s) => s.title).join("، ")}.`,
            (def.outro ?? "").replace("{opensAt}", String(planSteps[0].opensAt)),
          ].join("\n"),
          draft,
          screens: links,
        };
      case "roles":
        return {
          text: [def.intro ?? "", ...screens.library.roles.map((r) => `• ${r.title}`), def.outro ?? ""].join("\n"),
          draft,
          screens: links,
        };
      case "certs": {
        const lines = certificates.items.map(
          (c) => `• ${c.name} (${c.issuer}): ${certificates.delivery[c.delivery].line}`
        );
        const notes = [...new Set(certificates.items.map((c) => c.note))];
        return { text: [certificates.assistant.intro, ...lines, ...notes].join("\n"), draft: draft || certificates.draft, screens: links };
      }
      case "path":
        return {
          text: (def.intro ?? "").replace("{roles}", screens.library.roles.map((r) => r.title).join("، ")),
          draft,
          screens: links,
        };
    }
  };

  const questionOf = (id: string) =>
    assistant.answers.find((a) => a.id === id)?.question ?? chatbot.answers.find((a) => a.id === id)?.question ?? id;

  const replyById = (id: string, period: PeriodKey): AssistantReply | null => {
    const own = assistant.answers.find((a) => a.id === id);
    if (own) return build(own, period);
    const shared = chatbot.answers.find((a) => a.id === id);
    if (shared && assistant.reuse[id]) return { text: assistant.textOverrides?.[id] ?? shared.text, draft: false, screens: assistant.reuse[id] };
    return null;
  };

  // مجموعة الردود التي تُطابَق بالكلمات المفتاحية: ردود التطبيق أولًا ثم المعاد استخدامها من chatbot.json
  const pool = [
    ...assistant.answers.filter((a) => a.kind !== "course").map((a) => ({ id: a.id, keywords: a.keywords })),
    ...chatbot.answers.filter((a) => assistant.reuse[a.id]).map((a) => ({ id: a.id, keywords: a.keywords })),
  ];

  const answerText = (input: string, period: PeriodKey): AssistantReply | null => {
    const n = normalizeArabic(input);
    // 1) مادة مذكورة صراحةً
    const explicit = explicitCourses(input);
    if (explicit.length) {
      const r = courseReply(explicit);
      if (r) return r;
    }
    // 2) أفضل رد بالكلمات المفتاحية
    let best: string | null = null;
    let bestScore = 0;
    for (const p of pool) {
      const score = p.keywords.filter((k) => n.includes(normalizeArabic(k))).length;
      if (score > bestScore) {
        best = p.id;
        bestScore = score;
      }
    }
    if (best) return replyById(best, period);
    // 3) مادة بكلمة نادرة من اسمها
    const byName = tokenCourses(input);
    return byName.length ? courseReply(byName) : null;
  };

  return {
    suggestions: (period: PeriodKey) =>
      (assistant.suggested[String(period)] ?? []).map((id) => ({ id, question: questionOf(id) })),
    replyById,
    answerText,
    fallback: chatbot.fallback,
  };
}

export type Assistant = ReturnType<typeof createAssistant>;
