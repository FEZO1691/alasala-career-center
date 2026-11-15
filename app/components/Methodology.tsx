"use client";

import { useEffect, useState } from "react";
import data from "@/data/universities/demo/methodology.json";
import skillsData from "@/data/shared/skills.json";
import { methodSection, usePage } from "@/lib/route";

type Uni = { name: string; platform: string; practice: string };
const STATE: Record<string, { label: string; cls: string }> = {
  done: { label: "مطبّق في الموقع", cls: "bg-[#e3f0d9] text-[#3a6e22]" },
  part: { label: "جزئي", cls: "bg-[#f7f0da] text-[#7a6420]" },
  next: { label: "مقترح لاحقًا", cls: "bg-[#f3ecdc] text-[#35507a]" },
};

function Head({ kicker, title, text, light }: { kicker: string; title: string; text?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={`text-sm font-bold ${"text-orange-text"}`}>{kicker}</p>
      <h2 className={`mt-1 text-2xl font-extrabold md:text-3xl ${"text-navy"}`}>{title}</h2>
      {text && <p className={`mt-3 leading-8 ${"text-ink-2"}`}>{text}</p>}
    </div>
  );
}

/* شريط تعريف في الرئيسية */
export function MethodStrip() {
  return (
    <section id="method" aria-labelledby="ms-title" className="scroll-mt-20 bg-[#eef6e8] text-navy">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-sm font-bold text-orange-text">المنهجية</p>
          <h2 id="ms-title" className="mt-1 text-2xl font-extrabold leading-snug md:text-3xl">بُني المركز على ما يفعله الأفضل في العالم</h2>
          <p className="mt-3 leading-8 text-ink-2">درسنا 35 جامعة في ست مناطق، وأخذنا ما تكرر عند الأفضل، وقارنّاه بمعايير NACE.</p>
          <a href="#methodology" className="mt-5 inline-block rounded-full bg-blue px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-bright">اعرف كيف عملنا</a>
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {data.numbers.map(([n, l]) => (
            <li key={l} className="rounded-[14px] bg-white ring-1 ring-[#7bbb58]/30 p-4">
              <span className="block text-3xl font-extrabold text-orange-text">{n}</span>
              <span className="mt-1 block text-xs leading-5 text-ink-2">{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const SCENES = [
  ["how", "السؤال"],
  ["universities", "الجامعات"],
  ["practices", "ماذا وجدنا"],
  ["standards", "كيف قسنا"],
] as const;

const RCOL = ["#3a6e22", "#3f7a24", "#3a6e22", "#7a6420", "#7b003a", "#b10035"];
const ICON_PATHS = [
  "M4 20V9l8-5 8 5v11M9 20v-6h6v6",
  "M3 12l9-8 9 8M5 10v10h14V10",
  "M4 6h16M4 12h16M4 18h10",
  "M12 3v18M3 12h18M6 6l12 12",
  "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2",
  "M3 17l5-5 4 4 8-9M15 7h5v5",
  "M5 4h14v16H5zM9 9h6M9 13h6",
  "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  "M8 8a3 3 0 106 0 3 3 0 00-6 0zM3 20c0-3 3-5 6-5s6 2 6 5M17 6a3 3 0 010 6M21 20c0-2-1.5-3.5-3-4",
  "M4 7h16v11H4zM9 7V4h6v3",
  "M12 21s-7-5-7-11a7 7 0 0114 0c0 6-7 11-7 11zM12 8v4M10 10h4",
  "M5 12l4 4 10-10",
];

function mono(n: string) {
  const w = n.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || n).slice(0, 2)).toUpperCase();
}

function Frame({ n, title, caption, children, tone = "light", id }: { n: number; title: string; caption: string; children: React.ReactNode; tone?: "light" | "dark" | "soft"; id: string }) {
  const bg = tone === "dark" ? "bg-[#eef6e8] text-navy" : tone === "soft" ? "bg-bg-soft" : "bg-bg";
  const dark = tone === "dark";
  return (
    <section id={`m-${id}`} aria-labelledby={`mt-${id}`} data-scene={id} className={`relative scroll-mt-20 ${bg}`}>
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-1 text-xs font-extrabold ${dark ? "bg-blue text-white" : "bg-blue text-white"}`}>مشهد {n} من {SCENES.length}</span>
          <span className={`h-px flex-1 ${dark ? "bg-line/50" : "bg-line/50"}`} />
        </div>
        <h2 id={`mt-${id}`} className={`mt-5 max-w-3xl text-3xl font-extrabold leading-snug md:text-5xl md:leading-tight ${dark ? "text-navy" : "text-navy"}`}>{title}</h2>
        <p className={`mt-4 max-w-3xl text-base leading-8 md:text-lg ${dark ? "text-ink-2" : "text-ink-2"}`}>{caption}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}


const frameCls = "rounded-[14px] border border-[#e3ddd5] bg-white shadow-[0_8px_24px_rgba(30,30,30,0.08)]";

export default function MethodologyPage() {
  usePage();
  const [reg, setReg] = useState<string>("all");
  const [pick, setPick] = useState<number | null>(null);
  const [nt, setNt] = useState("services");
  const [active, setActive] = useState("how");
  const allUnis = data.regions.flatMap((r, ri) => (r.unis as Uni[]).map((u) => ({ ...u, ri, region: r.name })));
  const shown = reg === "all" ? allUnis : allUnis.filter((u) => data.regions[u.ri].id === reg);

  useEffect(() => {
    const go = () => {
      const id = methodSection();
      setTimeout(() => {
        const el = id ? document.getElementById(`m-${id}`) : null;
        const head = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
        if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - head), behavior: "smooth" });
        else window.scrollTo(0, 0);
      }, 80);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-scene]"));
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).dataset.scene ?? "how")),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const skills = skillsData.categories.flatMap((c) => c.skills) as { id: string; name: string; delivery: string; centerSemesters: number[] }[];
  const bySem = (n: number) => skills.filter((k) => k.centerSemesters.includes(n));
  const uniCount = skills.filter((k) => k.delivery === "university").length;
  const centerCount = skills.length - uniCount;
  const names = allUnis.map((u) => u.name);

  return (
    <article>
      <style>{`@keyframes mq{from{transform:translateX(-50%)}to{transform:translateX(0)}}.mq-track{animation:mq 60s linear infinite}@media (prefers-reduced-motion:reduce){.mq-track{animation:none}}`}</style>
      <nav aria-label="مشاهد المنهجية" className="fixed top-1/2 z-20 hidden -translate-y-1/2 lg:block" style={{ insetInlineEnd: 14 }}>
        <ol className="space-y-3">
          {SCENES.map(([id, label], i) => (
            <li key={id} className="flex justify-end">
              <a href={`#methodology-${id}`} aria-current={active === id ? "true" : undefined} className="group flex items-center gap-2">
                <span className={`rounded-full bg-blue px-2 py-0.5 text-[11px] font-bold text-white transition-opacity ${active === id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{label}</span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-extrabold transition ${active === id ? "border-navy bg-blue text-white" : "border-navy/40 bg-white text-navy"}`}>{i + 1}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <header className="relative overflow-hidden bg-[#eef6e8] text-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="./images/hero-2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/60 to-navy" />
        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-16 text-center sm:px-6 md:pt-24">
          <p className="inline-block rounded-full bg-gold px-4 py-1 text-xs font-extrabold text-navy">المنهجية</p>
          <h1 className="mt-4 text-3xl font-extrabold text-white leading-snug md:text-6xl md:leading-tight">مركزك المهني مبنيّ على ما نجح في 35 جامعة حول العالم</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white md:text-lg">لم نبدأ من الصفر. أخذنا ما أثبت نجاحه في أفضل الجامعات، فصار عندك مركز جاهز.</p>
          <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {data.numbers.map(([n, l]) => (
              <li key={l} className="rounded-[14px] border border-[#7bbb58] bg-white ring-1 ring-[#7bbb58]/30 p-4 backdrop-blur">
                <span className="block text-4xl font-extrabold text-orange-text md:text-5xl">{n}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-2">{l}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#methodology-universities" className="rounded-full bg-gold px-7 py-3 text-sm font-extrabold text-navy hover:opacity-90">شاهد الجامعات التي تعلّمنا منها</a>
            <a href="#methodology-practices" className="rounded-full border-2 border-white bg-white/10 px-7 py-3 text-sm font-extrabold text-white hover:bg-white/25">ماذا أخذنا منها؟</a>
          </div>
        </div>
        <div className="relative overflow-hidden border-t border-white/15 bg-black/25 py-3" aria-hidden="true">
          <div className="mq-track flex w-max gap-8 whitespace-nowrap" dir="ltr">
            {[...names, ...names, ...names, ...names].map((n, i) => (
              <span key={i} className="text-sm font-bold text-ink-2">{n}<span className="ms-8 text-orange-text">&bull;</span></span>
            ))}
          </div>
        </div>
      </header>

      <Frame id="how" n={1} title="كيف تبني جامعة مركزًا مهنيًا ناجحًا؟" caption="بدأنا بسؤال واحد، ثم أربع خطوات حتى صار عندنا موقع يعمل.">
        <ol className="grid gap-5 md:grid-cols-4">
          {data.steps.map(([t, x], i) => (
            <li key={t} className={`${frameCls} relative p-5 text-center`}>
              <span aria-hidden="true" className="absolute -top-3 start-4 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-navy">{i + 1}</span>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white" style={{ background: RCOL[i] }}>
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  {i === 0 && <><circle cx="21" cy="21" r="12" /><path d="M30 30l10 10" /></>}
                  {i === 1 && <path d="M8 38V22M20 38V10M32 38V28M44 38H4" />}
                  {i === 2 && <path d="M6 12h36M12 24h24M18 36h12" />}
                  {i === 3 && <path d="M8 24h12l4-12 4 24 4-12h8" />}
                  {i === 4 && <><rect x="6" y="8" width="36" height="26" rx="3" /><path d="M16 42h16M24 34v8" /></>}
                </svg>
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-navy">{t}</h3>
              <p className="mt-2 text-xs leading-6 text-ink-2">{x}</p>
            </li>
          ))}
        </ol>
      </Frame>

      <Frame id="universities" n={2} tone="soft" title="الجامعات التي أخذنا منها التجارب" caption="35 جامعة في ست مناطق. اختر منطقة لترى كل جامعة وما الذي تميّزت به، وهو ما نقلناه إلى مركزك.">
        <div role="group" aria-label="تصفية حسب المنطقة" className="flex flex-wrap gap-2">
          {[{ id: "all", name: "الكل", n: allUnis.length, c: "#3a6e22" }, ...data.regions.map((r, i) => ({ id: r.id, name: r.name, n: r.unis.length, c: RCOL[i] }))].map((r) => (
            <button key={r.id} type="button" onClick={() => setReg(r.id)} aria-pressed={reg === r.id} className="flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-extrabold transition" style={reg === r.id ? { background: r.c, borderColor: r.c, color: "#fff" } : { borderColor: r.c, color: r.c, background: "#fff" }}>
              {r.name}<span className="rounded-full bg-black/10 px-2 text-xs">{r.n}</span>
            </button>
          ))}
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {shown.map((u) => (
            <li key={u.name} className={`${frameCls} flex gap-4 p-4`}>
              <span aria-hidden="true" dir="ltr" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] text-lg font-extrabold text-white" style={{ background: RCOL[u.ri] }}>{mono(u.name)}</span>
              <span className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-navy"><bdi dir="ltr">{u.name}</bdi></h3>
                <span className="text-[11px] font-bold" style={{ color: RCOL[u.ri] }}>{u.region}</span>
                <p className="mt-1 text-sm leading-6 text-ink">{u.practice}</p>
                <p className="mt-1 text-xs text-ink-2">المنصة: <span dir="ltr">{u.platform}</span></p>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {data.selection.map((x) => (
            <p key={x.title} className="rounded-[14px] bg-white p-4 text-sm leading-7 text-ink-2 shadow-[0_8px_24px_rgba(30,30,30,0.08)]"><b className="text-navy">{x.count}، {x.title}: </b>{x.text}</p>
          ))}
        </div>
        <ul className="mt-6 space-y-2">{data.limits.slice(0, 2).map((x) => <li key={x} className="flex gap-2 text-sm leading-7 text-ink"><span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />{x}</li>)}</ul>
        <p className="mt-4 text-xs text-ink-2">{data.note}</p>
      </Frame>

      <Frame id="practices" n={3} title="ما استخلصناه: اثنتا عشرة ممارسة تتكرر عند الأفضل" caption="لا جامعة تفعل كل شيء. جمعنا ما تفرّق عندها، وجعلنا لكل ممارسة مكانًا تراه في الموقع.">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.practices.map((p, i) => {
            const st = STATE[p.state];
            return (
              <li key={p.title} className={`${frameCls} flex flex-col p-5`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[14px] text-white" style={{ background: RCOL[i % 6] }}>
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ICON_PATHS[i % ICON_PATHS.length]} /></svg>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${st.cls}`}>{st.label}</span>
                </div>
                <h3 className="mt-3 text-lg font-extrabold text-navy">{p.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-2"><b className="text-navy">عندنا: </b>{p.here}</p>
                <div className="mt-3 flex flex-wrap gap-1.5" dir="ltr" aria-label="الجامعات المصدر">
                  {p.from.split("·").map((n) => <span key={n} className="rounded-full bg-bg-soft px-2.5 py-0.5 text-[11px] font-bold text-navy">{n.trim()}</span>)}
                </div>
                <a href={`#${p.to}`} className="mt-auto inline-block pt-4 text-sm font-extrabold text-orange-text hover:underline">شاهدها في الموقع &larr;</a>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[14px] bg-[#eef6e8] p-5">
            <h3 className="text-base font-extrabold text-[#3a6e22]">ما ينتقل كما هو</h3>
            <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-7 text-ink">{data.transfer.yes.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="rounded-[14px] bg-[#f9f4e4] p-5">
            <h3 className="text-base font-extrabold text-[#7a6420]">ما يحتاج تكييفًا</h3>
            <ul className="mt-3 list-disc space-y-1 ps-5 text-sm leading-7 text-ink">{data.transfer.adapt.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </Frame>

      <Frame id="standards" n={4} tone="dark" title="كيف قسنا؟ بمعايير NACE بندًا بندًا" caption={data.nace.intro}>
        <div role="tablist" aria-label="معايير NACE" className="flex flex-wrap gap-2">
          {data.nace.tabs.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={nt === id} onClick={() => setNt(id)} className={`rounded-full px-5 py-2 text-sm font-extrabold transition ${nt === id ? "bg-blue text-white" : "border border-[#7bbb58]/50 text-navy hover:bg-[#eef6e8]"}`}>{label}</button>
          ))}
        </div>

        {nt === "services" && (
          <div className="mt-6">
            <div className="mb-5 flex flex-wrap items-center gap-4 rounded-[14px] border border-[#7bbb58]/50 bg-white p-4">
              <span className="text-4xl font-extrabold text-orange-text" dir="ltr">{data.nace.sections.length}/{data.nace.sections.length}</span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold">أقسام المعايير المهنية: كلها منفّذة</p>
                <span className="mt-2 block h-2.5 overflow-hidden rounded-full bg-line/40"><span className="block h-full w-full rounded-full" style={{ background: "#8fd07a" }} /></span>
              </div>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(data.nace.sections as unknown as [string, string, string, string, string][]).map(([t, , x, w, h], i) => (
                <li key={t} className="flex flex-col rounded-[14px] border border-[#7bbb58]/50 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-navy" style={{ background: "#8fd07a" }}>{i + 1}</span>
                    <h3 className="text-base font-extrabold">{t}</h3>
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-7 text-ink-2">{x}</p>
                  <a href={h} className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-[#3a6e22]/50 px-3 py-1 text-xs font-bold text-[#3a6e22] hover:bg-[#e3f0d9]">
                    <span aria-hidden>✓</span> تجده في: {w}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-6 text-ink-2">{data.nace.sectionsNote}</p>
          </div>
        )}

        {nt === "fds" && (
          <div className="mt-6">
            <p className="text-sm font-bold text-orange-text">الفئات التي يُصنَّف بها كل خريج</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {data.nace.fds.outcomes.map((o, i) => <li key={o} className="rounded-full border border-[#7bbb58]/50 bg-white px-4 py-2 text-sm font-semibold"><span className="me-2 text-orange-text">{i + 1}</span>{o}</li>)}
            </ul>
            <ul className="mt-6 grid gap-3 md:grid-cols-4">
              {data.nace.fds.rules.map(([n, t, x]) => (
                <li key={t} className="rounded-[14px] bg-white p-4 text-ink">
                  <span className="block text-2xl font-extrabold text-orange-text">{n}</span>
                  <h3 className="mt-1 text-sm font-extrabold text-navy">{t}</h3>
                  <p className="mt-1 text-xs leading-6 text-ink-2">{x}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-[14px] border border-gold/60 bg-gold/10 p-4 text-sm leading-7"><b className="text-orange-text">كيف طبّقناه: </b>{data.nace.fds.ours}</p>
            <p className="mt-3 text-xs text-ink-2">{data.nace.fds.source}</p>
          </div>
        )}

        {nt === "comp" && (
          <div className="mt-6">
            <ul className="grid gap-3 md:grid-cols-2">
              {(data.nace.comp.items as unknown as [string, string, string[]][]).map(([t, x, ours], i) => (
                <li key={t} className="rounded-[14px] border border-[#7bbb58]/50 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-navy">{i + 1}</span>
                    <h3 className="text-base font-extrabold">{t}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink-2">{x}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs"><span className="font-bold text-orange-text">يقابلها عندنا:</span>{ours.map((k) => <span key={k} className="rounded-full bg-teal px-2.5 py-0.5 font-bold text-navy">{k}</span>)}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-[14px] border border-[#7bbb58]/50 bg-white p-4 text-sm leading-7 text-ink-2">{data.nace.comp.extra}</p>
            <p className="mt-3 text-xs text-ink-2">{data.nace.comp.source}</p>
          </div>
        )}
      </Frame>
    </article>
  );
}
