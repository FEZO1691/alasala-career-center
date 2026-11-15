// تمرير سلس لقسم في الصفحة (يحترم إعداد تقليل الحركة) ويحدّث الرابط
export function scrollToSection(id: string) {
  // أقسام البوابات صارت صفحات مستقلة
  if (["experience", "employers", "mis", "results"].includes(id)) {
    const to = id === "experience" ? "student" : id === "employers" ? "employers" : "university";
    window.location.hash = `#${to}`;
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // نحسب الموضع بأنفسنا: أعلى القسم تحت الشريط العلوي مباشرة، ولا يتأثر بتغيّر الارتفاع أثناء التمرير
  const head = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  const top = el.getBoundingClientRect().top + window.scrollY - head;
  window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  history.replaceState(null, "", `#${id}`);
}
