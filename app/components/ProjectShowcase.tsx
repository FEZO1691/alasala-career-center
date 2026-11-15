import d from "@/data/universities/demo/projects-done.json";

/* معرض مشاريع الدفعة السابقة: ما أُسند إلى الطلاب في الفصل الثامن وسلّموه */
export default function ProjectShowcase() {
  return (
    <section aria-labelledby="ps-title" className="rounded-[14px] border border-[#e6e0d9] bg-white p-5">
      <h4 id="ps-title" className="text-base font-extrabold text-navy">{d.title}</h4>
      <p className="mt-1 text-xs leading-6 text-ink-2">{d.text}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {d.items.map((p) => (
          <li key={p.title} className="rounded-[12px] bg-[#f8f6f3] p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-orange-text">{p.company} · {p.sector}</span>
              <span className="shrink-0 rounded-full bg-[#e3f0d9] px-2.5 py-0.5 text-[11px] font-bold text-[#3a6e22]">تقييم {p.rating} من 5</span>
            </div>
            <p className="mt-1 text-sm font-extrabold text-navy">{p.title}</p>
            <p className="mt-1 text-xs leading-6 text-ink-2">{p.brief}</p>
            <p className="mt-2 text-xs text-ink"><b>المخرجات: </b>{p.deliverable} · فريق من {p.team} طلاب</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.skills.map((k) => <span key={k} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-navy">{k}</span>)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
