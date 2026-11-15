"use client";

import { useEffect, useRef } from "react";
import type { JourneyScreenDef, JourneyScreenId } from "@/lib/data";

type NavItem = { id: JourneyScreenId; def: JourneyScreenDef; locked: boolean };

type Props = {
  nav: NavItem[];
  current: JourneyScreenId;
  onNavigate: (id: JourneyScreenId) => void;
  children: React.ReactNode;
};

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  className: "h-6 w-6",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const ICONS: Record<string, React.ReactNode> = {
  home: (
    <svg {...iconProps}>
      <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </svg>
  ),
  portfolio: (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" />
    </svg>
  ),
  nova: (
    <svg {...iconProps}>
      <path d="M12 3l2.2 5.3L20 10l-4.4 3.7L17 19.5 12 16.4 7 19.5l1.4-5.8L4 10l5.8-1.7z" />
    </svg>
  ),
  plan: (
    <svg {...iconProps}>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  skills: (
    <svg {...iconProps}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  ),
  assistant: (
    <svg {...iconProps}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z" />
    </svg>
  ),
};

function LockBadge() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="absolute -end-1 -top-1 h-4 w-4 rounded-full bg-bg text-ink-2">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" fill="currentColor" />
      <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// إطار هاتف بنسبة 9:19.5 وبحد أقصى 380px: شريط حالة مبسط، والمحتوى، وشريط تنقل سفلي
export default function PhoneFrame({ nav, current, onNavigate, children }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const inNav = nav.some((n) => n.id === current);

  // بعد الانتقال من بطاقة في الرئيسية يزول الزر المضغوط، فننقل التركيز إلى محتوى الشاشة
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const a = document.activeElement;
    if (!a || a === document.body || !a.closest("nav[aria-label='تنقل التطبيق']")) {
      contentRef.current?.focus({ preventScroll: true });
    }
  }, [current]);

  // تنقل بالأسهم بين أيقونات الشريط (يراعي اتجاه الصفحة) مع Home وEnd
  const onNavKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    let next = i;
    if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else {
      const step = e.key === "ArrowRight" ? (rtl ? -1 : 1) : rtl ? 1 : -1;
      next = (i + step + items.length) % items.length;
    }
    e.preventDefault();
    items[next].focus();
  };

  return (
    <div role="group" aria-label="تطبيق الطالب (نموذج تجريبي)" className="mx-auto w-full max-w-[380px]">
      <div className="aspect-[9/19.5] rounded-[2.5rem] bg-blue p-3 shadow-xl">
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-bg">
          {/* شريط الحالة */}
          <div aria-hidden="true" className="flex items-center justify-between px-5 pb-1 pt-3 text-navy">
            <span className="h-1.5 w-16 rounded-full bg-line/60" />
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 20 14" className="h-3 w-4" fill="currentColor">
                <rect x="0" y="9" width="3" height="5" rx="1" />
                <rect x="5" y="6" width="3" height="8" rx="1" />
                <rect x="10" y="3" width="3" height="11" rx="1" />
                <rect x="15" y="0" width="3" height="14" rx="1" />
              </svg>
              <svg viewBox="0 0 26 14" className="h-3 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="21" height="12" rx="3" />
                <rect x="3" y="3" width="14" height="8" rx="1.5" fill="currentColor" stroke="none" />
                <path d="M24 5v4" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          <div
            ref={contentRef}
            tabIndex={-1}
            role="region"
            aria-label="شاشة التطبيق"
            className="min-h-0 flex-1 overflow-y-auto focus:outline-none"
          >
            {children}
          </div>

          <nav
            aria-label="تنقل التطبيق"
            onKeyDown={onNavKeyDown}
            className="grid grid-cols-5 border-t border-line/40 bg-bg px-1 pb-2 pt-1"
          >
            {nav.map((n, i) => {
              const on = n.id === current;
              return (
                <button
                  key={n.id}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  aria-disabled={n.locked || undefined}
                  aria-label={n.locked ? `${n.def.title}، مقفلة` : n.def.title}
                  tabIndex={on || (!inNav && i === 0) ? 0 : -1}
                  onClick={() => onNavigate(n.id)}
                  className={`flex min-h-12 flex-col items-center gap-0.5 rounded-[12px] px-1 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-blue ${
                    on ? "text-orange-text" : "text-ink-2 hover:text-orange-text"
                  }`}
                >
                  <span className="relative">
                    <span className={n.locked ? "block opacity-60" : "block"}>{ICONS[n.id] ?? ICONS.home}</span>
                    {n.locked && <LockBadge />}
                  </span>
                  {n.def.title}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

export type { NavItem };
