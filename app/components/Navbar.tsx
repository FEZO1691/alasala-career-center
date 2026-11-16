"use client";

import { useEffect, useRef, useState } from "react";
import type { Gateway } from "@/lib/data";
import { scrollToSection } from "@/lib/scroll";
import { goTab, usePage, type Page } from "@/lib/route";

type Item = { label: string; hint?: string; section?: string; page?: Page; tab?: string; hash?: string };
type Entry = { label: string; title: string; desc: string; cta: string; icon: string; color: string; href: string; page?: Page; items: Item[] };

const MENU: Entry[] = [
 {
   label: "الرئيسية",
   title: "الصفحة الرئيسية",
   desc: "تعرّف على المركز ورحلة الطالب والتطبيق وقصص النجاح.",
   cta: "إلى أعلى الصفحة",
   icon: "home",
   color: "#7bbb58",
   href: "#",
   items: [
     { label: "رحلة الطالب", hint: "خمس محطات من أول سنة إلى ما بعد التخرج", section: "journey" },
     { label: "التطبيق", hint: "معاينة تطبيق الطالب والخريج", section: "app" },
     { label: "كيف يعمل", hint: "أربع خطوات من الدخول إلى النتائج", section: "how" },
     { label: "الفعاليات", hint: "ورش ولقاءات قادمة", section: "events" },
     { label: "قصص النجاح", hint: "ثلاث قصص بالفيديو", section: "stories" },
     { label: "الشركاء", hint: "الشركات التي توظف وتدرّب", section: "partners" },
     { label: "أسئلة شائعة", section: "faq" },
   ],
 },
 {
   label: "الطالب",
   title: "بوابة الطالب",
   desc: "رحلتك المهنية من السنة الأولى: ملفك ووظائفك وإرشادك.",
   cta: "ادخل بوابة الطالب",
   icon: "cap",
   color: "#7bbb58",
   href: "#student",
   items: [["j", "رحلتي"], ["p", "ملفي ومهاراتي"], ["sem", "الفصول"], ["jobs", "الوظائف والمشاريع"], ["ch", "تحديات الأعمال"], ["offers", "العروض والإشعارات"], ["counsel", "الإرشاد"], ["gc", "الشهادات المهنية"], ["coach", "المدرب الذكي"]].map(([tab, label]) => ({ label, page: "student" as Page, tab })),
 },
 {
   label: "الخريجون",
   title: "بوابة الخريجين",
   desc: "وظائف وإرشاد وشهادات، وتطوع بالإرشاد لزملائك.",
   cta: "ادخل بوابة الخريجين",
   icon: "ribbon",
   color: "#7bbb58",
   href: "#alumni",
   items: [["j", "رحلتي"], ["p", "ملفي"], ["jobs", "الوظائف"], ["offers", "العروض والإشعارات"], ["counsel", "الإرشاد وطلبات الطلاب"], ["gc", "الشهادات المهنية"], ["coach", "المدرب الذكي"]].map(([tab, label]) => ({ label, page: "alumni" as Page, tab })),
 },
 {
   label: "أصحاب العمل",
   title: "بوابة أصحاب العمل",
   desc: "ابحث بالجدارات، وانشر وظائفك وتحديات أعمالك.",
   cta: "ادخل بوابة أصحاب العمل",
   icon: "bag",
   color: "#7bbb58",
   href: "#employers",
   items: ["استكشاف الخريجين", "القائمة القصيرة", "المتقدمون", "تحديات الأعمال", "الوظائف", "الشركة"].map((label, i) => ({ label, page: "employers" as Page, tab: String(i) })),
 },
 {
   label: "المركز",
   title: "بوابة المركز",
   desc: "جلسات المرشدين وطلابهم والفعاليات.",
   cta: "ادخل بوابة المركز",
   icon: "compass",
   color: "#7bbb58",
   href: "#center",
   items: ["لوحة اليوم", "الجلسات", "طلابي", "الفعاليات", "الفريق"].map((label, i) => ({ label, page: "center" as Page, tab: String(i) })),
 },
 {
   label: "الجامعة",
   title: "بوابة الجامعة",
   desc: "نتائج الدفعة والاعتمادات والتقارير.",
   cta: "ادخل بوابة الجامعة",
   icon: "bank",
   color: "#7bbb58",
   href: "#university",
   items: ["لوحة القيادة", "الطلاب", "التحقق", "الأداء والمقارنة", "المهارات والمناهج", "خدمات المركز", "الاعتمادات", "المشاريع", "أصحاب العمل", "الوجهة والتقارير", "الخريجون"].map((label, i) => ({ label, page: "university" as Page, tab: String(i) })),
 },
];

