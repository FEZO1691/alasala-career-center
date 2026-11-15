export default function Closing() {
  return (
    <section aria-labelledby="closing-title" className="bg-[#eef6e8] text-navy">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-24">
        <h2 id="closing-title" className="text-2xl font-extrabold md:text-4xl md:leading-snug">
          شاهد المركز المهني كما سيظهر لجامعتك
        </h2>
        <p className="mt-4 leading-8 text-bg-soft">
          تصفّح الرحلة والخدمات والمهارات والنتائج كما ستُعرض لطلاب جامعتك.
        </p>
        <a
          href="#journey"
          className="mt-8 inline-block rounded-[12px] bg-white px-8 py-3 font-bold text-navy transition-colors hover:bg-bg-soft"
        >
          ابدأ من رحلة الطالب
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t-4 border-[#cdb774] bg-[#b10035] text-white">
      <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-white sm:px-6">
        كليات الأصالة، كلية الحقوق | نموذج تجريبي، البيانات المعروضة توضيحية
      </p>
    </footer>
  );
}
