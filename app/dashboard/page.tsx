"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { fetchLatestQuests } from "@/services/questsService";
import { Quest } from "@/Entities/Quest";
import { QuestCard } from "@/components/QuestCard";
import Button from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";
import { PageSun, PageCloud, PageSmiley, PageStars } from "@/components/PageDoodles";

export default function Dashboard() {
  const router = useRouter();
  const [latestQuests, setLatestQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getStoredRole();
    if (!role) {
      router.replace("/Auth");
      return;
    }
    fetchLatestQuests(5)
      .then(setLatestQuests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const role = getStoredRole();
  if (!role) return <div className="page-container">Перенаправление...</div>;

  return (
    <div style={{ position: "relative" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "6%", width: 80, height: 80, opacity: 0.4, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "8%", left: "4%", width: 100, height: 50, opacity: 0.35, zIndex: 0 }}
        className="animate-drift"
      />
      <PageCloud
        style={{ position: "fixed", bottom: "10%", right: "8%", width: 80, height: 40, opacity: 0.25, zIndex: 0 }}
        className="animate-float"
      />
      <PageSmiley
        style={{ position: "fixed", bottom: "5%", left: "5%", width: 50, height: 50, opacity: 0.25, zIndex: 0 }}
        className="animate-wobble"
      />
      <PageStars
        style={{ position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)", width: 200, height: 30, opacity: 0.3, zIndex: 0 }}
      />

      <section
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #2a5298 100%)",
          color: "white",
          padding: "80px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(255,107,53,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(69,183,209,0.15) 0%, transparent 50%)",
          pointerEvents: "none",
        }} />
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12, position: "relative", zIndex: 1 }}>
          🚀 Quest Platform
        </h1>
        <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 600, margin: "0 auto 32px", position: "relative", zIndex: 1 }}>
          Создавайте и проходите образовательные квесты. Геймификация обучения для преподавателей и студентов.
        </p>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(role === "Student" ? "/Session" : "/Quests")}
          >
            {role === "Student" ? "Начать тест" : "Перейти к квестам"}
          </Button>
        </div>
      </section>

      <section className="page-container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 className="page-title" style={{ margin: 0, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Последние квесты
          </h2>
          <Button variant="secondary" size="sm" onClick={() => router.push("/Quests")}>
            Все квесты →
          </Button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : latestQuests.length === 0 ? (
          <div style={{
            padding: "60px 24px", textAlign: "center",
            background: "rgba(255,255,255,0.7)", borderRadius: 24,
            backdropFilter: "blur(8px)",
          }}>
            <p style={{ fontSize: 18, marginBottom: 16, color: "var(--color-text-secondary)" }}>
              🧭 Квесты не найдены
            </p>
            <Button variant="primary" onClick={() => router.push("/Quests/CreateQuest")}>
              Создать первый квест
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {latestQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
