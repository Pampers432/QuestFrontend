"use client";

import { RoomTemplate } from "@/Entities/RoomTemplate";
import { calculateDoorCount, calculateZonesCount } from "@/utils/sceneUtils";
import { useRouter } from "next/navigation";
import styles from "./TemplateCard.module.css";

export const TemplateCard = ({ template }: { template: RoomTemplate }) => {
  const router = useRouter();

  const zonesCount = calculateZonesCount(template.sceneData);

  return (
    <div className={styles.card}>
      <h3>{template.name}</h3>

      {template.previewImageUrl && (
        <img
          src={`https://localhost:7240${template.previewImageUrl}`}
          alt={template.name}
          className={styles.image}
        />
      )}

      <p>
        Вопросов: <b>{zonesCount}</b>
      </p>

      <button
        className={styles.button}
        onClick={() => {
          const saved = localStorage.getItem("selectedTemplates");
          const templates = saved ? JSON.parse(saved) : [];

          const exists = templates.some((t: RoomTemplate) => t.id === template.id);
          if (!exists) {
            templates.push(template);
          }

          localStorage.setItem("selectedTemplates", JSON.stringify(templates));

          router.push("/Templates/CreateQuest");
        }}
      >
        Использовать
      </button>
    </div>
  );
};
