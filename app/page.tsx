"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { fetchLatestQuests } from "@/services/questsService";
import { Quest } from "@/Entities/Quest";
import { QuestCard } from "@/components/QuestCard";
import styles from "./Quests/QuestsPage.module.css";

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
  if (!role) return <div style={{ padding: 24 }}>Перенаправление...</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Последние квесты</h1>
      
      {loading ? (
        <div>Загрузка...</div>
      ) : latestQuests.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
          Квесты не найдены
        </div>
      ) : (
        <div className={styles.grid}>
          {latestQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/Quests")}
          style={{
            padding: "12px 24px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Показать все квесты
        </button>
      </div>
    </div>
  );
}
