"use client";

import { useState } from "react";
import data from "@/data/universities/demo/platform.json";
import { COHORT, summary, usePortal } from "@/lib/portal-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type V = any;

const GOLD = "#cdb774";
const PAPER = "#f4f2ef";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-[14px] bg-white p-4 shadow-sm md:p-5 ${className}`}>{children}</div>;
}

function CardHead({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h4 className="text-base font-extrabold text-navy">{title}</h4>
      {note && <span className="text-xs text-ink-2">{note}</span>}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: string }) {
  const bg = tone === "teal" ? "#3f7a24" : tone === "navy" ? "#3f7a24" : tone === "gold" ? GOLD : "#cfc8c0";
  const fg = tone === "grey" ? "#4a3f36" : tone === "gold" ? "#3b2a00" : "#ffffff";
  return (
    <span
      className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center whitespace-pre-line rounded-full text-center font-bold ${label.length > 16 ? "px-2 text-[9px] leading-[11px]" : "px-1 text-[11px] leading-4"}`}
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

function Dots({ score }: { score: number }) {
  return (
    <span className="flex gap-1" dir="ltr" aria-label={`${score} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-3.5 w-3.5 rounded-full"
          style={{ background: i <= score ? "#3f7a24" : "#e4dfd9" }}
        />
      ))}
    </span>
  );
}

const QR = [
  "111111101011111111",
  "100000101101000001",
  "101110100110101101",
  "101110101011101101",
  "101110110100101101",
  "100000100111000001",
  "111111101010111111",
  "000000000110100000",
  "110101111001011010",
  "001011000111010101",
  "111100111010110010",
  "010011001101001101",
  "111111100011100111",
  "100000101100111010",
  "101110101110001101",
  "101110100001110010",
  "100000101011010111",
  "111111101100101001",
];

function Qr() {
  return (
    <svg viewBox="0 0 18 18" className="h-[84px] w-[84px] shrink-0" role="img" aria-label="رمز تحقق QR">
      <rect width="18" height="18" fill="#fff" />
      {QR.flatMap((row, y) =>
        row.split("").map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#3f7a24" /> : null))
      )}
    </svg>
  );
}

/* ---------- الواجهات ---------- */

function JourneyView({ v }: { v: V }) {
  return (
    <>
      <Card>
        <CardHead title={v.timelineTitle} note={v.timelineNote} />
        <ol className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {v.steps.map((s: V) => (
            <li key={s.n} className="flex flex-col items-center text-center">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-extrabold"
                style={{
                  background: s.state === "done" ? "#3f7a24" : s.state === "current" ? "#3f7a24" : "#d3cbc3",
                  color: s.state === "next" ? "#5c5249" : "#fff",
                  boxShadow: s.state === "current" ? `0 0 0 4px ${GOLD}` : undefined,
                }}
              >
                {s.n}
              </span>
              <span className="mt-2 text-sm font-extrabold text-navy">{s.title}</span>
              {s.lines.map((l: string) => (
                <span key={l} className="text-xs leading-6 text-ink-2">
                  {l}
                </span>
              ))}
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
        <Card>
          <CardHead title={v.tasksTitle} note={v.tasksNote} />
          <ul className="space-y-2.5">
            {v.tasks.map((t: V) => (
              <li key={t.title} className="flex items-center gap-3 rounded-[10px] bg-[#f8f6f3] p-3">
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    background: t.state === "done" ? "#e3f0d9" : t.state === "active" ? "#e2ecf6" : "#f7f0da",
                    color: t.state === "done" ? "#3a6e22" : t.state === "active" ? "#3f7a24" : "#7a6420",
                  }}
                >
                  {t.status}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-6 text-navy">{t.title}</span>
                  <span className="block text-xs text-ink-2">{t.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHead title={v.readyTitle} note={v.readyNote} />
          <p className="text-4xl font-extrabold text-orange-text">{v.readyValue}</p>
          <p className="mt-1 text-sm text-ink-2">{v.readyCaption}</p>
          <p className="text-xs font-bold text-orange-text">{v.readyDelta}</p>
          <ul className="mt-4 space-y-3">
            {v.readyBars.map((b: V) => (
              <li key={b.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-semibold text-ink">{b.name}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e4dfd9]" dir="ltr">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(b.value / 5) * 100}%`, background: b.warn ? GOLD : "#3f7a24" }}
                  />
                </span>
                <span className="w-7 text-xs text-ink-2" dir="ltr">
                  {b.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHead title={v.badgesTitle} />
          <div className="flex flex-wrap gap-3">
            {v.badges.map((b: V) => (
              <Badge key={b.label} label={b.label} tone={b.tone} />
            ))}
          </div>
          <h4 className="mb-2 mt-5 text-base font-extrabold text-navy">{v.nextTitle}</h4>
          <ul className="space-y-2">
            {v.next.map((n: V) => (
              <li key={n.title} className="rounded-[10px] bg-[#f8f6f3] p-3">
                <span className="block text-sm font-bold leading-6 text-navy">{n.title}</span>
                <span className="block text-xs text-ink-2">{n.meta}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

export function CvView({ v, shareSlot }: { v: V; shareSlot?: React.ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[2.3fr_1fr]">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue text-xl font-extrabold text-white">
                {v.user.initial}
              </span>
              <div>
                <p className="text-xl font-extrabold text-navy">{v.person.name}</p>
                <p className="text-xs leading-6 text-ink-2" dir="rtl">
                  {v.person.meta}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-[10px] border-2 border-dashed border-teal p-3">
              <Qr />
              <div className="text-sm leading-6">
                <p className="font-extrabold text-navy">{v.stamp.title}</p>
                <p className="font-semibold text-orange-text" dir="ltr">
                  {v.stamp.number}
                </p>
                <p className="text-xs text-ink-2">{v.stamp.source}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-base font-extrabold text-navy">{v.topTitle}</h4>
            <span className="text-xs text-ink-2">{v.topNote}</span>
          </div>
          <ul className="mt-3 divide-y divide-[#eee9e3]">
            {v.top.map((c: V) => (
              <li key={c.name} className="grid items-center gap-x-4 gap-y-1 py-3 md:grid-cols-[13rem_auto_1fr]">
                <span className="text-sm font-extrabold text-navy">{c.name}</span>
                <Dots score={c.score} />
                <span className="text-xs leading-6 text-ink-2">{c.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-5 border-t border-[#eee9e3] pt-4 md:grid-cols-3">
            <div>
              <h5 className="text-sm font-extrabold text-navy">{v.stylesTitle}</h5>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.styles.map((s: string) => (
                  <span key={s} className="rounded-md bg-[#e3f0d9] px-2.5 py-1 text-xs font-semibold text-orange-text">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-extrabold text-navy">{v.certTitle}</h5>
              <span className="mt-2 inline-block rounded-md bg-[#f1ede8] px-2.5 py-1 text-xs font-semibold text-ink-2" dir="ltr">
                {v.cert}
              </span>
            </div>
            <div>
              <h5 className="text-sm font-extrabold text-navy">{v.challengeTitle}</h5>
              <p className="mt-2 text-xs leading-6 text-ink-2">{v.challenge}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <p className="text-4xl font-extrabold text-orange-text" dir="ltr">
            {v.deltaValue}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-2">{v.deltaCaption}</p>
          <p className="text-xs font-bold text-orange-text">{v.deltaNote}</p>
        </Card>
        <Card>
          <CardHead title={v.badgesTitle} />
          <div className="flex flex-wrap gap-3">
            {v.badges.map((b: V) => (
              <Badge key={b.label} label={b.label} tone={b.tone} />
            ))}
          </div>
        </Card>
        {shareSlot ?? (
        <Card>
            <CardHead title={v.shareTitle} />
            <p className="text-xs leading-6 text-ink-2">{v.shareText}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-white">{v.shareLink}</span>
              <span className="rounded-full border-2 border-navy px-4 py-1.5 text-sm font-bold text-navy">{v.sharePdf}</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function LiveBlock() {
  const sum = summary(usePortal());
  const items: [number | string, string][] = [
    [sum.jobsPublished, "وظائف منشورة من أصحاب العمل"],
    [sum.applicants, "طلبات تقدم من الطلاب"],
    [sum.shortlisted, "خريجون في القوائم القصيرة"],
    [sum.interviews, "في مرحلة المقابلة فما بعد"],
    [`${sum.hiredRate}%`, `معدل التوظيف (${sum.placed} من ${COHORT})`],
    [sum.satisfaction === null ? "—" : `${sum.satisfaction}/5`, `رضا أصحاب العمل (${sum.evaluated} تقييمات)`],
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-extrabold text-navy">نشاط أصحاب العمل</h4>
        <span className="rounded-full bg-[#e3f0d9] px-2.5 py-0.5 text-[11px] font-bold text-[#3a6e22]">متصل مباشرة ببوابة أصحاب العمل</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {items.map(([n, l]) => (
          <div key={l} className="rounded-[10px] bg-[#f8f6f3] p-3">
            <p className="text-2xl font-extrabold text-orange-text" dir="ltr">{n}</p>
            <p className="mt-1 text-xs text-ink-2">{l}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function UniversityView({ v }: { v: V }) {
  return (
    <>
      <LiveBlock />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {v.kpis.map((k: V) => (
          <Card key={k.label}>
            <p className="text-3xl font-extrabold md:text-4xl" style={{ color: k.tone === "gold" ? "#8a7230" : "#3a6e22" }} dir="ltr">
              {k.value}
            </p>
            <p className="mt-1 text-xs leading-6 text-ink-2 md:text-sm">{k.label}</p>
            <p className="text-xs font-bold" style={{ color: k.tone === "gold" ? "#8a7230" : "#3a6e22" }}>
              {k.note}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHead title={v.tableTitle} note={v.tableNote} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[20rem] text-sm">
              <thead>
                <tr className="text-xs text-ink-2">
                  {v.tableHead.map((h: string, i: number) => (
                    <th key={h} className={`pb-2 font-semibold ${i < 2 ? "text-start" : "text-center"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.table.map((r: V) => (
                  <tr key={r.path} className="border-t border-[#eee9e3]">
                    <td className="py-3 font-bold text-navy">{r.path}</td>
                    <td className="py-3 text-ink-2">{r.sector}</td>
                    <td className="py-3 text-center text-ink">{r.students}</td>
                    <td className="py-3 text-center">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{
                          background: r.pass >= 85 ? "#e3f0d9" : "#f7f0da",
                          color: r.pass >= 85 ? "#3a6e22" : "#7a6420",
                        }}
                      >
                        {r.pass}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHead title={v.chartTitle} note={v.chartNote} />
          <div className="flex h-44 items-end justify-around gap-4 border-b border-[#e4dfd9] pb-0" dir="rtl">
            {v.chart.map((c: V) => (
              <div key={c.name} className="flex flex-1 flex-col items-center">
                <div className="flex h-36 items-end gap-1.5">
                  <span className="w-7 rounded-t-md bg-[#d3cbc3]" style={{ height: `${(c.pre / 5) * 100}%` }} title={`${c.pre}`} />
                  <span className="w-7 rounded-t-md bg-teal" style={{ height: `${(c.post / 5) * 100}%` }} title={`${c.post}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-around gap-4 pt-2 text-xs text-ink-2">
            {v.chart.map((c: V) => (
              <span key={c.name} className="flex-1 text-center">
                {c.name}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-ink-2">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#d3cbc3]" />
              {v.chartLegend[0]}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-teal" />
              {v.chartLegend[1]}
            </span>
          </div>
        </Card>
      </div>

      <Card>
        <CardHead title={v.reportsTitle} note={v.reportsNote} />
        <div className="flex flex-wrap gap-2">
          {v.reports.map((r: string, i: number) => (
            <span
              key={r}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                i === 0 ? "bg-blue text-white" : "border border-[#d9d2ca] text-navy"
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      </Card>
    </>
  );
}

function EmployersView({ v }: { v: V }) {
  const [short, setShort] = useState<string[]>([]);
  const toggle = (n: string) => setShort((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1 rounded-full border border-[#d9d2ca] px-5 py-3 text-sm text-ink-2">{v.searchLabel}</div>
          <span className="rounded-[10px] bg-teal px-5 py-3 text-center text-sm font-bold text-white">{v.searchButton}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-2">{v.reqLabel}</span>
          {v.required.map((r: string) => (
            <span key={r} className="rounded-full bg-blue px-3.5 py-1.5 text-xs font-bold text-white">
              {r}
            </span>
          ))}
          {v.filters.map((f: string) => (
            <span key={f} className="rounded-full border border-[#d9d2ca] px-3.5 py-1.5 text-xs font-semibold text-ink-2">
              {f}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {v.graduates.map((g: V) => {
          const on = short.includes(g.name);
          return (
            <Card key={g.name}>
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue text-base font-extrabold text-white">
                  {g.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-navy">{g.name}</p>
                  <p className="text-xs text-ink-2">{g.meta}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-navy" dir="ltr">
                    {g.match}%
                  </p>
                  <p className="text-[10px] leading-4 text-ink-2">{v.matchLabel}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.skills.map(([n, s]: [string, number]) => (
                  <span key={n} className="rounded-md bg-[#e3f0d9] px-2 py-1 text-xs font-semibold text-orange-text">
                    {s} {n}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.styles.map((s: string) => (
                  <span key={s} className="rounded-md bg-[#f1ede8] px-2 py-1 text-xs font-semibold text-ink-2">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(g.name)}
                  className={`rounded-[10px] px-4 py-2 text-sm font-bold transition-colors ${
                    on ? "border-2 border-teal bg-white text-orange-text" : "bg-teal text-white hover:bg-blue-bright"
                  }`}
                >
                  {on ? `✓ ${v.addedLabel}` : v.addLabel}
                </button>
                <span className="text-xs font-semibold text-orange-text">✓ {v.verified}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {v.stats.map((s: V) => (
          <Card key={s.label}>
            <p className="text-3xl font-extrabold text-orange-text" dir="ltr">
              {s.value === "{short}" ? short.length : s.value}
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-2">{s.label}</p>
          </Card>
        ))}
      </div>
    </>
  );
}

export function Frame({ v, children, panel, className = "", brand, onNav, aside }: { v: V; children: React.ReactNode; panel?: Record<string, string>; className?: string; brand?: { name: string; sub: string }; onNav?: (i: number) => void; aside?: React.ReactNode }) {
  const b = brand ?? data.brand;
  return (
    <div
      {...panel}
      className={`overflow-hidden rounded-[16px] border border-line/40 shadow-md md:flex ${className}`}
      style={{ background: PAPER }}
    >
          <aside className="bg-[#3a6e22] px-4 py-4 text-white md:w-60 md:shrink-0 md:px-5 md:py-6">
            <div className="flex items-center gap-3">
              <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
                <circle cx="20" cy="9" r="7" fill="#fff" />
                <circle cx="9" cy="28" r="7" fill="#fff" />
                <circle cx="31" cy="28" r="7" fill="#fff" />
              </svg>
              <div>
                <p className="text-base font-extrabold leading-6">{b.name}</p>
                <p className="text-[11px] text-white/70">{b.sub}</p>
              </div>
            </div>
            <ul className="mt-4 flex gap-1 overflow-x-auto md:mt-8 md:flex-col md:overflow-visible">
              {v.nav.map((n: string, idx: number) => (
                <li key={n}>
                  {onNav ? (
                    <button
                      type="button"
                      aria-current={idx === v.navActive ? "page" : undefined}
                      onClick={() => onNav(idx)}
                      className={`flex w-full shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-start text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white ${
                        idx === v.navActive ? "bg-white/15 text-white" : "text-white/80"
                      }`}
                    >
                      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: idx === v.navActive ? GOLD : "#ffffff" }} />
                      {n}
                    </button>
                  ) : (
                    <span
                      className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-sm font-semibold ${
                        idx === v.navActive ? "bg-white/15 text-white" : "text-white/80"
                      }`}
                    >
                      <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ background: idx === v.navActive ? GOLD : "#ffffff" }} />
                      {n}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {aside}
            <p className="mt-10 hidden whitespace-pre-line text-[11px] leading-5 text-white/70 md:block">{data.footer}</p>
          </aside>

          <div className="min-w-0 flex-1 space-y-4 p-3 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-navy md:text-3xl">{v.title}</h3>
                <p className="mt-1 text-sm text-ink-2">{v.subtitle}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-base font-extrabold text-white">
                  {v.user.initial}
                </span>
                <div className="leading-5">
                  <p className="text-sm font-bold text-navy">{v.user.name}</p>
                  <p className="text-xs text-ink-2">{v.user.role}</p>
                </div>
              </div>
            </div>
            {children}
          </div>
    </div>
  );
}

export function UniversityDashboard() {
  const v: V = data.views.find((x: V) => x.id === "university");
  return (
    <Frame v={v}>
      <UniversityView v={v} />
    </Frame>
  );
}

function Points({ v }: { v: V }) {
  return (
    <ol className="mt-6 grid gap-4 md:grid-cols-3">
      {v.points.map((p: V, idx: number) => (
        <li key={p.title} className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue text-sm font-extrabold text-white">
            {idx + 1}
          </span>
          <div>
            <p className="text-base font-extrabold text-navy">{p.title}</p>
            <p className="mt-1 text-sm leading-7 text-ink-2">{p.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CvDashboard() {
  const v: V = data.views.find((x: V) => x.id === "cv");
  return (
    <>
      <Frame v={v}>
        <CvView v={v} />
      </Frame>
      <Points v={v} />
    </>
  );
}

export default function Platform() {
  const views: V[] = data.views;
  const [i, setI] = useState(0);
  const v = views[i];

  return (
    <section id="platform" aria-labelledby="platform-title" className="bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">
            {data.badge}
          </span>
          <h2 id="platform-title" className="mt-3 text-2xl font-extrabold text-navy md:text-3xl">
            {data.title}
          </h2>
          <p className="mt-3 leading-8 text-ink-2">{data.description}</p>
        </div>

        <div role="tablist" aria-label="واجهات المنصة" className="mt-8 flex flex-wrap justify-center gap-2">
          {views.map((x, idx) => (
            <button
              key={x.id}
              id={`plat-tab-${x.id}`}
              role="tab"
              type="button"
              aria-selected={idx === i}
              aria-controls="plat-panel"
              onClick={() => setI(idx)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                idx === i ? "bg-blue text-white" : "border border-line/50 bg-white text-navy hover:border-navy"
              }`}
            >
              {x.tab}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-sm font-bold text-orange-text">{v.angle}</p>

        <Frame
          v={v}
          className="mt-4"
          panel={{ id: "plat-panel", role: "tabpanel", "aria-labelledby": `plat-tab-${v.id}` }}
        >
            {v.id === "journey" && <JourneyView v={v} />}
            {v.id === "cv" && <CvView v={v} />}
            {v.id === "university" && <UniversityView v={v} />}
            {v.id === "employers" && <EmployersView v={v} />}
        </Frame>

        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {v.points.map((p: V, idx: number) => (
            <li key={p.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue text-sm font-extrabold text-white">
                {idx + 1}
              </span>
              <div>
                <p className="text-base font-extrabold text-navy">{p.title}</p>
                <p className="mt-1 text-sm leading-7 text-ink-2">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
