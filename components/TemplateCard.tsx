"use client";

import { RoomTemplate } from "@/Entities/RoomTemplate";
import styles from "./TemplateCard.module.css";
import Button from "./Button";
import { useRouter } from "next/navigation";
import { canManageTemplates, getStoredRole } from "@/utils/auth";

interface TemplateCardProps {
  template: RoomTemplate;
  selected?: boolean;
  onSelectForQuest?: (template: RoomTemplate) => void;
  onDelete?: (id: string) => void;
}

export default function TemplateCard({ template, selected, onSelectForQuest, onDelete }: TemplateCardProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";
  const role = getStoredRole();
  const canEdit = canManageTemplates(role);

  return (
    <div className={styles.card} style={{
      boxShadow: selected ? "0 0 0 3px var(--color-orange), var(--shadow-sm)" : undefined,
      borderRadius: 12,
      position: "relative",
    }}>
      {selected && (
        <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "var(--color-orange)",
          color: "#fff",
          borderRadius: "50%",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
          zIndex: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}>
          ✓
        </div>
      )}
      <div className={styles.imageWrapper}>
        <img
          src={`${baseUrl}${template.previewImageUrl}`}
          alt={template.name}
          className={styles.image}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{template.name}</h3>
        <p className={styles.zones}>{template.sceneData?.length || 0} зон</p>
      </div>
      <div className={styles.actions}>
        {onSelectForQuest && (
          <Button variant={selected ? "secondary" : "primary"} size="sm" onClick={() => onSelectForQuest(template)}>
            {selected ? "Убрать" : "Использовать"}
          </Button>
        )}
        {canEdit && !onSelectForQuest && (
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/Templates/EditTemplate/${template.id}`)}>
              Редактировать
            </Button>
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(template.id!)}>
                Удалить
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
