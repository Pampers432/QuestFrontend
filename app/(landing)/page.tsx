"use client";

import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import SubjectGrid from "./components/SubjectGrid";
import AgeProgression from "./components/AgeProgression";
import TaskPreview from "./components/TaskPreview";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";
import ScrollProgressBar from "./components/ScrollProgressBar";
import FloatingElements from "./components/FloatingElements";
import { GradientOrb } from "./components/Decorations";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const shown = sessionStorage.getItem("preloader_shown");
    if (shown) {
      setLoading(false);
      return;
    }

    sessionStorage.setItem("preloader_shown", "true");

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
      <SubjectGrid />
      <AgeProgression />
      <GradientOrb style={{ top: "50%", left: "10%" }} />
      <TaskPreview />
      <Footer />
    </main>
  );
}
