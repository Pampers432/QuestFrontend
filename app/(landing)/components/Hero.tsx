"use client";

import { useRouter } from "next/navigation";
import { useCountUp } from "../hooks/useCountUp";
import { useTypewriter } from "../hooks/useTypewriter";
import CTAButton from "./CTAButton";
import AlienMascot from "./AlienMascot";
import { SunDoodle, CloudDoodle, PaintedDots } from "./Decorations";

const stats = [
  { value: 1419000, label: "школьников и студентов", suffix: "+" },
  { value: 39400, label: "учебных заданий", suffix: "+" },
  { value: 98, label: "% довольных результатом", suffix: "" },
];

function StatCounter({ target, suffix }: { target: number; suffix: string }) {
  const [ref, count] = useCountUp(target);
  return (
    <span ref={ref} className="hero-stat-number" style={{ animation: "pulseCount 0.3s ease" }}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Hero() {
  const router = useRouter();
  const { displayText, isDone } = useTypewriter("Учиться? Легко! 🚀", 60);

  return (
    <section className="hero-section" style={{ position: "relative", overflow: "hidden" }}>
      {/* Morphing blobs */}
      <div style={{
        position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,107,53,0.08), transparent)",
        top: "-10%", left: "-5%",
        animation: "morph 8s ease-in-out infinite",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "250px", height: "250px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(69,183,209,0.08), transparent)",
        bottom: "-5%", right: "-5%",
        animation: "morph 10s ease-in-out infinite 2s",
        filter: "blur(40px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(78,205,196,0.06), transparent)",
        top: "40%", right: "30%",
        animation: "morph 12s ease-in-out infinite 4s",
        filter: "blur(40px)", pointerEvents: "none",
      }} />

      <div className="hero-doodles">
        <SunDoodle className="animate-drift" style={{ top: "5%", right: "8%", width: "80px", opacity: 0.6 }} />
        <SunDoodle className="animate-drift" style={{ bottom: "10%", left: "3%", width: "50px", opacity: 0.4, animationDelay: "-2s" }} />
        <CloudDoodle className="animate-float-slow" style={{ top: "8%", left: "5%", width: "100px", opacity: 0.5 }} />
        <CloudDoodle className="animate-float" style={{ top: "15%", right: "20%", width: "70px", opacity: 0.4, animationDelay: "-1.5s" }} />
        <PaintedDots style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
      </div>

      <div className="hero-container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{
          animation: "orbit 20s linear infinite",
          width: "fit-content",
        }}>
          <div className="mascot-hover" style={{ width: "fit-content" }}>
            <AlienMascot className="hero-mascot" variant={isDone ? "happy" : "thinking"} />
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title" style={{ minHeight: "1.2em" }}>
            {displayText}
            <span style={{
              display: "inline-block", width: "3px", height: "0.8em",
              background: "var(--color-orange)", marginLeft: "4px",
              animation: "blink 0.75s step-end infinite",
              verticalAlign: "middle",
            }} />
          </h1>
          <p className="hero-body">
            <span className="text-highlight">39 000+</span> заданий для школьников и студентов
            в игровом формате. Готовься к ЕГЭ/ОГЭ, прокачивай скиллы и соревнуйся с друзьями.
          </p>

          <div className="hero-cta">
            <CTAButton onClick={() => router.push("/Auth")}>
              Начать бесплатно
            </CTAButton>
          </div>

          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-highlight">
                  <StatCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
