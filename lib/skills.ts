// منطق حساب تغطية المهارات وحالات وحدات المركز: يستخدمه قسم "ملف المهارات" وقسم "جرّب تجربة الطالب"
import type { Skill, University } from "@/lib/data";

export type SkillStat = { done: number; total: number; pct: number };

// صياغة العدد مع "مهارة" و"وحدة اختيارية" بحسب قواعد العدد
export const skillsText = (n: number, genitive = false) =>
  n === 1
    ? "مهارة واحدة"
    : n === 2
      ? genitive
        ? "مهارتين"
        : "مهارتان"
      : n <= 10
        ? `${n} مهارات`
        : `${n} مهارة`;

export const unitsText = (n: number) =>
  n === 1
    ? "وحدة اختيارية واحدة"
    : n === 2
      ? "وحدتان اختياريتان"
      : n <= 10
        ? `${n} وحدات اختيارية`
        : `${n} وحدة اختيارية`;

// "الفصل 4" أو "الفصلان 1 و7" أو "الفصول 1 و4 و7"
export const semestersText = (list: number[]) => {
  const s = [...list].sort((a, b) => a - b);
  return s.length === 1 ? `الفصل ${s[0]}` : `${s.length === 2 ? "الفصلان" : "الفصول"} ${s.join(" و")}`;
};

/** فهرس المهارات: اسم كل مادة، والمواد المربوطة بكل مهارة مرتبة بالفصول */
export function buildSkillIndex(
  semesters: University["semesters"],
  courseSkillMap: University["courseSkillMap"],
  skills: University["skills"]
) {
  const courseName = new Map<string, string | null>();
  const allSkills = skills.categories.flatMap((c) => c.skills);
  const bySkill = new Map<string, { code: string; semester: number }[]>();
  allSkills.forEach((s) => bySkill.set(s.id, []));
  semesters.forEach((s) =>
    s.courses.forEach((c) => {
      courseName.set(c.code, c.name);
      (courseSkillMap[c.code] ?? []).forEach((id) =>
        bySkill.get(id)?.push({ code: c.code, semester: s.semester })
      );
    })
  );
  return { courseName, bySkill, allSkills };
}

export type SkillIndex = ReturnType<typeof buildSkillIndex>;

/**
 * تغطية كل مهارة وكل فئة حتى الفصل n (تراكمي). تُحسب الفئات والتنبيه من مهارات الجامعة فقط
 * (delivery = university). تغطية الفئة = متوسط تغطية مهارات الجامعة فيها.
 */
export function skillStatsAt(index: SkillIndex, skills: University["skills"], n: number) {
  const { bySkill, allSkills } = index;
  const skillStats = new Map<string, SkillStat>();
  allSkills.forEach((s) => {
    const list = bySkill.get(s.id) ?? [];
    const done = list.filter((x) => x.semester <= n).length;
    skillStats.set(s.id, {
      done,
      total: list.length,
      pct: list.length ? Math.round((100 * done) / list.length) : 0,
    });
  });
  const cats = skills.categories.map((c) => {
    const uni = c.skills.filter((s) => s.delivery === "university");
    const pct = uni.length
      ? Math.round(uni.reduce((a, s) => a + skillStats.get(s.id)!.pct, 0) / uni.length)
      : null;
    return { ...c, pct, uniCount: uni.length };
  });
  const withBar = cats.filter((c) => c.pct !== null);
  const weakestCat = withBar.reduce((w, c) => ((c.pct as number) < (w.pct as number) ? c : w), withBar[0]);
  const uniRated = allSkills
    .filter((s) => s.delivery === "university")
    .map((s) => ({ ...s, ...skillStats.get(s.id)! }));
  const minSkill = Math.min(...uniRated.map((s) => s.pct));
  return {
    skillStats,
    cats,
    weakestCat,
    minSkill,
    weakestSkills: uniRated.filter((s) => s.pct === minSkill),
    notYet: uniRated.filter((s) => s.done === 0 && s.total > 0),
    complete: withBar.every((c) => c.pct === 100),
  };
}

/**
 * حالة وحدة المركز بحسب الفصل المختار: قُدّمت إن كان أول فصل <= الفصل، وتُعزَّز في أقرب فصل لاحق
 * إن وُجد، وإلا قادمة.
 */
export function centerUnitStatus(skill: Skill, sem: number) {
  const first = skill.centerSemesters.length ? Math.min(...skill.centerSemesters) : Infinity;
  const upcoming = skill.centerSemesters.filter((x) => x > sem);
  const started = first <= sem;
  const label = !started
    ? "قادمة"
    : upcoming.length
      ? `قُدّمت وتُعزَّز في الفصل ${Math.min(...upcoming)}`
      : "قُدّمت";
  return { started, label };
}

/** دور الوحدة في الفصل نفسه: intro أول مرة، reinforce تعزيز، أو null إن لم تُقدَّم فيه */
export function centerUnitRoleAt(skill: Skill, sem: number): "intro" | "reinforce" | null {
  if (!skill.centerSemesters.includes(sem)) return null;
  return sem === Math.min(...skill.centerSemesters) ? "intro" : "reinforce";
}

/** سطر المواد المربوطة بمهارة في الخطة */
export function planLine(codes: string[]) {
  return codes.length === 0
    ? "لا مقرر في الخطة يغطيها"
    : codes.length === 1
      ? `في الخطة: مادة واحدة تمسّها (${codes[0]})`
      : codes.length === 2
        ? "في الخطة: مادتان تمسّانها"
        : codes.length <= 10
          ? `في الخطة: ${codes.length} مواد تمسّها`
          : `في الخطة: ${codes.length} مادة تمسّها`;
}
