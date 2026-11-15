"use client";

import type { JourneyPeriod, JourneyScreenDef, JourneyScreenId, JourneyTab } from "@/lib/data";
import { ICONS } from "./PhoneFrame";

type Item = { id: JourneyScreenId; def: JourneyScreenDef; locked: boolean };

type Props = {
  tabs: JourneyTab[];
  periods: JourneyPeriod[];
  periodId: JourneyPeriod["id"];
  onSelectPeriod: (id: JourneyPeriod["id"]) => void;
  persona: { name: string; major: string };
  nav: Item[];
  cards: Item[];
  screen: JourneyScreenId;
  onNavigate: (id: JourneyScreenId) => void;
};

const GOLD = "#cdb774";

function Lock() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-white/70">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" fill="currentColor" />
      <path d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 px-1 text-[11px] font-bold text-white/60">{label}</p>
      {children}
    </div>
  );
}

// القائمة الجانبية الكحلية: الفترة الدراسية، ثم شاشات التطبيق، ثم خدمات المركز
export default function PortalSidebar({ tabs, periods, periodId, onSelectPeriod, persona, nav, cards, screen, onNavigate }: Props) {
  const activeTab = tabs.find((t) => t.periodIds.includes(periodId)) ?? tabs[0];

  const row = (n: Item, withIcon: boolean) => {
    const on = n.id === screen;
    return (
      <li key={n.id}>
        <button
          type="button"
          aria-current={on ? "page" : undefined}
          aria-disabled={n.locked || undefined}
          onClick={() => onNavigate(n.id)}
          className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-start text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-white ${
            on ? "bg-white/15 text-white" : n.locked ? "text-white/55 hover:bg-white/10" : "text-white/85 hover:bg-white/10"
          }`}
        >
          {withIcon ? (
            <span aria-hidden="true" className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">
              {ICONS[n.id] ?? ICONS.home}
            </span>
          ) : (
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: on ? GOLD : "#ffffff" }} />
          )}
          <span className="min-w-0 flex-1 truncate">{n.def.title}</span>
          {n.locked && (
            <>
              <Lock />
              <span className="sr-only">مقفلة</span>
            </>
          )}
        </button>
      </li>
    );
  };

  return (
    <aside className="bg-[#3a6e22] px-4 py-4 text-white md:w-64 md:shrink-0 md:px-4 md:py-6">
      <div className="flex items-center gap-3 px-1">
        <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
          <circle cx="20" cy="9" r="7" fill="#fff" />
          <circle cx="9" cy="28" r="7" fill="#fff" />
          <circle cx="31" cy="28" r="7" fill="#fff" />
        </svg>
        <div>
          <p className="text-base font-extrabold leading-6">مركز المسار المهني</p>
          <p className="text-[11px] text-white/70">منظومة تأهيل الخريجين</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5 rounded-[10px] bg-white/10 px-3 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-extrabold">
          {persona.name.slice(0, 1)}
        </span>
        <div className="min-w-0 leading-5">
          <p className="text-sm font-bold">{persona.name}</p>
          <p className="truncate text-[11px] text-white/70">{persona.major}</p>
        </div>
      </div>

      <Group label="السنة الدراسية">
        <div role="tablist" aria-label="سنوات الدراسة" className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const on = t.key === activeTab.key;
            return (
              <button
                key={t.key}
                id={`exp-tab-${t.key}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls="exp-content"
                onClick={() => onSelectPeriod(t.periodIds[0])}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                  on ? "bg-white text-navy" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div role="group" aria-label={`فصول ${activeTab.label}`} className="mt-2 flex flex-wrap gap-1.5">
          {activeTab.periodIds.map((pid) => {
            const p = periods.find((x) => x.id === pid)!;
            const on = pid === periodId;
            return (
              <button
                key={String(pid)}
                type="button"
                aria-pressed={on}
                onClick={() => onSelectPeriod(pid)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  on ? "border-transparent text-navy" : "border-white/30 text-white hover:bg-white/10"
                }`}
                style={on ? { background: GOLD } : undefined}
              >
                {typeof pid === "number" ? `الفصل ${pid}` : p.title}
              </button>
            );
          })}
        </div>
      </Group>

      <nav aria-label="تنقل التطبيق" className="md:block">
        <Group label="التطبيق">
          <ul className="space-y-0.5">{nav.map((n) => row(n, true))}</ul>
        </Group>
        <Group label="خدمات المركز">
          <ul className="space-y-0.5">{cards.map((n) => row(n, false))}</ul>
        </Group>
      </nav>
    </aside>
  );
}

export type { Item as PortalItem };
