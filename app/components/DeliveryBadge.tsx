import type { Skill } from "@/lib/data";

// لون كل جهة تقديم: الجامعة أخضر، المركز أزرق، الوحدات الاختيارية تيل
export const DELIVERY = {
  university: { label: "تغطيها الجامعة", border: "border-green", dot: "bg-green" },
  center: { label: "يغطيها المركز", border: "border-blue", dot: "bg-blue" },
  optional: { label: "وحدة اختيارية", border: "border-teal", dot: "bg-teal" },
} as const;

export default function DeliveryBadge({ delivery }: { delivery: Skill["delivery"] }) {
  const d = DELIVERY[delivery];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold text-navy ${d.border}`}
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${d.dot}`} />
      {d.label}
    </span>
  );
}
