"use client";

import { RoomTemplate } from "@/Entities/RoomTemplate";
import { useRouter } from "next/navigation";
import styles from "./TemplateCard.module.css";
import { getStoredRole } from "@/utils/auth";

export const TemplateCard = ({
  template,
  onDelete
}: {
  template: RoomTemplate;
  onDelete?: (id: string) => void;
}) => {
  const router = useRouter();
  const role = getStoredRole();

  const handleDelete = async () => {
    if (!template.id) return;

    if (!confirm("Вы уверены, что хотите удалить этот шаблон?")) return;

    const res = await fetch(
      `https://localhost:7240/api/Quests/${template.id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("Ошибка при удалении шаблона");
      return;
    }

    onDelete?.(template.id);
  };

  const handleEdit = () => {
    if (!template.id) return;
    router.push(`/Templates/EditTemplate/${template.id}`);
  };

  const handleUse = () => {
    const existingRaw = localStorage.getItem("selectedTemplates");
    const existing: RoomTemplate[] = existingRaw ? JSON.parse(existingRaw) : [];

    existing.push(template);

    localStorage.setItem("selectedTemplates", JSON.stringify(existing));

    router.push("/Templates/CreateQuest");
  };

  return (
    <div className={styles.card}>
      {role === "Admin" && (
        <div className={styles.cardHeader}>
          <button className={styles.editBtn} onClick={handleEdit}>
            ✏️
          </button>

          <button className={styles.deleteBtn} onClick={handleDelete}>
            🗑️
          </button>
        </div>
      )}

      <h3>{template.name}</h3>

      {template.previewImageUrl && (
        <img
          src={`https://localhost:7240${template.previewImageUrl ?? ""}`}
          alt={template.name}
          className={styles.image}
        />
      )}
    
      <button className={styles.button} onClick={handleUse}>
        Использовать
      </button>
    </div>
  );
};
