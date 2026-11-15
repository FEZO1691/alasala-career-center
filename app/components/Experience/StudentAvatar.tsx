// صورة الطالب الرمزية: تتطور مع المرحلة (1 إلى 4 سنوات الدراسة، 5 بعد التخرج)
const SOFT = "#f7f6f4";
const SKIN = "#cfe5c0";
const HAIR = "#2b2b2b";
const GOLD = "#b79c55";
const COLORS = ["#3a6e22", "#3f7a24", "#3a6e22", "#7b003a", "#b10035"];

export default function StudentAvatar({ stage, size = 64 }: { stage: number; size?: number }) {
  const i = Math.min(Math.max(stage, 1), 5) - 1;
  const c = COLORS[i];
  const id = `av-clip-${i}`;
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" width={size} height={size} className="shrink-0">
      <defs>
        <clipPath id={id}>
          <circle cx="48" cy="48" r="46" />
        </clipPath>
      </defs>
      <circle cx="48" cy="48" r="46" fill={SOFT} />
      <g clipPath={`url(#${id})`}>
        <path d="M16 86c2-18 16-26 32-26s30 8 32 26a46 46 0 01-64 0z" fill={c} />
        <circle cx="48" cy="38" r="15" fill={SKIN} />
        <path d="M33 36c0-12 8-17 15-17s15 5 15 17c-4-6-9-8-15-8s-11 2-15 8z" fill={HAIR} />
        {i === 0 && (
          <>
            <rect x="54" y="62" width="20" height="24" rx="3" fill="#fff" stroke={c} strokeWidth="2" />
            <path d="M59 69h10M59 74h10M59 79h6" stroke={c} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {i === 1 && (
          <>
            <path d="M40 60l8 16 8-16" fill="none" stroke="#fff" strokeWidth="2.5" />
            <rect x="41" y="74" width="14" height="11" rx="2" fill="#fff" />
            <circle cx="48" cy="78.5" r="2" fill={c} />
          </>
        )}
        {i === 2 && (
          <>
            <rect x="54" y="60" width="20" height="26" rx="3" fill="#fff" stroke={c} strokeWidth="2" />
            <circle cx="64" cy="68" r="3" fill={c} />
            <path d="M58 75h12M58 80h12" stroke={c} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {i === 3 && (
          <>
            <rect x="52" y="66" width="26" height="17" rx="2" fill="#fff" />
            <rect x="55" y="69" width="20" height="11" rx="1" fill={c} />
            <path d="M49 83h32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {i === 4 && (
          <>
            <path d="M18 26l30-13 30 13-30 13z" fill={c} />
            <path d="M30 33v10c0 4 8 8 18 8s18-4 18-8V33" fill="none" stroke={c} strokeWidth="3" />
            <path d="M78 27v14" stroke={GOLD} strokeWidth="3" />
            <circle cx="78" cy="43" r="3" fill={GOLD} />
          </>
        )}
      </g>
      <circle cx="48" cy="48" r="46" fill="none" stroke={c} strokeWidth="3" />
    </svg>
  );
}
