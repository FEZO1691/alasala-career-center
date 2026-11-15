"use client";

import { useMemo, useState } from "react";
import { createAssistant } from "@/lib/assistant";
import {
  getJourneyPeriod,
  getJourneyTabs,
  type Certificates,
  type ChatbotSpec,
  type JourneyScreenId,
  type StudentAssistant,
  type Stage,
  type StudentJourney,
  type StudentScreens,
  type University,
} from "@/lib/data";
import ExplainPanel from "./ExplainPanel";
import HomeScreen from "./HomeScreen";
import PortalSidebar from "./PortalSidebar";
import { CvDashboard } from "../Platform";
import ScreenPlaceholder, { LockedScreen } from "./ScreenPlaceholder";
import AssistantScreen, { type ChatMsg } from "./screens/AssistantScreen";
import CertsScreen from "./screens/CertsScreen";
import ConsultScreen from "./screens/ConsultScreen";
import CvJobsScreen from "./screens/CvJobsScreen";
import LibraryScreen from "./screens/LibraryScreen";
import NovaScreen from "./screens/NovaScreen";
import PortfolioScreen from "./screens/PortfolioScreen";
import PlanScreen from "./screens/PlanScreen";
import SkillsScreen from "./screens/SkillsScreen";

type Props = {
  journey: StudentJourney;
  screens: StudentScreens;
  assistantData: StudentAssistant;
  certificates: Certificates;
  chatbot: ChatbotSpec;
  stages: Stage[];
  skills: University["skills"];
  semesters: University["semesters"];
  courseSkillMap: University["courseSkillMap"];
};

