import type { JourneyPeriod, JourneyScreenDef, JourneyScreenId, Skill, Stage } from "@/lib/data";
import { centerUnitRoleAt } from "@/lib/skills";
import DeliveryBadge from "../DeliveryBadge";

type Props = {
  period: JourneyPeriod;
  stage: Stage;
  /** مهارات المركز في هذا الفصل (من skills.json) */
  centerSkills: Skill[];
  screenId: JourneyScreenId;
  screenDef: JourneyScreenDef;
  screenState: JourneyPeriod["screens"][JourneyScreenId];
  /** ما تبلّغ به الشاشة المفتوحة عن حالتها الآن (يفضَّل على وصف الشاشة العام) */
  seesLive?: string | null;
};

const statusStyle = {
  have: { label: "موجود", dot: "bg-green" },
  new: { label: "مقترح", dot: "bg-blue" },
} as const;

const Draft = () => (
  <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-ink-2">
    مبدئي
  </span>
);

function Tick({ done }: { done: boolean }) {
  return done ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0 text-green">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path d="M6 10.5l2.7 2.7L14 7.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1 h-5 w-5 shrink-0 text-line">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// الشرح (يمين الشاشة): ما يحدث للطالب في الفصل المختار وما يقدمه المركز
export default function ExplainPanel({ period, stage, centerSkills, screenId, screenDef, screenState, seesLive }: Props) {
  const stageLine = period.year === null ? stage.name : `${stage.year} · ${stage.name}`;
  const seesBase = seesLive ?? screenDef.sees;
  const seesNote =
    screenState.state === "locked"
      ? `هذه الشاشة مقفلة: ${screenState.reason}`
      : screenState.note
        ? `${seesBase} (${screenState.note})`
        : seesBase;

  return (
    <div
      id="exp-content"
      role="tabpanel"
      aria-labelledby={`exp-tab-${period.year === null ? "graduate" : `year-${period.year}`}`}
      className="rounded-[12px] border border-line/40 bg-bg-soft p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm font-bold text-orange-text">{stageLine}</p>
      <h3 className="mt-1 text-xl font-extrabold text-navy sm:text-2xl">
        {typeof period.id === "number" && <span className="text-orange-text">الفصل {period.id}: </span>}
        {period.title}
      </h3>
      <p className="mt-3 flex flex-wrap items-center gap-2 leading-8 text-ink">
        {period.headline}
        {period.draft && <Draft />}
      </p>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-bold text-orange-text">ما يحدث الآن</h4>
        <ul className="space-y-2">
          {period.tasks.map((t) => (
            <li key={t.text} className="flex items-start gap-2 leading-7 text-ink">
              <Tick done={t.status === "done"} />
              <span>
                {t.text}
                {t.optional && <span className="ms-2 text-xs font-semibold text-ink-2">(اختياري)</span>}
                {t.proposed && <span className="ms-2 text-xs font-semibold text-orange-text">(مقترح)</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-bold text-orange-text">ما يقدمه المركز</h4>
        <ul className="space-y-2">
          {period.services.map((sid) => {
            const svc = stage.services.find((s) => s.id === sid)!;
            const st = statusStyle[svc.status];
            return (
              <li
                key={sid}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line/40 bg-bg px-4 py-2.5"
              >
                <span className="leading-7 text-ink">{svc.text}</span>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-ink-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {centerSkills.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-bold text-orange-text">المهارة التي يقدمها المركز في هذا الفصل</h4>
          <ul className="space-y-2">
            {centerSkills.map((s) => {
              const role = typeof period.id === "number" ? centerUnitRoleAt(s, period.id) : null;
              return (
                <li key={s.id} className="rounded-[12px] border border-line/40 bg-bg px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-bold text-navy">{s.name}</span>
                    <DeliveryBadge delivery={s.delivery} />
                  </div>
                  {s.centerUnit && (
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm leading-7 text-ink">
                      {s.centerUnit.title}
                      {s.centerUnit.draft && <Draft />}
                    </p>
                  )}
                  {role && (
                    <p className="text-xs text-ink-2">
                      {role === "intro" ? "تُقدَّم في هذا الفصل" : "تعزيز في هذا الفصل"}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-bold text-orange-text">مؤشرات المرحلة</h4>
        <ul className="space-y-1">
          {stage.kpis.map((k) => (
            <li key={k} className="leading-7 text-ink-2">
              {k}
            </li>
          ))}
        </ul>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="mt-6 rounded-[12px] border-2 border-navy bg-bg px-4 py-3"
      >
        <h4 className="text-xs font-bold text-navy">ما تراه في الشاشة: {screenDef.title}</h4>
        <p key={screenId} className="mt-1 text-sm leading-7 text-ink">
          {seesNote}
        </p>
      </div>
    </div>
  );
}
