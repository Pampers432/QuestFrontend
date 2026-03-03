"use client";

import RoleGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplates } from "@/services/templatesService";
import { TemplateCard } from "@/components/TemplateCard";
import styles from "./Home.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch(() => setError("Не удалось загрузить шаблоны"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <RoleGuard
      allowedRoles={["Teacher", "Admin"]}
      fallbackMessage="Доступ к шаблонам открыт только для преподавателя и администратора."
    >
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>Шаблоны комнат</h1>

          <div className={styles.grid}>
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
            
            <div className={styles.addCard} onClick={() => router.push("/Templates/CreateTemplate")}
            >
              <div className={styles.plus}>+</div>
              <div className={styles.addText}>Добавить шаблон</div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
