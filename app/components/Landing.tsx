"use client";

import type { Gateway, Service } from "@/lib/data";
import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import { STORIES, STORY_NOTE } from "@/lib/stories";
import { ALL_STUDENTS, COHORT, alumniStats, destCounts, summary, usePortal } from "@/lib/portal-store";

const AUD: Record<string, { href: string; src: string; img: string; cta: string }> = {
  student: { href: "#student", src: "gw-student", img: "طالب يعمل على حاسوبه في بيئة مهنية", cta: "ادخل كطالب" },
  alumni: { href: "#alumni", src: "gw-alumni", img: "خريجون في لقاء مهني", cta: "ادخل كخريج" },
  employer: { href: "#employers", src: "gw-employer", img: "فريق استقطاب في اجتماع", cta: "ادخل كصاحب عمل" },
  mentor: { href: "#center", src: "gw-mentor", img: "مرشد مهني مع طالبة", cta: "ادخل كمرشد" },
};

function Head({ id, kicker, title, text }: { id?: string; kicker: string; title: string; text?: string }) {
  return (
    <div id={id} className="mx-auto max-w-2xl scroll-mt-28 text-center">
      <p className="text-sm font-bold text-orange-text">{kicker}</p>
      <h2 className="mt-1 text-2xl font-extrabold text-navy md:text-4xl md:leading-snug">{title}</h2>
      {text && <p className="mt-3 leading-8 text-ink-2">{text}</p>}
    </div>
  );
}

/* صور متحركة: تتبدل كل 5 ثوانٍ مع نقاط. تتوقف عند المرور بالماوس أو التركيز، ولا تتحرك لمن يفضّل تقليل الحركة. ضع الصور في src. */
const HERO_SLIDES: { label: string; src?: string; pos?: string }[] = [
  { label: "طلاب في جلسة إرشاد مهني", src: "./images/hero-1.jpg", pos: "center 35%" },
  { label: "لقاء خريجين في مقر المركز", src: "./images/hero-2.jpg", pos: "35% center" },
  { label: "فريق استقطاب يقابل مرشحين", src: "./images/hero-3.jpg", pos: "50% center" },
  { label: "معرض التوظيف السنوي", src: "./images/hero-4.jpg", pos: "center center" },
];

