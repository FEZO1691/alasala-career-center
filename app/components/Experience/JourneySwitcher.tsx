"use client";

import type { JourneyPeriod, JourneyTab } from "@/lib/data";

type Props = {
  tabs: JourneyTab[];
  periods: JourneyPeriod[];
  current: JourneyPeriod["id"];
  onSelect: (id: JourneyPeriod["id"]) => void;
};

// تبويبات السنوات و"بعد التخرج"، وتحتها فصول السنة المختارة (تتحرك أفقيًا في الموبايل)
export default function JourneySwitcher({ tabs, periods, current, onSelect }: Props) {
  const activeTab = tabs.find((t) => t.periodIds.includes(current)) ?? tabs[0];

  // تنقل بالأسهم بين التبويبات (يراعي اتجاه الصفحة) مع Home وEnd، والتفعيل عند الانتقال
  const onTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
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
    items[next].click();
  };

  return (
    <div className="mt-8 space-y-3">
      <div
        role="tablist"
        aria-label="سنوات الدراسة"
        onKeyDown={onTabsKeyDown}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:px-0"
      >
        {tabs.map((t) => {
          const on = t.key === activeTab.key;
          return (
            <button
              key={t.key}
              id={`exp-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              aria-controls="exp-content"
              onClick={() => onSelect(t.periodIds[0])}
              className={`shrink-0 rounded-[12px] border px-5 py-2.5 text-sm font-bold transition-colors ${
                on
                  ? "border-blue bg-blue text-white"
                  : "border-line/50 bg-bg text-navy hover:border-blue hover:bg-bg-soft"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label={`فصول ${activeTab.label}`}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:px-0"
      >
        {activeTab.periodIds.map((pid) => {
          const p = periods.find((x) => x.id === pid)!;
          const on = pid === current;
          return (
            <button
              key={String(pid)}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(pid)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                on
                  ? "border-navy bg-blue text-white"
                  : "border-line bg-bg text-navy hover:border-blue hover:bg-bg-soft"
              }`}
            >
              {typeof pid === "number" ? `الفصل ${pid}` : p.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
