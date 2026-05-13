"use client";

import { useRouter } from "next/navigation";
import { useCountUp } from "../hooks/useCountUp";
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
    <span ref={ref} className="hero-stat-number">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Hero() {
  const router = useRouter();

  return (
    <section className="hero-section">
      <div className="hero-doodles">
        <SunDoodle className="animate-drift" style={{ top: "5%", right: "8%", width: "80px", opacity: 0.6 }} />
        <SunDoodle className="animate-drift" style={{ bottom: "10%", left: "3%", width: "50px", opacity: 0.4, animationDelay: "-2s" }} />
        <CloudDoodle className="animate-float-slow" style={{ top: "8%", left: "5%", width: "100px", opacity: 0.5 }} />
        <CloudDoodle className="animate-float" style={{ top: "15%", right: "20%", width: "70px", opacity: 0.4, animationDelay: "-1.5s" }} />
        <PaintedDots style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />
      </div>

      <div className="hero-container" style={{ position: "relative", zIndex: 1 }}>
        <div className="mascot-hover">
          <AlienMascot className="hero-mascot" />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">Учиться? Легко! 🚀</h1>
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
