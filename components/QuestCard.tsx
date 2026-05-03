"use client";

import { Quest } from "@/Entities/Quest";
import styles from "./QuestCard.module.css";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { deleteQuest } from "@/services/questsService";

export const QuestCard = ({ quest, onDelete }: { quest: Quest; onDelete?: () => void }) => {
  const router = useRouter();
  const baseUrl = "http://localhost:7240";
  const role = getStoredRole();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const canEdit = role === "Admin" || (role === "Teacher" && quest.authorId === userId);

  const statusLabels: Record<string, string> = {
    Draft: "Черновик",
    Published: "Опубликован",
    Archive: "Архив"
  };

  const statusColors: Record<string, string> = {
    Draft: "#ffc107",
    Published: "#28a745",
    Archive: "#6c757d"
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот квест?")) return;
    try {
      await deleteQuest(quest.id);
      alert("Квест удалён");
      onDelete?.();
    } catch (error) {
      console.error("Ошибка удаления квеста:", error);
      alert("Не удалось удалить квест");
    }
  };

  return (
    <div className={styles.card}>
      {canEdit && (
        <div className={styles.cardHeader}>
          <button className={styles.editBtn} onClick={() => router.push(`/Quests/EditQuest/${quest.id}`)}>
            ✏️
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            🗑️
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 className={styles.title} style={{ margin: 0 }}>{quest.title}</h3>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            background: statusColors[quest.status] || "#ccc",
            color: quest.status === "Draft" ? "#000" : "#fff"
          }}
        >
          {statusLabels[quest.status] || quest.status}
        </span>
      </div>

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
