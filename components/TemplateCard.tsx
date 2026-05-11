"use client";

import { RoomTemplate } from "@/Entities/RoomTemplate";
import styles from "./TemplateCard.module.css";
import Button from "./Button";
import { useRouter } from "next/navigation";
import { canManageTemplates, getStoredRole } from "@/utils/auth";

interface TemplateCardProps {
  template: RoomTemplate;
  onSelectForQuest?: (template: RoomTemplate) => void;
  onDelete?: (id: string) => void;
}

export default function TemplateCard({ template, onSelectForQuest, onDelete }: TemplateCardProps) {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";
  const role = getStoredRole();
  const canEdit = canManageTemplates(role);

  return (
    <div className={styles.card}>
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
          <Button variant="primary" size="sm" onClick={() => onSelectForQuest(template)}>
            Использовать
          </Button>
        )}
        {canEdit && (
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/Templates/EditTemplate/${template.id}`)}>
              Редактировать
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/Templates/${template.id}/Renames`)}>
              Переименовать
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
