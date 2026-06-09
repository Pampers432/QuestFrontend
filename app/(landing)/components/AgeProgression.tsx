"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import CTAButton from "./CTAButton";
import SectionTitle from "./SectionTitle";
import { useInViewAdvanced } from "../hooks/useInViewAdvanced";
import { TreeDoodle, PaintedDots, CloudDoodle } from "./Decorations";

const ages = [
  { years: "5-6", label: "5-6 класс", count: 3381, color: "#FF6B35", desc: "Адаптация, основы" },
  { years: "7-8", label: "7-8 класс", count: 6005, color: "#4ECDC4", desc: "Углубление знаний" },
  { years: "9", label: "9 класс", count: 9797, color: "#45B7D1", desc: "Подготовка к ОГЭ" },
  { years: "10", label: "10 класс", count: 15430, color: "#96CEB4", desc: "База для ЕГЭ" },
  { years: "11", label: "11 класс", count: 16696, color: "#FFEAA7", desc: "Интенсив к ЕГЭ" },
  { years: "12+", label: "Студенты", count: 14162, color: "#DDA0DD", desc: "1-2 курс вуза" },
];

function AgeCard({ age, index }: { age: typeof ages[0]; index: number }) {
  const { ref, inView } = useInViewAdvanced({ threshold: 0.3 });
  return (
    <div
      ref={ref}
      className="age-card"
      style={{
        backgroundColor: age.color,
        opacity: 0,
        transform: "scale(0.9)",
        animation: inView ? `scaleIn 0.5s ease forwards` : "none",
        animationDelay: inView ? `${index * 0.08}s` : "0s",
        position: "relative",
      }}
    >
      <div className="age-number">{age.years}</div>
      <div className="age-label">{age.label}</div>
      <div className="age-desc">{age.desc}</div>
      <div className="age-count">{age.count.toLocaleString()} заданий</div>

      {/* Glow on hover */}
      <div style={{
        position: "absolute", inset: "-3px", borderRadius: "calc(var(--card-border-radius) + 3px)",
        border: `3px solid ${age.color}`,
        opacity: 0, transition: "opacity 0.3s ease",
        pointerEvents: "none",
        filter: "blur(4px) brightness(1.5)",
      }} className="age-glow" />

      <style jsx>{`
        .age-card:hover .age-glow { opacity: 0.6; }
      `}</style>
    </div>
  );
}

export default function AgeProgression() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setScrollPos(el.scrollLeft);
      setMaxScroll(Math.max(1, el.scrollWidth - el.clientWidth));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused]);

  const progress = (scrollPos / maxScroll) * 100;

  return (
    <section className="section-default section-bg-gradient-sky" style={{ position: "relative" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.4 }} />
      <TreeDoodle className="animate-bounceSoft" style={{ position: "absolute", bottom: "5%", left: "3%", width: "60px", opacity: 0.3 }} />
      <TreeDoodle className="animate-bounceSoft" style={{ position: "absolute", top: "10%", right: "4%", width: "45px", opacity: 0.25, animationDelay: "-1s" }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "5%", left: "60%", width: "80px", opacity: 0.3 }} />
      <div className="container-section" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Задания для любого уровня — от средней школы до первых курсов университета.">
          Для любого уровня
        </SectionTitle>

        <div className="age-scroll age-scroll-snap" ref={scrollRef}>
          {ages.map((a, i) => (
            <AgeCard key={a.years} age={a} index={i} />
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          maxWidth: "400px", margin: "16px auto 24px",
          height: "4px", background: "rgba(0,0,0,0.08)",
          borderRadius: "2px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, #FF6B35, #4ECDC4)",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }} />
        </div>

        <div className="section-header">
          <CTAButton onClick={() => router.push("/Auth")}>Начать бесплатно</CTAButton>
        </div>
      </div>
    </section>
  );
}
