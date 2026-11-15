"use client";

import { useState } from "react";
import type { Stage } from "@/lib/data";
import { agendaFor } from "@/lib/agenda";
import { useNotes } from "./StudentPortal";
import { ANY_STUDENTS, CERT_ST, COMPS, certsFor, readiness, usePortal, ALUM_MENTORS } from "@/lib/portal-store";

const TABS_STU = ["الرئيسية", "الوظائف", "الإرشاد", "الشهادات", "حسابي"];
const TABS_ALM = ["الرئيسية", "الوظائف", "أرشد طالبًا", "الشهادات", "حسابي"];
const ICON = ["M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-5H9v5H5a1 1 0 01-1-1z", "M4 8h16v11H4zM9 8V5h6v3", "M4 5h16v11H9l-5 4z", "M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1z", "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"];

/* معاينة التطبيق: شاشة جوال تقرأ من بيانات البوابات نفسها (قراءة فقط) */
export default function AppPreview({ stage, idx }: { stage: Stage; idx: number }) {
  const st = usePortal();
  const [tab, setTab] = useState(0);
  const alum = idx === 4;
  const s = alum ? ANY_STUDENTS.find((x) => x.id === "a1")! : ANY_STUDENTS.find((x) => x.year === Math.min(idx + 1, 4))!;
  const tabs = alum ? TABS_ALM : TABS_STU;
  const jobs = st.jobs.filter((j) => j.status === "published");
  const certs = certsFor(s).slice(0, 3);
  const ev = st.events[0];
  const notes = useNotes(s).slice(0, 2);
  const agenda = agendaFor(st, s.id).slice(0, 2);
  const R = (n: number) => `${Math.round(n * 20)}%`;

  const Row = ({ t, d }: { t: string; d?: string }) => (
    <li className="rounded-[12px] bg-white p-2.5 shadow-sm">
      <p className="text-[12px] font-extrabold leading-5 text-navy">{t}</p>
      {d && <p className="text-[10.5px] leading-5 text-ink-2">{d}</p>}
    </li>
  );

  let body: React.ReactNode;
  if (tab === 0)
    body = (
      <>
        <div className="rounded-[14px] bg-blue p-3 text-white">
          <p className="text-[10px] opacity-95">{alum ? `خريج دفعة ${(s as { gradYear?: number }).gradYear}` : `${stage.year} · ${stage.name}`}</p>
          <p className="mt-1 text-[13px] font-extrabold leading-6">أهلًا {s.name.split(" ")[0]}</p>
          <p className="text-[11px] leading-5 opacity-90">{stage.goal}</p>
        </div>
        <p className="mt-3 text-[11px] font-extrabold text-navy">مهامك الآن</p>
        <ul className="mt-1 space-y-1.5">{stage.services.slice(0, 3).map((x) => <Row key={x.id} t={x.text} />)}</ul>
        <p className="mt-3 text-[11px] font-extrabold text-navy">جدولي القادم</p>
        <ul className="mt-1 space-y-1.5">
          {agenda.length ? agenda.map((a) => <Row key={a.id} t={`${a.kind}: ${a.title}`} d={a.when} />) : ev ? <Row t={`متاح: ${ev.title}`} d={`${ev.date} · ${ev.place}`} /> : <Row t="لا مواعيد" />}
        </ul>
        {notes.length > 0 && (
          <>
            <p className="mt-3 text-[11px] font-extrabold text-navy">إشعارات</p>
            <ul className="mt-1 space-y-1.5">{notes.map((n) => <Row key={n.id} t={n.title} d={n.text} />)}</ul>
          </>
        )}
      </>
    );
  else if (tab === 1)
    body = (
      <>
        <p className="text-[11px] font-extrabold text-navy">وظائف ومشاريع مطابق لملفك</p>
        <ul className="mt-1 space-y-1.5">
          {jobs.length ? jobs.map((j) => <Row key={j.id} t={j.title} d={`${j.type} · ${j.city} · آخر موعد ${j.deadline}`} />) : <Row t="لا فرص منشورة الآن" />}
        </ul>
        <button type="button" className="mt-3 w-full rounded-[10px] bg-teal py-2 text-[11px] font-bold text-white">تقدّم بضغطة</button>
      </>
    );
  else if (tab === 2)
    body = alum ? (
      <>
        <p className="text-[11px] font-extrabold text-navy">طلبات الطلاب لإرشادك</p>
        <ul className="mt-1 space-y-1.5">
          {st.alumReqs.length ? st.alumReqs.slice(0, 3).map((r) => <Row key={r.id} t={ANY_STUDENTS.find((x) => x.id === r.studentId)?.name ?? ""} d={r.topic} />) : <Row t="لا طلبات حتى الآن" d={`${ALUM_MENTORS.length} خريجًا متطوعًا في الشبكة`} />}
        </ul>
        <div className="mt-3 flex gap-2"><span className="flex-1 rounded-[10px] bg-teal py-2 text-center text-[11px] font-bold text-white">قبول</span><span className="flex-1 rounded-[10px] border border-navy py-2 text-center text-[11px] font-bold text-navy">اعتذار</span></div>
      </>
    ) : (
      <>
        <p className="text-[11px] font-extrabold text-navy">احجز جلسة مع مرشدك</p>
        <ul className="mt-1 space-y-1.5">
          <Row t="اختيار المسار" d="غدًا 10:00" />
          <Row t="مراجعة السيرة" d="الأحد 11:30" />
          <Row t="التحضير للمقابلة" d="الاثنين 13:00" />
        </ul>
        <p className="mt-3 text-[11px] font-extrabold text-navy">مرشدون من الخريجين</p>
        <ul className="mt-1"><Row t={ALUM_MENTORS[0].name} d={`يرشد في: ${ALUM_MENTORS[0].topic}`} /></ul>
      </>
    );
  else if (tab === 3)
    body = (
      <>
        <p className="text-[11px] font-extrabold text-navy">شهادات مهنية مناسبة</p>
        <ul className="mt-1 space-y-1.5">
          {certs.length ? certs.map((c) => <Row key={c.id} t={c.name} d={`${c.body} · ${c.duration}`} />) : <Row t="تظهر في السنة الرابعة" />}
        </ul>
      </>
    );
  else
    body = (
      <>
        <p className="text-[11px] font-extrabold text-navy">جداراتي</p>
        <ul className="mt-1 space-y-1.5">
          {COMPS.slice(0, 5).map((c) => {
            const v = (s.scores as Record<string, number>)[c.id] ?? 0;
            return (
              <li key={c.id} className="text-[10.5px]">
                <span className="flex justify-between font-bold text-navy"><span>{c.name}</span><span dir="ltr">{v}/5</span></span>
                <span className="mt-0.5 block h-1.5 rounded-full bg-[#e5e0da]"><span className="block h-full rounded-full bg-teal" style={{ width: R(v) }} /></span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[10.5px] text-ink-2">الجاهزية العامة: <span dir="ltr" className="font-bold text-navy">{readiness(s).toFixed(1)} / 5</span>{Object.keys(st.certPlan).length ? "" : ""}</p>
        <p className="mt-1 text-[10.5px] text-ink-2">حالة الشهادات: {Object.values(CERT_ST).join("، ")}</p>
      </>
    );

  return (
    <div className="mx-auto w-[300px] shrink-0 rounded-[38px] border-[7px] border-navy bg-blue p-0 shadow-xl" role="group" aria-label="معاينة التطبيق">
      <div className="relative overflow-hidden rounded-[30px] bg-[#f4f2ef]">
        <div className="flex items-center justify-between bg-white px-4 pb-1.5 pt-3 text-[10px] font-bold text-ink-2"><span>مركز المسار المهني</span><span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-blue/20" /></div>
        <div className="h-[392px] overflow-y-auto px-3 pb-3 pt-2.5">{body}</div>
        <nav aria-label="تنقل التطبيق" className="grid grid-cols-5 border-t border-line/30 bg-white">
          {tabs.map((t, i) => (
            <button key={t} type="button" aria-current={i === tab ? "page" : undefined} onClick={() => setTab(i)} className={`flex flex-col items-center gap-0.5 px-0.5 py-2 text-[9.5px] font-bold ${i === tab ? "text-orange-text" : "text-ink-2"}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d={ICON[i]} /></svg>
              {t}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
