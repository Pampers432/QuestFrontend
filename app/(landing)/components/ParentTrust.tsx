"use client";

import { useRouter } from "next/navigation";
import SectionTitle from "./SectionTitle";
import CTAButton from "./CTAButton";
import { useInView } from "../hooks/useInView";
import { SunDoodle, SparkleDoodle, TreeDoodle, CloudDoodle, PaintedDots } from "./Decorations";

const benefits = [
  { icon: "📊", title: "Прогресс", desc: "Отслеживай успеваемость в реальном времени" },
  { icon: "🎯", title: "ЕГЭ/ОГЭ", desc: "Задания формата госэкзаменов" },
  { icon: "🏅", title: "Достижения", desc: "Ачивки, уровни и соревнования" },
  { icon: "📱", title: "Везде с тобой", desc: "Занимайся с телефона, планшета или ПК" },
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[0]; index: number }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="benefit-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.5s ease ${index * 0.1}s`,
      }}
    >
      <div className="benefit-icon">{benefit.icon}</div>
      <h3 className="benefit-title">{benefit.title}</h3>
      <p className="benefit-desc">{benefit.desc}</p>
    </div>
  );
}

export default function ParentTrust() {
  const router = useRouter();

  return (
    <section className="section-default section-bg-gradient-peach" style={{ position: "relative" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.3 }} />
      <SunDoodle className="animate-wiggle" style={{ position: "absolute", top: "5%", right: "6%", width: "60px", opacity: 0.4 }} />
      <TreeDoodle className="animate-bounceSoft" style={{ position: "absolute", bottom: "8%", left: "3%", width: "55px", opacity: 0.3, animationDelay: "-1.5s" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "40%", left: "5%", width: "22px" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", bottom: "30%", right: "4%", width: "18px", animationDelay: "-2s" }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "12%", left: "10%", width: "70px", opacity: 0.2 }} />
      <div className="container-medium" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Готовься к экзаменам, прокачивай скиллы и соревнуйся — всё в одном месте">
          🚀 Почему выбирают нас
        </SectionTitle>

        <div className="grid-2-4" style={{ marginBottom: "var(--space-2xl)" }}>
          {benefits.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} index={i} />
          ))}
        </div>

        <div className="award-badge">
          <div className="award-icon">🏆</div>
          <h3 className="award-title">
            Победитель EdCrunch Award 2020
          </h3>
          <p className="award-desc">
            Лучший технологический продукт для B2C в образовании
          </p>
          <CTAButton onClick={() => router.push("/Auth")}>Начать бесплатно</CTAButton>
        </div>
      </div>
    </section>
  );
}
