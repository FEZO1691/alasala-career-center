"use client";

import ImageSlot from "./ImageSlot";
import { STORIES, STORY_NOTE } from "@/lib/stories";
import { storyId, usePage } from "@/lib/route";
import { useEffect, useState } from "react";

const CTA: Record<string, { label: string; href: string }> = {
  "خريج": { label: "ادخل بوابة الخريجين", href: "#alumni" },
  "طالب": { label: "ابدأ رحلتك في بوابة الطالب", href: "#student" },
  "صاحب عمل": { label: "ادخل بوابة أصحاب العمل", href: "#employers" },
};

export default function StoryPage() {
  usePage();
  const [id, setId] = useState("1");
  useEffect(() => {
    const f = () => setId(storyId());
    f();
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  useEffect(() => window.scrollTo(0, 0), [id]);
  const s = STORIES.find((x) => x.id === id) ?? STORIES[0];
  const others = STORIES.filter((x) => x.id !== s.id);
  const cta = CTA[s.kind];

  return (
    <article aria-labelledby="sp-title" className="bg-bg">
      <div className="bg-[#eef6e8] text-navy">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <a href="#stories" className="text-sm font-bold text-ink-2 hover:text-navy">&rarr; كل القصص</a>
          <p className="mt-6 text-sm font-bold text-orange-text">{s.kind}</p>
          <h1 id="sp-title" className="mt-1 text-3xl font-extrabold leading-snug md:text-5xl md:leading-tight">{s.title}</h1>
          <p className="mt-3 text-base text-ink-2">{s.name} · {s.meta}</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="-mt-20 overflow-hidden rounded-[18px] bg-black shadow-xl ring-1 ring-line/20 md:-mt-24">
          {s.video ? (
            <video key={s.id} controls preload="metadata" playsInline poster={`./images/story-${s.id}.jpg`} src={s.video} className="aspect-video w-full" aria-label={`فيديو: ${s.title}`} />
          ) : (
            <div className="relative">
              <ImageSlot label={`غلاف فيديو: ${s.name}`} src={`./images/story-${s.id}.jpg`} pos={s.id === "2" ? "85% 30%" : "center 30%"} ratio="16 / 9" tone="dark" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                <span aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-navy shadow-xl">
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <span className="rounded-full bg-black/40 px-4 py-1.5 text-xs font-bold">مكان الفيديو، يُرفع بعد تسجيله بموافقة صاحبه</span>
              </div>
            </div>
          )}
        </div>

        <blockquote className="mt-10 border-s-4 border-gold ps-5 text-xl font-bold leading-9 text-navy md:text-2xl md:leading-10">«{s.quote}»</blockquote>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {s.sections.map(([h, t], i) => (
            <section key={h} className="rounded-[16px] bg-white p-5 shadow-sm ring-1 ring-line/20">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue text-sm font-extrabold text-white">{i + 1}</span>
              <h2 className="mt-3 text-base font-extrabold text-navy">{h}</h2>
              <p className="mt-2 text-sm leading-7 text-ink-2">{t}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2" aria-label="خدمات المركز في هذه القصة">
          {s.points.map((p) => (
            <span key={p} className="rounded-full bg-[#e3f0d9] px-3 py-1 text-xs font-bold text-[#3a6e22]">{p}</span>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-bg-soft p-6">
          <p className="text-base font-extrabold text-navy">تريد قصة مثل هذه؟</p>
          <a href={cta.href} className="rounded-full bg-blue px-6 py-3 text-sm font-bold text-white hover:opacity-90">{cta.label}</a>
        </div>

        <h2 className="mt-14 text-lg font-extrabold text-navy">قصص أخرى</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {others.map((o) => (
            <li key={o.id}>
              <a href={`#story-${o.id}`} className="block rounded-[14px] bg-white p-5 shadow-sm ring-1 ring-line/20 transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="text-xs font-bold text-orange-text">{o.kind}</span>
                <span className="mt-1 block text-base font-extrabold text-navy">{o.title}</span>
                <span className="mt-1 block text-xs text-ink-2">{o.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-xs text-ink-2">{STORY_NOTE}</p>
      </div>
    </article>
  );
}
