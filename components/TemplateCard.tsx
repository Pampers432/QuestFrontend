"use client";

import { RoomTemplate } from "@/Entities/RoomTemplate";
import { useRouter } from "next/navigation";
import styles from "./TemplateCard.module.css";

export const TemplateCard = ({
  template,
  onDelete
}: {
  template: RoomTemplate;
  onDelete?: (id: string) => void;
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот шаблон?")) return;

    const res = await fetch(
      `https://localhost:7240/api/RoomTemplates/${template.id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      alert("Ошибка при удалении шаблона");
      return;
    }

    onDelete?.(template.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <button
          className={styles.editBtn}
          onClick={() => router.push(`/Templates/EditTemplate/${template.id}`)}
        >
          ✏️
        </button>

        <button className={styles.deleteBtn} onClick={handleDelete}>
          🗑️
        </button>
      </div>

      <h3>{template.name}</h3>

      {template.previewImageUrl && (
        <img
          src={`https://localhost:7240${template.previewImageUrl}`}
          alt={template.name}
          className={styles.image}
        />
      )}

      <button
        className={styles.button}
        onClick={() => {
          localStorage.setItem("selectedTemplate", JSON.stringify(template));
          router.push("/Templates/CreateQuest");
        }}
      >
        Использовать
      </button>
    </div>
  );
};
