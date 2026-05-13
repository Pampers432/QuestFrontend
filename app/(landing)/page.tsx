import Hero from "./components/Hero";
import SubjectGrid from "./components/SubjectGrid";
import AgeProgression from "./components/AgeProgression";
import TaskPreview from "./components/TaskPreview";
import Rewards from "./components/Rewards";
import Testimonials from "./components/Testimonials";
import ParentTrust from "./components/ParentTrust";
import Footer from "./components/Footer";
import { ZigzagDivider, ZigzagBg } from "./components/Decorations";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <ZigzagDivider color="var(--color-peach)" />
      <SubjectGrid />
      <ZigzagDivider color="var(--color-sky-light)" />
      <AgeProgression />
      <div style={{ height: "60px", width: "100%", display: "block" }}>
        <ZigzagBg color="var(--color-orange)" />
      </div>
      <TaskPreview />
      <ZigzagDivider color="var(--color-peach)" />
      <Rewards />
      <ZigzagDivider color="var(--color-sky-light)" />
      <Testimonials />
      <ZigzagDivider color="var(--color-peach)" />
      <ParentTrust />
      <Footer />
    </main>
  );
}
