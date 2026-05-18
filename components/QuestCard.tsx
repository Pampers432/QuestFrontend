"use client";

import { Quest } from "@/Entities/Quest";
import styles from "./QuestCard.module.css";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { deleteQuest } from "@/services/questsService";
import Badge from "./Badge";
import Button from "./Button";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  Draft: { label: "Черновик", variant: "warning" },
  Published: { label: "Опубликован", variant: "success" },
  Archive: { label: "Архив", variant: "default" },
};

export const QuestCard = ({ quest, onDelete }: { quest: Quest; onDelete?: () => void }) => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";
  const role = getStoredRole();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const canEdit = role === "Admin" || (role === "Teacher" && quest.authorId === userId);

  const difficultyStars: Record<string, string> = {
    Easy: "★",
    Medium: "★★",
    Hard: "★★★",
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот квест?")) return;
    try {
      await deleteQuest(quest.id);
      onDelete?.();
    } catch (error) {
      console.error("Ошибка удаления квеста:", error);
    }
  };

  const previewUrl = quest.questRooms[0]?.roomTemplate?.previewImageUrl;

  return (
    <div className={styles.card}>
      <div className={styles.badges}>
        {quest.visibility === "Private" && <Badge variant="private">Приватный</Badge>}
        <Badge variant={statusConfig[quest.status]?.variant || "default"}>
          {statusConfig[quest.status]?.label || quest.status}
        </Badge>
      </div>

      {canEdit && (
        <div className={styles.cardHeader}>
          <button
            className={styles.editBtn}
            onClick={(e) => { e.stopPropagation(); router.push(`/Quests/EditQuest/${quest.id}`); }}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            className={styles.deleteBtn}
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      )}

      <div className={styles.imageWrapper}>
        {previewUrl ? (
          <img src={`${baseUrl}${previewUrl}`} alt={quest.title} className={styles.image} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>
            Нет превью
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{quest.title}</h3>
        {quest.description && <p className={styles.description}>{quest.description}</p>}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <span className={styles.stars}>{difficultyStars[quest.difficulty] || "★"}</span>
          </span>
          <span className={styles.metaItem}>{quest.subject}</span>
          <span className={styles.metaItem}>{quest.questRooms.length} ком.</span>
        </div>
      </div>

      <div className={styles.footer}>
        <Button variant="primary" size="sm" onClick={() => {
            localStorage.setItem("selectedQuest", JSON.stringify(quest));
            router.push(`/Quests/${quest.id}`);
          }}>
          Открыть
        </Button>
        {canEdit && (
          <Button variant="secondary" size="sm" onClick={() => router.push(`/Quests/EditQuest/${quest.id}`)}>
            Редактировать
          </Button>
        )}
      </div>
    </div>
  );
};
