"use client";

import { useEffect, useState } from "react";
import { Quest } from "@/Entities/Quest";
import { fetchQuests } from "@/services/questsService";
import { QuestCard } from "@/components/QuestCard";
import styles from "./QuestsPage.module.css";
import { useRouter } from "next/navigation";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchQuests()
      .then(setQuests)
      .catch(() => setError("Не удалось загрузить квесты"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Все квесты</h1>

      <div className={styles.grid}>
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}

        <div className={styles.addCard} onClick={() => router.push("/Quests/CreateQuest")}
        >
          <div className={styles.plus}>+</div>
          <div className={styles.addText}>Добавить квест</div>
        </div>
      </div>
    </div>
  );
}
