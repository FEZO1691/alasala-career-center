// شاشة مؤقتة "قيد البناء" تعرض عنوان الشاشة فقط (تُبنى في المرحلة التالية)
export default function ScreenPlaceholder({
  title,
  onBack,
}: {
  title: string;
  /** زر رجوع للشاشات التي تُفتح من بطاقات الرئيسية */
  onBack?: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-xl font-extrabold text-navy">{title}</h2>
      <span className="rounded-full border border-dashed border-line px-3 py-1 text-xs font-bold text-ink-2">
        قيد البناء
      </span>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-2 rounded-[12px] border border-blue px-4 py-2 text-sm font-bold text-orange-text transition-colors hover:bg-bg-soft"
        >
          رجوع إلى الرئيسية
        </button>
      )}
    </div>
  );
}

export function LockedScreen({ title, reason }: { title: string; reason?: string }) {
  return (
    <div role="status" className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 text-ink-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      <h2 className="text-lg font-extrabold text-navy">{title}</h2>
      <p className="text-sm font-semibold leading-7 text-ink">هذه الشاشة مقفلة</p>
      {reason && <p className="text-sm leading-7 text-ink-2">{reason}</p>}
    </div>
  );
}
