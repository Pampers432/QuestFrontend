"use client";

import RoleGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplates } from "@/services/templatesService";
import { TemplateCard } from "@/components/TemplateCard";
import styles from "./Home.module.css";

export default function Home() {
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
        <h1>Шаблоны комнат</h1>

        <div className={styles.grid}>
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