// قسم "جرّب تجربة الطالب": شرح الفصل المختار، وبجانبه تطبيق الطالب في إطار هاتف
export default function Experience({
  journey,
  screens,
  assistantData,
  certificates,
  chatbot,
  stages,
  skills,
  semesters,
  courseSkillMap,
}: Props) {
  const tabs = getJourneyTabs(journey, stages);
  const [periodId, setPeriodId] = useState(journey.periods[0].id);
  const [screen, setScreen] = useState<JourneyScreenId>("home");
  // ما تبلّغ به الشاشة المفتوحة للوحة الشرح (يُصفَّر عند تغيير الشاشة أو الفصل)
  const [seesLive, setSeesLive] = useState<string | null>(null);
  const assistant = useMemo(
    () => createAssistant({ chatbot, assistant: assistantData, screens, certificates, skills, semesters, courseSkillMap }),
    [chatbot, assistantData, screens, certificates, skills, semesters, courseSkillMap]
  );
  // محادثة المساعد تبقى عند التنقل بين الشاشات، وتبدأ من جديد عند تغيير الفصل
  const greeting = (): ChatMsg[] => [{ id: 0, from: "bot", text: assistantData.greeting }];
  const [chat, setChat] = useState<ChatMsg[]>(greeting);
  const go = (id: JourneyScreenId) => {
    setScreen(id);
    setSeesLive(null);
  };

  const period = getJourneyPeriod(journey, periodId);
  const stage = stages.find((s) => s.id === period.stageId)!;
  const allSkills = skills.categories.flatMap((c) => c.skills);
  const centerSkills = period.centerUnits.map((id) => allSkills.find((s) => s.id === id)!);

  const defs = Object.entries(journey.screens) as [JourneyScreenId, StudentJourney["screens"][JourneyScreenId]][];
  const nav = defs
    .filter(([, d]) => d.placement === "nav")
    .map(([id, def]) => ({ id, def, locked: period.screens[id].state === "locked" }));
  const cards = defs
    .filter(([, d]) => d.placement === "card")
    .map(([id, def]) => ({ id, def, locked: period.screens[id].state === "locked" }));

  // تغيير الفصل يعيد التطبيق للشاشة الرئيسية
  const selectPeriod = (id: typeof periodId) => {
    setPeriodId(id);
    setChat(greeting());
    go("home");
  };

  const state = period.screens[screen];
  const def = journey.screens[screen];

  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-28 border-t border-line/30 bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold text-orange-text">بوابة الطالب</p>
          <h2 id="experience-title" className="text-2xl font-extrabold text-navy md:text-3xl">
            جرّب تجربة الطالب
          </h2>
          <p className="mt-3 leading-8 text-ink-2">نعرض الرحلة كما يعيشها الطالب، فصلًا بعد فصل.</p>
          <p className="mt-3">
            <span className="inline-block rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">
              بيانات تجريبية
            </span>
          </p>
        </div>

        <div
          className="mt-8 overflow-hidden rounded-[16px] border border-line/40 shadow-md md:flex"
          style={{ background: "#f4f2ef" }}
        >
          <PortalSidebar
            tabs={tabs}
            periods={journey.periods}
            periodId={periodId}
            onSelectPeriod={selectPeriod}
            persona={journey.persona}
            nav={nav}
            cards={cards}
            screen={screen}
            onNavigate={go}
          />
          <div className="min-w-0 flex-1 p-3 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-extrabold text-navy md:text-3xl">{def.title}</h3>
                <p className="mt-1 text-sm text-ink-2">
                  {period.year === null ? stage.name : `${stage.year} · ${stage.name}`}
                </p>
              </div>
              <span className="rounded-full border-2 border-navy px-3 py-0.5 text-xs font-bold text-navy">بيانات تجريبية</span>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[420px_1fr] xl:items-start">
              <div
                role="region"
                aria-label="شاشة الطالب (نموذج تجريبي)"
                className="h-[680px] min-w-0 overflow-y-auto rounded-[14px] bg-bg shadow-sm"
              >
              <div key={`${periodId}-${screen}`} className="exp-in h-full">
              {state.state === "locked" ? (
                <LockedScreen title={def.title} reason={state.reason} />
              ) : screen === "home" ? (
                <HomeScreen
                  persona={journey.persona}
                  period={period}
                  stageName={stage.name}
                  stageYear={stage.year}
                  cards={cards}
                  onOpen={go}
                />
              ) : screen === "portfolio" ? (
                <PortfolioScreen
                  title={def.title}
                  persona={journey.persona}
                  periods={journey.periods}
                  periodId={periodId}
                  stages={stages}
                  screens={screens}
                  skills={skills}
                  certificates={certificates}
                  onReport={setSeesLive}
                />
              ) : screen === "nova" ? (
                <NovaScreen
                  key={periodId}
                  periodId={periodId}
                  screens={screens}
                  categories={skills.categories}
                  onReport={setSeesLive}
                  onBack={() => go("home")}
                />
              ) : screen === "plan" ? (
                <PlanScreen
                  periodId={periodId}
                  screens={screens}
                  periods={journey.periods}
                  onReport={setSeesLive}
                />
              ) : screen === "skills" ? (
                <SkillsScreen
                  periodId={periodId}
                  screens={screens}
                  skills={skills}
                  semesters={semesters}
                  courseSkillMap={courseSkillMap}
                  onReport={setSeesLive}
                />
              ) : screen === "consult" ? (
                <ConsultScreen periodId={periodId} screens={screens} onReport={setSeesLive} onBack={() => go("home")} />
              ) : screen === "library" ? (
                <LibraryScreen
                  periodId={periodId}
                  screens={screens}
                  skills={skills}
                  onReport={setSeesLive}
                  onBack={() => go("home")}
                />
              ) : screen === "cvjobs" ? (
                <CvJobsScreen
                  periodId={periodId}
                  screens={screens}
                  stages={stages}
                  onReport={setSeesLive}
                  onBack={() => go("home")}
                />
              ) : screen === "certs" ? (
                <CertsScreen
                  periodId={periodId}
                  title={def.title}
                  certificates={certificates}
                  screens={screens}
                  skills={skills}
                  onReport={setSeesLive}
                  onBack={() => go("home")}
                />
              ) : screen === "assistant" ? (
                <AssistantScreen
                  periodId={periodId}
                  title={def.title}
                  demo={screens.demoNote}
                  assistant={assistant}
                  data={assistantData}
                  ui={chatbot.ui}
                  messages={chat}
                  setMessages={setChat}
                  screenInfo={(id: JourneyScreenId) => ({
                    title: journey.screens[id].title,
                    locked: period.screens[id].state === "locked",
                  })}
                  onNavigate={go}
                  onReport={setSeesLive}
                />
              ) : (
                <ScreenPlaceholder
                  title={def.title}
                  onBack={def.placement === "card" ? () => go("home") : undefined}
                />
              )}
              </div>
              </div>
              <div key={`period-${periodId}`} className="exp-in min-w-0">
                <ExplainPanel
                  period={period}
                  stage={stage}
                  centerSkills={centerSkills}
                  screenId={screen}
                  screenDef={def}
                  screenState={state}
                  seesLive={seesLive}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-xl font-extrabold text-navy md:text-2xl">المخرج النهائي: السيرة الجدارية</h3>
            <p className="mt-2 leading-8 text-ink-2">
              في السنة الرابعة تُنشر للطالب سيرة من صفحة واحدة تعرض جداراته الموثقة، ويراها أصحاب العمل في بوابتهم.
            </p>
          </div>
          <div className="mt-6">
            <CvDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}
