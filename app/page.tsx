"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { fetchLatestQuests } from "@/services/questsService";
import { Quest } from "@/Entities/Quest";
import { QuestCard } from "@/components/QuestCard";
import Button from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";

export default function Home() {
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
    <div>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #2a5298 100%)",
          color: "white",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
          Quest Platform
        </h1>
        <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 600, margin: "0 auto 32px" }}>
          Создавайте и проходите образовательные квесты. Геймификация обучения для преподавателей и студентов.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push(role === "Student" ? "/Session" : "/Quests")}
        >
          {role === "Student" ? "Начать тест" : "Перейти к квестам"}
        </Button>
      </section>

      {/* Latest Quests */}
      <section className="page-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 className="page-title" style={{ margin: 0 }}>Последние квесты</h2>
          <Button variant="secondary" size="sm" onClick={() => router.push("/Quests")}>
            Все квесты
          </Button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : latestQuests.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--color-text-secondary)" }}>
            <p style={{ fontSize: 18, marginBottom: 16 }}>Квесты не найдены</p>
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
