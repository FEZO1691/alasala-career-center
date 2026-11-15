import type { University } from "@/lib/data";

export default function Hero({ university }: { university: University }) {
  const { stages } = university;
  return (
    <section aria-labelledby="hero-title" className="bg-bg">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-title"
            className="text-3xl font-extrabold leading-snug text-navy sm:text-4xl md:text-5xl md:leading-snug"
          >
            مركز مهني متكامل لجامعتك، يرافق الطالب من أول سنة حتى بعد التخرج
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink-2 sm:text-lg">
            إرشاد وخدمات وفرص ومؤشرات قياس، مبنية على معيار NACE وقاموس المهارات
            الوطني، ومصممة لتُطبَّق على جامعتك.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="#journey"
              className="rounded-[12px] bg-blue px-7 py-3 text-center font-bold text-white shadow-sm transition-colors hover:bg-blue-bright"
            >
              شاهد رحلة الطالب
            </a>
            <a
              href="#mis"
              className="rounded-[12px] border border-blue px-7 py-3 text-center font-bold text-orange-text transition-colors hover:bg-bg-soft"
            >
              شاهد نموذج كلية الحقوق
            </a>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <p className="mb-6 text-center text-sm font-semibold text-ink-2">
            رحلة الطالب في خمس مراحل
          </p>
          <ol className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-5 md:gap-4">
            {/* الخط الواصل بين المراحل: عمودي في الموبايل وأفقي في الكمبيوتر */}
            <span
              aria-hidden="true"
              className="absolute bottom-6 start-[19px] top-6 w-0.5 bg-line/50 md:bottom-auto md:start-[10%] md:end-[10%] md:top-[19px] md:h-0.5 md:w-auto"
            />
            {stages.map((s) => (
              <li
                key={s.id}
                className="relative flex items-center gap-4 md:flex-col md:gap-3 md:text-center"
              >
                <span className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue bg-bg text-base font-bold text-orange-text">
                  {s.id}
                </span>
                <span>
                  <span className="block font-bold text-navy">{s.name}</span>
                  <span className="block text-sm text-ink-2">{s.year}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
