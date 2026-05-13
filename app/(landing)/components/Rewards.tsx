"use client";

import SectionTitle from "./SectionTitle";
import { useInView } from "../hooks/useInView";
import { SparkleDoodle, PaintedDots, SunDoodle } from "./Decorations";

const rewards = [
  { icon: "⚡", title: "XP и уровни", desc: "Прокачивай персонажа, открывай новые возможности" },
  { icon: "🏆", title: "Рейтинги и топы", desc: "Соревнуйся с одноклассниками и друзьями" },
  { icon: "🔥", title: "Серии и стриксы", desc: "Занимайся каждый день и получай бонусы" },
];

function RewardCard({ reward, index }: { reward: typeof rewards[0]; index: number }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className="reward-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.6s ease ${index * 0.15}s`,
      }}
    >
      <div className="reward-icon animate-pulseGlow">{reward.icon}</div>
      <h3 className="reward-title">{reward.title}</h3>
      <p className="reward-desc">{reward.desc}</p>
    </div>
  );
}

export default function Rewards() {
  return (
    <section className="section-default section-bg-gradient-peach" style={{ position: "relative" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.3 }} />
      <SunDoodle className="animate-slowSpin" style={{ position: "absolute", top: "8%", left: "4%", width: "50px", opacity: 0.3 }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", bottom: "10%", right: "6%", width: "26px" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "25%", right: "12%", width: "18px", animationDelay: "-0.8s" }} />
      <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Геймификация учёбы: XP, рейтинги, ежедневные задания и соревнования с друзьями.">
          🎮 Прокачка и геймификация
        </SectionTitle>

        <div className="grid-1-3">
          {rewards.map((r, i) => (
            <RewardCard key={r.title} reward={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
