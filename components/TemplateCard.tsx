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
          localStorage.setItem("selectedTemplate", JSON.stringify(template));
          router.push("/Quest/CreateQuest");
        }}
      >
        Использовать
      </button>
    </div>
  );
};
