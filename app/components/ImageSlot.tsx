/* مساحة صورة: تظهر كلوحة هادئة بوصف ما يُقترح وضعه، وتُستبدل بصورة حقيقية بتمرير src.
   ضع الصور في public/images ثم مرّر المسار، وستملأ المساحة بنفس القياس. */
export default function ImageSlot({
  label,
  src,
  alt = "",
  pos = "center 30%",
  ratio = "4 / 3",
  className = "",
  tone = "light",
}: {
  label: string;
  src?: string;
  alt?: string;
  pos?: string;
  ratio?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  if (src)
    return (
      <div className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: ratio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt || label} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: pos }} />
      </div>
    );
  const dark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={`مساحة صورة: ${label}`}
      className={`relative flex w-full items-center justify-center overflow-hidden ${className}`}
      style={{ aspectRatio: ratio, background: dark ? "linear-gradient(135deg,#b10035,#1e1e1e)" : "linear-gradient(135deg,#f3ecdc,#ebe1c8)" }}
    >
      <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute h-1/2 max-h-32 opacity-[0.12]" fill="none" stroke={dark ? "#fff" : "#3f7a24"} strokeWidth="2">
        <rect x="6" y="12" width="52" height="40" rx="5" />
        <circle cx="22" cy="28" r="5" />
        <path d="M8 46l16-14 12 10 8-7 12 11" />
      </svg>
      <span className={`relative max-w-[80%] rounded-full px-3 py-1 text-center text-[11px] font-bold ${dark ? "bg-white/15 text-white" : "bg-white/80 text-navy"}`}>{label}</span>
    </div>
  );
}
