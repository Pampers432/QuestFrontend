"use client";

import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import SubjectGrid from "./components/SubjectGrid";
import AgeProgression from "./components/AgeProgression";
import TaskPreview from "./components/TaskPreview";
import Rewards from "./components/Rewards";
import Testimonials from "./components/Testimonials";
import ParentTrust from "./components/ParentTrust";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";
import ScrollProgressBar from "./components/ScrollProgressBar";
import FloatingElements from "./components/FloatingElements";
import { ZigzagDivider, ZigzagBg, GradientOrb } from "./components/Decorations";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 3500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      if (p < 100) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, []);

  if (loading) {
    return <Preloader progress={progress} onComplete={() => setLoading(false)} />;
  }

  return (
    <main style={{ position: "relative", overflow: "hidden" }}>
      <ScrollProgressBar />
      <div style={{ position: "relative" }}>
        <Hero />
        <FloatingElements />
      </div>
      <ZigzagDivider color="var(--color-peach)" />
      <SubjectGrid />
      <ZigzagDivider color="var(--color-sky-light)" />
      <AgeProgression />
      <GradientOrb style={{ top: "50%", left: "10%" }} />
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
