"use client";

import type { Gateway } from "@/lib/data";
import ImageSlot from "./ImageSlot";
import { usePortal } from "@/lib/portal-store";

/* الصفحة الرئيسية (النسخة 2): على بنية صفحة مركز المستقبل المهني في NUS
   شريط روابط سريعة، عنوان كبير مع صور، ثلاث بوابات، فعاليات، رسالة ختامية */

export function QuickBar() {
  return (
    <div className="border-b border-line/40 bg-bg-soft text-sm text-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
        <a href="#student" className="hover:underline">بوابة الوظائف</a>
        <a href="#student" className="hover:underline">قياس الجاهزية</a>
        <a href="#events" className="hover:underline">الفعاليات</a>
        <span className="ms-auto rounded-full border border-ink-2 px-3 text-xs">English</span>
      </div>
    </div>
  );
}

export function HeroV2() {
  const usePh = usePortal();
  const sessions = 1280 + usePh.bookings.filter((b) => b.status === "done").length;
  return (
    <section aria-labelledby="hero-title" className="bg-[#eaf3e3] text-navy">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-28 pt-12 sm:px-6 md:grid-cols-[1.1fr_.9fr] md:pb-32 md:pt-16">
        <div>
          <p className="inline-block rounded-full border border-orange-text px-3 py-1 text-sm font-semibold text-orange-text">مركز المسار المهني · كلية الحقوق</p>
          <h1 id="hero-title" className="mt-4 text-3xl font-extrabold leading-snug sm:text-4xl md:text-5xl md:leading-[1.35]">
            لا تكتفِ بالجاهزية. كن <span className="text-[#b10035]">جاهزًا للمستقبل</span> القانوني.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-ink-2 sm:text-lg">
            من السنة الأولى حتى أول وظيفة، يرافقك المركز بإرشاد فردي وفرص تدريب وأدوات تقيس تقدمك وتوجّه خطوتك التالية.
          </p>
          <a href="#gateways" className="mt-7 inline-block rounded-[10px] bg-blue px-7 py-3 font-semibold text-white transition-colors hover:bg-blue-bright">ابدأ الآن</a>
        </div>
        <div className="relative mx-auto grid w-full max-w-[520px] grid-cols-2 grid-rows-[150px_150px] gap-3.5 sm:grid-rows-[200px_200px]">
          <div className="row-span-2 overflow-hidden rounded-[18px]">
            <ImageSlot label="طالب وطالبة يعملان على حاسوب" src="./images/hero-1.jpg" pos="50% 40%" ratio="auto" tone="dark" className="h-full" />
          </div>
          <div className="overflow-hidden rounded-[18px]">
            <ImageSlot label="جلسة إرشاد فردي" src="./images/hero-3.jpg" pos="50% 40%" ratio="auto" tone="dark" className="h-full" />
          </div>
          <div className="overflow-hidden rounded-[18px]">
            <ImageSlot label="خريجان يراجعان ملفًا مهنيًا" src="./images/gw-alumni.jpg" pos="60% 40%" ratio="auto" tone="dark" className="h-full" />
          </div>
          <div className="absolute -start-3 bottom-4 rounded-[14px] border-s-[5px] border-[#b10035] bg-white px-4 py-2.5 text-xs leading-5 text-ink shadow-xl">
            <b className="block text-xl text-orange-text" dir="ltr">{sessions.toLocaleString("en")}</b>
            جلسة إرشاد منفذة
          </div>
        </div>
      </div>
    </section>
  );
}

const AUD: Record<string, { href: string; src: string; img: string; cta: string; tags: string[] }> = {
  student: { href: "#student", src: "gw-student", img: "طالب يعمل على حاسوبه في بيئة مهنية", cta: "ابدأ الآن", tags: ["رحلتي", "الوظائف والمشاريع", "الإرشاد"] },
  employer: { href: "#employers", src: "gw-employer", img: "فريق استقطاب في اجتماع", cta: "تعرّف على طلابنا", tags: ["استكشاف الخريجين", "الوظائف", "التحديات"] },
  alumni: { href: "#alumni", src: "gw-alumni", img: "خريجون في لقاء مهني", cta: "ابقَ على تواصل", tags: ["الوظائف", "الشهادات", "تطوع بالإرشاد"] },
};
const ORDER = ["student", "employer", "alumni"];

