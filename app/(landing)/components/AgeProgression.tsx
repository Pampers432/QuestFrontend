"use client";

import { useRouter } from "next/navigation";
import CTAButton from "./CTAButton";
import SectionTitle from "./SectionTitle";
import { useInView } from "../hooks/useInView";
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
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="age-card"
      style={{
        backgroundColor: age.color,
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.9)",
        transition: `all 0.5s ease ${index * 0.08}s`,
      }}
    >
      <div className="age-number">{age.years}</div>
      <div className="age-label">{age.label}</div>
      <div className="age-desc">{age.desc}</div>
      <div className="age-count">{age.count.toLocaleString()} заданий</div>
    </div>
  );
}

export default function AgeProgression() {
  const router = useRouter();

  return (
    <section className="section-default section-bg-gradient-sky" style={{ position: "relative" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.4 }} />
      <TreeDoodle className="animate-bounceSoft" style={{ position: "absolute", bottom: "5%", left: "3%", width: "60px", opacity: 0.3 }} />
      <TreeDoodle className="animate-bounceSoft" style={{ position: "absolute", top: "10%", right: "4%", width: "45px", opacity: 0.25, animationDelay: "-1s" }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "5%", left: "60%", width: "80px", opacity: 0.3 }} />
      <div className="container-section" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Задания для любого уровня — от средней школы до первых курсов университета.">
          Для любого уровня
        </SectionTitle>

        <div className="age-scroll">
          {ages.map((a, i) => (
            <AgeCard key={a.years} age={a} index={i} />
          ))}
        </div>

        <div className="section-header">
          <CTAButton onClick={() => router.push("/Auth")}>Начать бесплатно</CTAButton>
        </div>
      </div>
    </section>
  );
}
