"use client";

import SectionTitle from "./SectionTitle";
import AlienMascot from "./AlienMascot";
import { useInView } from "../hooks/useInView";
import { SparkleDoodle, CloudDoodle, PaintedDots } from "./Decorations";

export default function TaskPreview() {
  const [ref, inView] = useInView();

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
              <AlienMascot className="animate-float" />
            </div>
            <div className="speech-bubble">
              <p className="speech-text">
                Какая формула правильная? 🧠
              </p>
            </div>
          </div>

          <div className="task-options">
            {[
              { formula: "E = mc²", label: "Эйнштейн", correct: true },
              { formula: "F = ma", label: "Ньютон" },
              { formula: "a² + b² = c²", label: "Пифагор" },
              { formula: "PV = nRT", label: "Менделеев" },
            ].map((item) => (
              <button
                key={item.label}
                className={`task-option-btn ${item.correct && inView ? "task-option-btn-correct" : ""}`}
              >
                <div className="task-option-formula">{item.formula}</div>
                <div className="task-option-label">{item.label}</div>
                {item.correct && inView && (
                  <div className="task-option-check">✓</div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between" style={{ marginBottom: "var(--space-xs)", fontSize: "0.875rem" }}>
            <span style={{ fontWeight: 700, color: "var(--color-text-secondary)" }}>Прогресс</span>
            <span className="text-highlight" style={{ fontWeight: 700 }}>8/10</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill animate-fillBar"
              style={{ width: inView ? "80%" : "0%" }}
            />
          </div>

          <div className="features-row">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-label">XP очки</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-label">Рейтинг</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔥</span>
              <span className="feature-label">Серия</span>
            </div>
          </div>

          <div className="section-header" style={{ marginTop: "var(--space-lg)", marginBottom: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
              🚀 Каждый правильный ответ прокачивает твой уровень!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
