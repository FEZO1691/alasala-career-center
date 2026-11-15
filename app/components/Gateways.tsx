"use client";

import { useEffect, useRef, useState } from "react";
import type { Feature, Gateway } from "@/lib/data";
import { OPEN_GATEWAY_EVENT } from "@/lib/open-gateway";
import { scrollToSection } from "@/lib/scroll";

type Props = { gateways: Gateway[]; features: Feature[] };

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 shrink-0 text-orange-text transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

function Code({ id }: { id: string }) {
  return (
    <span className="shrink-0 rounded-full bg-bg-soft px-2 py-0.5 text-[11px] font-bold text-orange-text">
      {id}
    </span>
  );
}

export default function Gateways({ gateways, features }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const forceScroll = useRef(false);
  const [openRequest, setOpenRequest] = useState(0);

  // طلب فتح بوابة من خارج القسم (قائمة تسجيل الدخول أو زر الـ Hero)
  useEffect(() => {
    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!gateways.some((g) => g.id === id)) return;
      forceScroll.current = true;
      setOpenId(id);
      setOpenRequest((n) => n + 1);
    };
    window.addEventListener(OPEN_GATEWAY_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_GATEWAY_EVENT, onOpen);
  }, [gateways]);

  // نوصّل الشاشة للوحة لو الطلب جاي من خارج القسم، أو في الموبايل (اللوحة تحت البطاقات الأربع)
  useEffect(() => {
    if (!openId) return;
    const force = forceScroll.current;
    forceScroll.current = false;
    if (force || window.matchMedia("(max-width: 767px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }, [openId, openRequest]);

  const name = Object.fromEntries(features.map((f) => [f.id, f.name]));
  // الفيتشرز اللي موجودة في كل البوابات (عابرة)
  const common = features
    .map((f) => f.id)
    .filter((id) => gateways.every((g) => g.features.includes(id)));
  const open = gateways.find((g) => g.id === openId);

  return (
    <section
      id="gateways"
      aria-labelledby="gateways-title"
      className="border-t border-line/30 bg-bg"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="gateways-title" className="text-2xl font-extrabold text-navy md:text-3xl">
            أربع بوابات
          </h2>
          <p className="mt-3 leading-8 text-ink-2">
            كل مستخدم يدخل من بوابته. اضغط على بوابة لتشاهد محتواها.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {gateways.map((g) => {
            const on = g.id === openId;
            return (
              <li key={g.id} id={g.id} className="flex flex-col gap-3">
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls="gateway-panel"
                  onClick={() => setOpenId(on ? null : g.id)}
                  className={`flex w-full flex-1 flex-col rounded-[12px] border bg-bg p-5 text-start shadow-sm transition-colors hover:border-blue ${
                    on ? "border-blue border-2" : "border-line/40"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-xl font-bold text-navy">{g.name}</span>
                    <Chevron open={on} />
                  </span>
                  <span className="mt-2 block text-sm leading-7 text-ink-2">{g.who}</span>
                  <span className="mt-4 block text-xs font-bold text-orange-text">ماذا يرى</span>
                  <span className="mt-2 block space-y-2">
                    {g.highlights.map((id) => (
                      <span key={id} className="flex items-start gap-2 text-sm leading-6 text-ink">
                        <Code id={id} />
                        <span>{name[id]}</span>
                      </span>
                    ))}
                  </span>
                </button>
                {g.experienceLink && (
                  <a
                    href={g.experienceLink.href}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = g.experienceLink!.href;
                    }}
                    className="rounded-[12px] bg-blue px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-blue-bright"
                  >
                    {g.experienceLink.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        {open && (
          <div
            id="gateway-panel"
            ref={panelRef}
            role="region"
            aria-label={open.panelTitle}
            className="mt-6 scroll-mt-32 rounded-[12px] border border-line/40 bg-bg-soft p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-navy">{open.panelTitle}</h3>
              {open.id === "student" && (
                <a
                  href="#journey"
                  className="rounded-[12px] bg-blue px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-bright"
                >
                  ابدأ رحلتك
                </a>
              )}
            </div>

            <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-2">
              {open.features
                .filter((id) => !common.includes(id))
                .map((id) => (
                  <li key={id} className="flex items-start gap-2 leading-7 text-ink">
                    <Code id={id} />
                    <span>{name[id]}</span>
                  </li>
                ))}
            </ul>

            <div className="mt-5 border-t border-line/40 pt-4">
              <h4 className="text-xs font-bold text-ink-2">ينطبق على كل البوابات</h4>
              <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-2">
                {common.map((id) => (
                  <li key={id} className="flex items-center gap-2">
                    <Code id={id} />
                    {name[id]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
