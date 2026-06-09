"use client";

import { useState } from "react";
import SectionTitle from "./SectionTitle";
import AlienMascot from "./AlienMascot";
import { useInViewAdvanced } from "../hooks/useInViewAdvanced";
import { SparkleDoodle, CloudDoodle, PaintedDots } from "./Decorations";

const options = [
  { formula: "E = mc²", label: "Эйнштейн", correct: true },
  { formula: "F = ma", label: "Ньютон" },
  { formula: "a² + b² = c²", label: "Пифагор" },
  { formula: "PV = nRT", label: "Менделеев" },
];

export default function TaskPreview() {
  const { ref, inView } = useInViewAdvanced({ threshold: 0.3 });
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (label: string) => {
    if (showResult) return;
    setSelected(label);
    setShowResult(true);
  };

  const isCorrect = selected === "Эйнштейн";
  const mascotVariant = showResult ? (isCorrect ? "celebrate" : "thinking") : "happy";

  return (
    <section className="section-default section-bg-white" style={{ position: "relative" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.3 }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "15%", left: "6%", width: "28px" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", bottom: "20%", right: "5%", width: "22px", animationDelay: "-1.5s" }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "8%", right: "10%", width: "70px", opacity: 0.25 }} />
      <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Попробуй сам — задания в формате квизов, головоломок и интерактивных тестов.">
          🎮 Как это работает
        </SectionTitle>

        <div
          ref={ref}
          className="task-preview-card"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.7s ease",
          }}
        >
          <div className="mascot-row">
            <div className="mascot-hover" style={{ width: "60px", height: "60px" }}>
              <AlienMascot variant={mascotVariant} size={60} />
            </div>
            <div className="speech-bubble" style={{ animation: inView ? "scaleIn 0.4s ease 0.3s forwards" : "none", opacity: 0 }}>
              <p className="speech-text">
                {showResult
                  ? (isCorrect ? "Ура! Правильно! 🎉" : "Попробуй ещё раз! 💪")
                  : "Какая формула правильная? 🧠"
                }
              </p>
            </div>
          </div>

          <div className="task-options">
            {options.map((item, i) => {
              let btnClass = "task-option-btn";
              let extraStyle: React.CSSProperties = {};

              if (showResult) {
                if (item.correct) {
                  btnClass += " task-option-btn-correct";
                  extraStyle = { animation: "scaleIn 0.4s ease forwards" };
                } else if (item.label === selected && !item.correct) {
                  extraStyle = {
                    background: "#ffe0e0",
                    borderColor: "#ff4444",
                    animation: "shake 0.5s ease-in-out",
                  };
                }
              }

              return (
                <button
                  key={item.label}
                  className={btnClass}
                  style={{
                    ...extraStyle,
                    opacity: 0,
                    animation: inView && !showResult
                      ? `slideInLeft 0.5s ease ${i * 0.1 + 0.5}s forwards`
                      : showResult ? extraStyle.animation : undefined,
                  }}
                  onClick={() => handleSelect(item.label)}
                  disabled={showResult}
                >
                  <div className="task-option-formula">{item.formula}</div>
                  <div className="task-option-label">{item.label}</div>
                  {showResult && item.correct && (
                    <div className="task-option-check" style={{
                      animation: "drawCheck 0.5s ease 0.3s forwards",
                      strokeDasharray: 100,
                      strokeDashoffset: 100,
                    }}>✓</div>
                  )}
                  {showResult && item.label === selected && !item.correct && (
                    <div style={{ color: "#ff4444", fontSize: "1.125rem", marginTop: "0.25rem" }}>✗</div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between" style={{ marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
            <span style={{ fontWeight: 700, color: "var(--color-text-secondary)" }}>Прогресс</span>
            <span className="text-highlight" style={{ fontWeight: 700 }}>8/10</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: inView ? "80%" : "0%",
                animation: inView ? "fillBar 1.5s ease forwards" : "none",
              }}
            />
          </div>

          <div className="section-header" style={{ marginTop: "var(--space-lg)", marginBottom: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
              🚀 Каждый правильный ответ прокачивает твои знания!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
