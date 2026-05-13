"use client";

import { useRouter } from "next/navigation";
import SectionTitle from "./SectionTitle";
import { useInView } from "../hooks/useInView";
import { SparkleDoodle, PaintedDots } from "./Decorations";

const subjects = [
  { title: "Математика", desc: "Алгебра, геометрия, тригонометрия, подготовка к ЕГЭ/ОГЭ", color: "#FF6B35", icon: "📐" },
  { title: "Русский язык", desc: "Орфография, пунктуация, сочинения, изложения", color: "#4ECDC4", icon: "📝" },
  { title: "Английский язык", desc: "Грамматика, лексика, аудирование, разговорная практика", color: "#45B7D1", icon: "🌐" },
  { title: "Физика", desc: "Механика, электричество, оптика, квантовая физика", color: "#96CEB4", icon: "⚡" },
  { title: "Химия", desc: "Реакции, элементы, органическая и неорганическая химия", color: "#FFEAA7", icon: "🧪" },
  { title: "Информатика", desc: "Алгоритмы, программирование, базы данных, ИИ", color: "#DDA0DD", icon: "💻" },
];

function SubjectCard({ subject, index }: { subject: typeof subjects[0]; index: number }) {
  const router = useRouter();
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s ease ${index * 0.1}s`,
      }}
      onClick={() => router.push("/Auth")}
    >
      <div
        className="card-icon"
        style={{ backgroundColor: `${subject.color}20` }}
      >
        {subject.icon}
      </div>
      <h3 className="card-title" style={{ color: subject.color }}>
        {subject.title}
      </h3>
      <p className="card-desc">{subject.desc}</p>
      <div
        className="card-cta link-doodle"
        style={{ color: subject.color }}
      >
        Начать
        <span>→</span>
      </div>
    </div>
  );
}

export default function SubjectGrid() {
  return (
    <section className="section-default section-bg-white section-doodle-bg section-zigzag-bg" style={{ position: "relative" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5 }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "8%", left: "5%", width: "30px" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", bottom: "12%", right: "8%", width: "24px", animationDelay: "-1s" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "20%", right: "15%", width: "18px", animationDelay: "-2.5s" }} />
      <div className="container-section" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Выбери предмет и начни подготовку прямо сейчас!">
          Школьные предметы
        </SectionTitle>

        <div className="grid-1-2-3">
          {subjects.map((s, i) => (
            <SubjectCard key={s.title} subject={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
