"use client";

import { Quest } from "@/Entities/Quest";
import styles from "./QuestCard.module.css";
import { useRouter } from "next/navigation";

export const QuestCard = ({ quest }: { quest: Quest }) => {
  const router = useRouter();
  const baseUrl = "http://localhost:7240";

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{quest.title}</h3>

      {quest.description && (
        <p className={styles.description}>{quest.description}</p>
      )}

      <img src={`${baseUrl}${quest.questRooms[0]?.roomTemplate?.previewImageUrl}`} style={{ width: "100%", borderRadius: 8 }} />

      <p className={styles.info}>
        Предмет: <b>{quest.subject}</b>
      </p>

      <p className={styles.info}>
        Сложность: <b>{quest.difficulty}</b>
      </p>

      <p className={styles.info}>
        Комнат: <b>{quest.questRooms.length}</b>
      </p>

      <button
        className={styles.button}
        onClick={() => {
          localStorage.setItem("selectedQuest", JSON.stringify(quest));
          router.push(`/Quests/${quest.id}`);
        }}
      >
        Открыть
      </button>

    </div>
  );
};