export function AudiencesV2({ gateways }: { gateways: Gateway[] }) {
  const items = ORDER.map((id) => gateways.find((g) => g.id === id)).filter(Boolean) as Gateway[];
  return (
    <section aria-labelledby="gw-title" className="bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div id="gateways" className="scroll-mt-28">
          <h2 id="gw-title" className="text-2xl font-extrabold text-navy md:text-4xl">اختر بوابتك</h2>
          <p className="mt-2 max-w-2xl leading-8 text-ink-2">ثلاث بوابات تجمع كل ما يحتاجه الطالب وصاحب العمل والخريج في مكان واحد، وكل ما تفعله فيها يصل إلى الباقين.</p>
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {items.map((g, i) => {
            const a = AUD[g.id];
            const ico = i === 0 ? "bg-blue text-white" : i === 1 ? "bg-[#b10035] text-white" : "bg-gold text-[#2b2410]";
            return (
              <li key={g.id} className="flex flex-col overflow-hidden rounded-[16px] border border-line/40 bg-white shadow-sm">
                <ImageSlot label={a.img} src={`./images/${a.src}.jpg`} ratio="16 / 9" pos="center 35%" />
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className={`-mt-12 flex h-12 w-12 items-center justify-center rounded-[14px] border-4 border-white text-lg font-extrabold ${ico}`}>{i + 1}</span>
                  <h3 className="text-xl font-extrabold text-navy">{g.panelTitle}</h3>
                  <p className="flex-1 text-sm leading-7 text-ink-2">{g.who}</p>
                  <ul className="flex flex-wrap gap-2">
                    {a.tags.map((t) => (
                      <li key={t} className="rounded-full bg-bg-soft px-3 text-xs text-ink-2">{t}</li>
                    ))}
                  </ul>
                  <a href={a.href} className={`rounded-[10px] px-5 py-2.5 text-center font-semibold ${i === 0 ? "bg-blue text-white hover:bg-blue-bright" : "border-2 border-orange-text text-orange-text hover:bg-bg-soft"}`}>{a.cta}</a>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 text-sm text-ink-2">
          فريق المركز: <a href="#center" className="font-bold text-orange-text hover:underline">بوابة المرشد</a> · الإدارة: <a href="#university" className="font-bold text-orange-text hover:underline">بوابة الجامعة</a>
        </p>
      </div>
    </section>
  );
}

const EV_IMG: Record<string, string> = { "معرض": "ev-fair", "ورشة": "ev-workshop", "لقاء": "ev-alumni", "ساعات مفتوحة": "ev-open" };

export function EventsV2() {
  const events = usePortal().events;
  return (
    <section id="events" aria-labelledby="ev-title" className="scroll-mt-20 bg-bg-soft">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <h2 id="ev-title" className="text-2xl font-extrabold text-navy md:text-4xl">الفعاليات القادمة</h2>
        <p className="mt-2 text-ink-2">ورش ولقاءات ومعارض تقرّبك من سوق العمل.</p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((e) => (
            <li key={e.id} className="flex flex-col overflow-hidden rounded-[16px] border border-line/40 bg-white shadow-sm">
              <ImageSlot label={e.title} src={`./images/${EV_IMG[e.type] ?? "ev-fair"}.jpg`} pos={e.type === "ورشة" ? "70% center" : "center 30%"} ratio="16 / 10" />
              <div className="flex items-center justify-between gap-2 border-b border-line/30 bg-bg-soft px-5 py-3">
                <b className="text-sm text-navy">{e.date}</b>
                <span className="rounded-full bg-[#b10035] px-3 text-xs font-semibold text-white">{e.type}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-base font-extrabold leading-7 text-navy">{e.title}</h3>
                <p className="text-xs font-semibold text-orange-text">{e.place}</p>
                <p className="flex-1 text-sm leading-7 text-ink-2">{e.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-ink-2">مواعيد تجريبية. يديرها فريق المركز من بوابته.</p>
      </div>
    </section>
  );
}

export function ValueBand() {
  return (
    <section aria-labelledby="cta-title" className="relative bg-[#233f14] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url(./images/closing.jpg)" }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-[#1e3c10]/95 to-[#1e3c10]/75" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <h2 id="cta-title" className="text-2xl font-extrabold md:text-4xl">كن جاهزًا للمستقبل.</h2>
          <p className="mt-3 max-w-xl leading-8 text-[#e6f0df]">سواء كنت تفكر في مسارك الأول أو تستعد لأول وظيفة، فريق المركز هنا ليسمع طموحك ويساعدك على الوصول إليه.</p>
        </div>
        <a href="#student" className="rounded-[10px] bg-white px-7 py-3 text-center font-bold text-[#35651f] hover:bg-bg-soft">ابدأ من بوابة الطالب</a>
      </div>
    </section>
  );
}
