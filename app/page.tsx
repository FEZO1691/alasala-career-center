import { getUniversity } from "@/lib/data";
import Router from "./components/Router";
import Navbar from "./components/Navbar";
import Journey from "./components/Journey";
import StudentPortal from "./components/StudentPortal";
import { EmployersSection } from "./components/EmployerPortal";
import CenterPortal from "./components/CenterPortal";
import UniversityPortal from "./components/UniversityPortal";
import { Footer } from "./components/Closing";
import { LandingHero, LandingNumbers, Audiences, ServiceCards, Events, Partners, LandingCta, HowItWorks, Faq, Stories } from "./components/Landing";
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
      <Navbar gateways={university.gateways} />
      <main>
        <Router
          pages={{
            home: (
              <>
                <LandingHero />
                <LandingNumbers />
                <Journey stages={university.stages} />
                <Audiences gateways={university.gateways} />
                <HowItWorks />
                <ServiceCards services={university.services} />
                <Events />
                <Stories />
                <Partners />
                <Faq />
                <LandingCta />
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