function HeroSlides() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  useEffect(() => {
    if (paused || still) return;
    const t = setInterval(() => setI((n) => (n + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused, still]);
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} role="group" aria-roledescription="معرض صور" aria-label="صور المركز">
      <div className="relative overflow-hidden rounded-[22px] shadow-2xl ring-1 ring-white/20" style={{ aspectRatio: "4 / 4.2" }} aria-live={paused ? "polite" : "off"}>
        {HERO_SLIDES.map((sl, k) => (
          <div key={k} aria-hidden={k !== i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: k === i ? 1 : 0 }}>
            <ImageSlot label={sl.label} src={sl.src} pos={sl.pos} ratio="auto" tone="dark" className="h-full" />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {HERO_SLIDES.map((sl, k) => (
          <button key={k} type="button" aria-label={`عرض ${sl.label}`} aria-current={k === i} onClick={() => setI(k)} className="h-2.5 rounded-full transition-all" style={{ width: k === i ? 28 : 10, background: k === i ? "#cdb774" : "rgba(255,255,255,.45)" }} />
        ))}
      </div>
    </div>
  );
}

export function LandingHero() {
  const st = usePortal();
  const sum = summary(st);
  const chips = [
    ["طالب", "#student"],
    ["خريج", "#alumni"],
    ["صاحب عمل", "#employers"],
    ["الجامعة", "#university"],
  ];
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-[#eef6e8] text-navy">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-32 md:pt-20">
        <div>
          <p className="inline-block rounded-full border border-[#7bbb58] px-3 py-1 text-xs font-bold text-ink-2">مركز المسار المهني · كلية الحقوق، كليات الأصالة</p>
          <h1 id="hero-title" className="mt-4 text-3xl font-extrabold leading-snug sm:text-4xl md:text-5xl md:leading-[1.35]">
            من أول سنة إلى أول وظيفة، مركز مهني يرافقك في كل خطوة
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-ink-2 sm:text-lg">
            إرشاد فردي، ومشاريع، ووظائف، وتحديات من شركات، وقياس لنتائج الخريجين.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#gateways" className="rounded-[12px] bg-white px-7 py-3 text-center font-bold text-navy transition-colors hover:bg-bg-soft">
              ادخل بوابتك
            </a>
            <a href="#journey" className="rounded-[12px] border border-[#7bbb58] px-7 py-3 text-center font-bold text-navy transition-colors hover:bg-white">
              اعرف رحلة السنوات الأربع
            </a>
          </div>
          <ul className="mt-7 flex flex-wrap items-center gap-2 text-sm">
            <li className="text-ink-2">أنا:</li>
            {chips.map(([l, h]) => (
              <li key={l}>
                <a href={h} className="rounded-full bg-white ring-1 ring-[#7bbb58]/30 px-4 py-1.5 font-semibold text-navy transition-colors hover:bg-white">{l}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <HeroSlides />
        </div>
      </div>
    </section>
  );
}

export function LandingNumbers() {
  const st = usePortal();
  const sum = summary(st);
  const al = alumniStats(st);
  const c = destCounts(st);
  const known = ["emp", "mil", "edu", "seekJob", "seekEdu", "not"].reduce((a, k) => a + (c as Record<string, number>)[k], 0);
  const knownAll = Math.round((100 * (known + al.known)) / (COHORT + al.total));
  const partners = st.companies.filter((x) => x.status === "approved").length;
  const sessions = 1280 + st.bookings.filter((b) => b.status === "done").length;
  const items = [
    [String(ALL_STUDENTS.length), "طالب في المنظومة"],
    [String(al.total), "خريج مسجّل"],
    [String(partners), "شركة شريكة معتمدة"],
    [String(145 + sum.jobsPublished), "فرصة وظيفة ومشروع"],
    [sessions.toLocaleString("en"), "جلسة إرشاد منفذة"],
    [`${knownAll}%`, "خريجون معروفة وجهتهم"],
    ["4.6 / 5", "رضا أصحاب العمل"],
    [String(20 + st.events.length), "فعالية وورشة هذا العام"],
  ];
  return (
    <section id="numbers" aria-label="المركز بالأرقام" className="relative z-[1] -mt-12 px-4 sm:px-6">
      <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-y-7 rounded-[18px] bg-white px-4 py-8 shadow-xl ring-1 ring-line/20 md:grid-cols-4">
        {items.map(([v, l], i) => (
          <div key={l} className={`text-center md:px-4 ${i % 4 ? "md:border-s md:border-line/30" : ""}`}>
            <dd className="text-3xl font-extrabold text-navy md:text-4xl" dir="ltr">{v}</dd>
            <dt className="mt-1 text-sm font-semibold text-ink-2">{l}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-center text-xs text-ink-2">أرقام تجريبية، ويتغيّر منها ما يجري في البوابات.</p>
    </section>
  );
}

export function Audiences({ gateways }: { gateways: Gateway[] }) {
  return (
    <section aria-labelledby="gw-title" className="bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head id="gateways" kicker="البوابات" title="لكل فئة بوابتها" text="ادخل من بوابتك، وكل ما تفعله يصل إلى الباقين تلقائيًا." />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gateways.map((g) => {
            const a = AUD[g.id] ?? AUD.student;
            return (
              <li key={g.id} className="group overflow-hidden rounded-[16px] border border-line/30 bg-white shadow-sm transition-shadow hover:shadow-lg">
                <ImageSlot label={a.img} src={`./images/${a.src}.jpg`} ratio="4 / 3" />
                <div className="p-5">
                  <h3 id={g.id === "student" ? "gw-title" : undefined} className="text-lg font-extrabold text-navy">{g.panelTitle}</h3>
                  <p className="mt-2 min-h-[3.5rem] text-sm leading-7 text-ink-2">{g.who}</p>
                  <a href={a.href} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-orange-text group-hover:text-navy">
                    {a.cta}
                    <span aria-hidden="true">←</span>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function ServiceCards({ services }: { services: Service[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? services : services.slice(0, 4);
  return (
    <section id="services" aria-labelledby="services-title" className="scroll-mt-20 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head kicker="الخدمات" title="ثماني خدمات في مكان واحد" text="ثماني خدمات يتطلبها معيار NACE. افتح أي خدمة لترى هدفها." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((s, i) => (
            <li key={s.id} className="rounded-[16px] bg-white p-5 shadow-sm ring-1 ring-line/20">
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-sm font-extrabold text-white">{i + 1}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.priority === "must" ? "bg-blue text-white" : "border border-blue text-orange-text"}`}>{s.priority === "must" ? "أساسي" : "يُفضّل"}</span>
              </div>
              <h3 id={i === 0 ? "services-title" : undefined} className="mt-3 text-base font-extrabold leading-snug text-navy">{s.name}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-2">{s.description}</p>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-bold text-orange-text">ما نستهدفه</summary>
                <ul className="mt-2 space-y-1.5">
                  {s.targets.map((t) => (
                    <li key={t} className="flex items-start gap-2 leading-7 text-ink">
                      <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {t}
                    </li>
                  ))}
                </ul>
                {s.tharwati && <p className="mt-2 rounded-[10px] bg-[#f0f6ea] p-3 text-xs leading-6 text-ink">{s.tharwati}</p>}
              </details>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center">
          <button type="button" onClick={() => setAll(!all)} aria-expanded={all} className="rounded-[12px] border border-navy px-6 py-2.5 text-sm font-bold text-navy hover:bg-white">
            {all ? "عرض أقل" : `عرض الخدمات الثماني (${services.length})`}
          </button>
        </div>
      </div>
    </section>
  );
}

const EV_IMG: Record<string, string> = { "معرض": "ev-fair", "ورشة": "ev-workshop", "لقاء": "ev-alumni", "ساعات مفتوحة": "ev-open" };

export function Events() {
  const events = usePortal().events;
  return (
    <section id="events" aria-labelledby="ev-title" className="scroll-mt-20 border-t border-line/30 bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head kicker="الفعاليات" title="ما يحدث في المركز" text="معارض وورش ولقاءات خريجين وساعات إرشاد مفتوحة." />
        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {events.map((e, i) => (
            <li key={e.id} className="flex overflow-hidden rounded-[16px] border border-line/30 bg-white shadow-sm">
              <div className="hidden w-40 shrink-0 sm:block">
                <ImageSlot label={e.title} src={`./images/${EV_IMG[e.type] ?? "ev-fair"}.jpg`} pos={e.type === "ورشة" ? "70% center" : "center 30%"} ratio="1 / 1.2" className="h-full" />
              </div>
              <div className="min-w-0 p-5">
                <span className="rounded-full bg-[#e3f0d9] px-2.5 py-0.5 text-[11px] font-bold text-[#3a6e22]">{e.type}</span>
                <h3 id={i === 0 ? "ev-title" : undefined} className="mt-2 text-base font-extrabold text-navy">{e.title}</h3>
                <p className="text-xs font-semibold text-orange-text">{e.date} · {e.place}</p>
                <p className="mt-2 text-sm leading-7 text-ink-2">{e.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-ink-2">مواعيد تجريبية. يديرها فريق المركز من بوابته.</p>
      </div>
    </section>
  );
}

export function Stories() {
  return (
    <section id="stories" aria-labelledby="st-title" className="scroll-mt-20 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head kicker="قصص النجاح" title="خريجون وطلاب وشركاء يحكون تجربتهم" text="ثلاث قصص بالفيديو: خريج وُظّف بعد مشاريعه، وطالبة غيّرت مسارها، وصاحب عمل يحكي كيف يختار." />
        <ul id="st-title" className="mt-10 grid gap-5 md:grid-cols-3">
          {STORIES.map((s) => (
            <li key={s.id} className="group overflow-hidden rounded-[16px] bg-white shadow-sm ring-1 ring-line/20 transition hover:-translate-y-1 hover:shadow-lg">
              <a href={`#story-${s.id}`} className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-blue">
                <div className="relative">
                  <ImageSlot label={s.name} src={`./images/story-${s.id}.jpg`} pos={s.id === "2" ? "85% 30%" : "center 30%"} ratio="4 / 3" />
                  <span className="absolute start-3 top-3 rounded-full bg-blue px-3 py-1 text-[11px] font-bold text-white">{s.kind}</span>
                  <span aria-hidden="true" className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-navy shadow-lg transition group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-extrabold text-navy">{s.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-orange-text">{s.name}</p>
                  <p className="mt-3 flex-1 text-sm leading-7 text-ink-2">«{s.quote}»</p>
                  <span className="mt-4 text-sm font-bold text-orange-text">شاهد القصة كاملة &larr;</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-ink-2">{STORY_NOTE}</p>
      </div>
    </section>
  );
}

/* شعارات تجريبية: رمز يعبّر عن قطاع الشركة بلون مميز، وتُستبدل بشعار الشريك الحقيقي بتمرير src */
const LOGO_COLORS: [string, string][] = [["#3a6e22", "#5e9a3e"], ["#7b003a", "#a3335f"], ["#4a4a4a", "#6b6b6b"], ["#3a6e22", "#3f7a24"], ["#7b003a", "#a3335f"], ["#8a6d2a", "#b79c55"]];
const ICONS: [RegExp, string][] = [
  [/مصرف|مالي|مالية/, "M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"],
  [/طاقة/, "M13 2L4 14h6l-1 8 9-12h-6z"],
  [/اتصالات/, "M12 19.5h.01M8.5 15.5a5 5 0 0 1 7 0M5.5 12.5a9 9 0 0 1 13 0M2.5 9.5a13 13 0 0 1 19 0"],
  [/تقنية/, "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"],
  [/بيانات/, "M4 20V11M10 20V4M16 20v-7M22 20H2"],
  [/لوجست/, "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"],
  [/صح/, "M12 5v14M5 12h14M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0"],
  [/أمن/, "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM9 12l2 2 4-4"],
  [/نقل/, "M4 16V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10M4 11h16M7 20v-4M17 20v-4"],
  [/محاسب|مراجع/, "M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"],
  [/تجزئة/, "M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0"],
  [/إنشاء|بناء/, "M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M12 5V2"],
  [/إعلام|تسويق/, "M3 11v3a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1zM18 9a4 4 0 0 1 0 6"],
  [/تعليم|تدريب/, "M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.500 6-3v-4.500"],
  [/سحاب/, "M7 18a4 4 0 0 1-.5-8A5.500 5.500 0 0 1 17 8.500a4.500 4.500 0 0 1 .5 9.500z"],
  [/استشار|مهني/, "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12h.01"],
];
const DEFAULT_ICON = "M4 21V5l8-2v18M12 9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2";

function Logo({ name, sector, i, src }: { name: string; sector: string; i: number; src?: string }) {
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className="h-14 w-auto" />;
  const [c1, c2] = LOGO_COLORS[i % LOGO_COLORS.length];
  const d = ICONS.find(([re]) => re.test(sector))?.[1] ?? DEFAULT_ICON;
  return (
    <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] shadow-md" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
    </span>
  );
}

export function Partners() {
  const st = usePortal();
  const list = st.companies.filter((c) => c.status === "approved");
  const sectors = new Set(list.map((c) => c.sector)).size;
  return (
    <section id="partners" aria-labelledby="pt-title" className="scroll-mt-20 border-t border-line/30 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">الشراكات</p>
          <h2 id="pt-title" className="mt-1 text-2xl font-extrabold text-navy md:text-4xl md:leading-snug">شركاء يوظفون ويدرّبون طلابنا</h2>
          <p className="mt-3 leading-8 text-ink-2">تنشر هذه الشركات وظائفها ومشاريعها وتحدياتها، ويراها الطلاب والخريجون في بواباتهم.</p>
          <div className="mt-5 flex justify-center gap-3 text-sm">
            <span className="flex gap-1.5 rounded-full bg-blue px-4 py-1.5 font-bold text-white"><span>{list.length}</span><span>شركة شريكة</span></span>
            <span className="flex gap-1.5 rounded-full bg-[#e3f0d9] px-4 py-1.5 font-bold text-[#3a6e22]"><span>{sectors}</span><span>قطاعًا</span></span>
          </div>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((c, i) => (
            <li key={c.id} className="flex items-center gap-4 rounded-[16px] border border-line/30 bg-bg p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
              <Logo name={c.name} sector={c.sector} i={i} />
              <span className="min-w-0">
                <span className="block text-base font-extrabold leading-snug text-navy">{c.name}</span>
                <span className="mt-0.5 block text-xs font-semibold text-ink-2">{c.sector}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-[#eef6e8] text-navy">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div>
          <h2 id="cta-title" className="text-2xl font-extrabold leading-snug md:text-4xl md:leading-snug">ابدأ رحلتك المهنية اليوم</h2>
          <p className="mt-3 max-w-xl leading-8 text-ink-2">ادخل بوابتك، واحجز جلسة مع مرشد، وتابع وجهتك من السنة الأولى حتى أول وظيفة.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="#student" className="rounded-[12px] bg-blue px-7 py-3 text-center font-bold text-white hover:bg-blue-bright">ادخل كطالب</a>
            <a href="#employers" className="rounded-[12px] border border-[#7bbb58] px-7 py-3 text-center font-bold text-navy hover:bg-white">ادخل كصاحب عمل</a>
          </div>
        </div>
        <div className="overflow-hidden rounded-[20px] ring-1 ring-line/30">
          <ImageSlot label="فريق المركز في ورشة عمل" src="./images/closing.jpg" ratio="16 / 10" tone="dark" />
        </div>
      </div>
    </section>
  );
}


export function HowItWorks() {
  const steps: [string, string, string][] = [
    ["1", "ادخل بوابتك", "طالب أو خريج أو صاحب عمل أو مرشد أو جامعة. لكل فئة بوابتها."],
    ["2", "افعل ما يخصك", "احجز جلسة، قدّم لوظيفة، انشر فرصة، أو سجّل ملاحظات جلسة."],
    ["3", "يصل للباقين تلقائيًا", "طلبك يظهر لدى الشركة، وجلستك لدى المرشد، وكل ذلك في بوابة الجامعة."],
    ["4", "تظهر النتائج", "تتحدث الأرقام وتقارير NACE فورًا، ويرى الجميع أثر ما فعلوه."],
  ];
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-20 border-t border-line/30 bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Head kicker="كيف يعمل" title="أربع خطوات من الدخول إلى النتائج" />
        <ol id="how-title" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([n, t, d]) => (
            <li key={n} className="rounded-[16px] border border-line/30 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue text-lg font-extrabold text-white">{n}</span>
              <h3 className="mt-3 text-base font-extrabold text-navy">{t}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Faq() {
  const q: [string, string][] = [
    ["من يستطيع استخدام المركز؟", "طلاب الجامعة من السنة الأولى، والخريجون لمدة خمس سنوات بعد التخرج، وأصحاب العمل المعتمدون."],
    ["هل الخدمات مجانية؟", "نعم، خدمات المركز مجانية لطلاب الجامعة وخريجيها."],
    ["كيف أقابل مرشدًا؟", "من «الإرشاد» في بوابتك تختار موعدًا وموضوعًا، ثم لقاءً حضوريًا أو مكالمة فيديو."],
    ["متى أبدأ التقديم على الوظائف والمشاريع؟", "في السنة الرابعة: المشاريع في الفصل الثامن والوظائف. وتجهّز قبلها بالسيرة والمقابلات التدريبية."],
    ["كيف أحصل على شهادة مهنية؟", "في السنة الرابعة تجد «الشهادات المهنية» في بوابتك: تقرأ عن كل شهادة، وتضيف ما يناسبك لخطتك، ويتابعك مرشدك حتى الاختبار."],
    ["هل تُعرض بياناتي لأصحاب العمل؟", "فقط إن أبقيت ظهور ملفك مفتوحًا، وتستطيع إخفاءه في أي وقت."],
  ];
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 border-t border-line/30 bg-bg-soft">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <Head kicker="أسئلة شائعة" title="قبل أن تبدأ" />
        <div id="faq-title" className="mt-8 space-y-3">
          {q.map(([a, b]) => (
            <details key={a} className="rounded-[14px] bg-white p-4 shadow-sm ring-1 ring-line/20">
              <summary className="cursor-pointer text-base font-bold text-navy">{a}</summary>
              <p className="mt-2 text-sm leading-7 text-ink-2">{b}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

