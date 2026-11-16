import { getUniversity } from "@/lib/data";
import Router from "./components/Router";
import Navbar from "./components/Navbar";
import Journey from "./components/Journey";
import StudentPortal from "./components/StudentPortal";
import { EmployersSection } from "./components/EmployerPortal";
import CenterPortal from "./components/CenterPortal";
import UniversityPortal from "./components/UniversityPortal";
import { Footer } from "./components/Closing";
import { LandingNumbers, Partners, Faq, Stories } from "./components/Landing";
import { QuickBar, HeroV2, AudiencesV2, EventsV2, ValueBand } from "./components/HomeV2";
import SessionRoom from "./components/SessionRoom";
import StoryPage from "./components/StoryPage";
import Chatbot from "./components/Chatbot";

export default function Home() {
  const university = getUniversity("demo");
  const skillsProps = {
    semesters: university.semesters,
    courseSkillMap: university.courseSkillMap,
    mapStatus: university.courseSkillMapStatus,
    unclassified: university.unclassifiedCourses,
    skills: university.skills,
    gapNote: university.skillsGapNote,
  };

  return (
    <>
      <QuickBar />
      <Navbar gateways={university.gateways} />
      <main>
        <Router
          pages={{
            home: (
              <>
                <HeroV2 />
                <LandingNumbers />
                <AudiencesV2 gateways={university.gateways} />
                <Journey stages={university.stages} />
                <EventsV2 />
                <Stories />
                <Partners />
                <Faq />
                <ValueBand />
              </>
            ),
            story: <StoryPage />,
            session: <SessionRoom />,
            student: <StudentPortal mode="student" skills={skillsProps} />,
            alumni: <StudentPortal mode="alumni" skills={skillsProps} />,
            employers: <EmployersSection />,
            center: <CenterPortal />,
            university: (
              <UniversityPortal skills={skillsProps} />
            ),
          }}
        />
      </main>
      <Footer />
      <Chatbot spec={university.chatbot} />
    </>
  );
}