const ICONS: Record<string, string> = {
 home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
 grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
 cap: "M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.500 6-3v-4.500M22 9v6",
 ribbon: "M12 3a5 5 0 100 10 5 5 0 000-10zM8.500 12.500L7 21l5-3 5 3-1.500-8.500",
 bag: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
 compass: "M12 3a9 9 0 100 18 9 9 0 000-18zM15.500 8.500l-2 5-5 2 2-5z",
 lens: "M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l5 5M8 11h6M11 8v6",
  bank: "M3 9l9-5 9 5M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20h18",
};

function Icon({ name, className = "h-[18px] w-[18px]" }: { name: string; className?: string }) {
 return (
   <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
     <path d={ICONS[name]} />
   </svg>
 );
}

const PAGE_OF: Record<string, Page> = { "#student": "student", "#alumni": "alumni", "#employers": "employers", "#center": "center", "#university": "university" };

export default function Navbar({ gateways }: { gateways: Gateway[] }) {
 void gateways;
 const page = usePage();
 const [open, setOpen] = useState<number | null>(null);
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const wrap = useRef<HTMLUListElement>(null);

 const show = (i: number) => {
   if (timer.current) clearTimeout(timer.current);
   setOpen(i);
 };
 const hide = () => {
   if (timer.current) clearTimeout(timer.current);
   timer.current = setTimeout(() => setOpen(null), 160);
 };

 useEffect(() => {
   const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
   const onDown = (e: PointerEvent) => {
     if (!wrap.current?.contains(e.target as Node)) setOpen(null);
   };
   document.addEventListener("keydown", onKey);
   document.addEventListener("pointerdown", onDown);
   return () => {
     document.removeEventListener("keydown", onKey);
     document.removeEventListener("pointerdown", onDown);
   };
 }, []);

 const go = (it: Item) => {
   setOpen(null);
   if (it.hash) window.location.hash = it.hash;
    else if (it.section) {
     if (page === "home") scrollToSection(it.section);
     else {
       window.location.hash = `#${it.section}`;
     }
   } else if (it.page && it.tab !== undefined) goTab(it.page, it.tab);
   else if (it.page) window.location.hash = `#${it.page}`;
 };

 const top = (e: React.MouseEvent, m: Entry) => {
   setOpen(null);
   if (!PAGE_OF[m.href] && page === "home") {
     e.preventDefault();
     if (m.href === "#") window.scrollTo({ top: 0, behavior: "smooth" });
     else scrollToSection(m.href.slice(1));
   }
 };

 return (
   <header className="sticky top-0 z-30 border-b-4 border-[#cdb774] border-t-[6px] border-t-[#b10035] bg-white">
     <nav aria-label="التنقل الرئيسي" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-4 sm:gap-x-6 sm:px-6">
       <a href="#" className="flex flex-col items-start gap-1">
         {/* eslint-disable-next-line @next/next/no-img-element */}
         <img src="logo.png" alt="كليات الأصالة" height={68} style={{ height: 68, width: "auto" }} />
         <span className="text-[11px] font-semibold leading-none text-ink-2 sm:text-xs">مركز المسار المهني · كلية الحقوق</span>
       </a>

       <ul ref={wrap} className="order-3 flex w-full items-center gap-0.5 overflow-x-auto whitespace-nowrap pb-1 md:flex-wrap md:justify-center md:overflow-visible md:pb-0 xl:order-none xl:w-auto xl:flex-nowrap">
         {MENU.map((m, i) => {
           const cur = PAGE_OF[m.href] === page || (m.href === "#" && page === "home" && false);
           const isOpen = open === i;
           const left = i >= 5;
           return (
             <li
               key={m.href}
               className="shrink-0 md:relative"
               onMouseEnter={() => show(i)}
               onMouseLeave={hide}
               onFocus={() => show(i)}
               onBlur={(e) => {
                 if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide();
               }}
             >
               <a
                 href={m.href}
                 onClick={(e) => top(e, m)}
                 aria-haspopup="true"
                 aria-expanded={isOpen}
                 aria-current={cur ? "page" : undefined}
                 className={`group flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[13px] font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue ${cur || isOpen ? "bg-[#3f7a24] text-white" : "text-black hover:bg-[#3f7a24] hover:text-white"}`}
               >
                 <span className="group-hover:!text-white" style={cur || isOpen ? { color: "#fff" } : { color: m.color }}><Icon name={m.icon} /></span>
                 {m.label}
                 <svg aria-hidden="true" viewBox="0 0 12 12" className={`hidden h-2.5 w-2.5 opacity-50 transition-transform 2xl:block ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l4 4 4-4" /></svg>
               </a>
               {isOpen && (
                 <div
                   role="menu"
                   aria-label={m.title}
                   className="nav-pop absolute top-full z-40 hidden pt-3 md:block"
                   style={left ? { insetInlineEnd: 0 } : { insetInlineStart: 0 }}
                 >
                   <div className="w-[min(30rem,92vw)] overflow-hidden rounded-[18px] border border-line/30 bg-white shadow-2xl ring-1 ring-black/5">
                     <div className="flex items-start gap-3 p-4 text-white" style={{ background: `linear-gradient(135deg, ${m.color}, #7bbb58)` }}>
                       <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15"><Icon name={m.icon} className="h-6 w-6" /></span>
                       <span className="min-w-0">
                         <span className="block text-base font-extrabold">{m.title}</span>
                         <span className="mt-0.5 block text-xs leading-5 text-white/85">{m.desc}</span>
                       </span>
                     </div>
                     <ul className="grid max-h-[55vh] gap-1 overflow-y-auto p-2 sm:grid-cols-2">
                       {m.items.map((it) => (
                         <li key={it.label} role="none">
                           <button
                             type="button"
                             role="menuitem"
                             onClick={() => go(it)}
                             className="group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start transition hover:bg-bg-soft focus:bg-bg-soft focus:outline-none"
                           >
                             <span aria-hidden="true" className="h-8 w-1 shrink-0 rounded-full opacity-25 transition-all group-hover:opacity-100 group-focus:opacity-100" style={{ background: m.color }} />
                             <span className="min-w-0 flex-1">
                               <span className="block text-sm font-bold text-navy">{it.label}</span>
                               {it.hint && <span className="block text-[11px] leading-5 text-ink-2">{it.hint}</span>}
                             </span>
                             <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0 -translate-x-1 text-ink-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 group-focus:opacity-100" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2L4 6l4 4" /></svg>
                           </button>
                         </li>
                       ))}
                     </ul>
                     <a
                       href={m.href}
                       onClick={(e) => top(e, m)}
                       className="flex items-center justify-between border-t border-line/30 bg-bg-soft px-4 py-3 text-sm font-extrabold hover:bg-bg"
                       style={{ color: m.color }}
                     >
                       {m.cta}
                       <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2L4 6l4 4" /></svg>
                     </a>
                   </div>
                 </div>
               )}
             </li>
           );
         })}
       </ul>
     </nav>
   </header>
 );
}
