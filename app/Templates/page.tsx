"use client";

import RoleGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplates } from "@/services/templatesService";
import { TemplateCard } from "@/components/TemplateCard";
import styles from "./Home.module.css";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { signalRService } from "@/services/signalRService";

export default function Home() {
  const router = useRouter();
  const role = getStoredRole();

  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    loadTemplates();
  }, []);

  // SignalR integration
  useEffect(() => {
    let mounted = true;

    const initSignalR = async () => {
      try {
        await signalRService.startConnection();
        await signalRService.subscribeToTemplates();

        window.addEventListener("signalr:TemplateCreated", handleTemplateCreated);
        window.addEventListener("signalr:TemplateUpdated", handleTemplateUpdated);
        window.addEventListener("signalr:TemplateDeleted", handleTemplateDeleted);
      } catch (error) {
        console.error("[TemplatesPage] SignalR error:", error);
      }
    };

    if (mounted) {
      initSignalR();
    }

    return () => {
      mounted = false;
      signalRService.stopConnection();
      window.removeEventListener("signalr:TemplateCreated", handleTemplateCreated);
      window.removeEventListener("signalr:TemplateUpdated", handleTemplateUpdated);
      window.removeEventListener("signalr:TemplateDeleted", handleTemplateDeleted);
    };
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await fetchTemplates();
      setTemplates(data);
    } catch {
      setError("Не удалось загрузить шаблоны");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCreated = (e: Event) => {
    const event = e as CustomEvent<RoomTemplate>;
    const newTemplate = event.detail;
    console.log("[TemplatesPage] Template created:", newTemplate);
    setTemplates(prev => [newTemplate, ...prev]);
  };

  const handleTemplateUpdated = (e: Event) => {
    const event = e as CustomEvent<RoomTemplate>;
    const updated = event.detail;
    console.log("[TemplatesPage] Template updated:", updated);
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleTemplateDeleted = (e: Event) => {
    const event = e as CustomEvent<string>;
    const deletedId = event.detail;
    console.log("[TemplatesPage] Template deleted:", deletedId);
    setTemplates(prev => prev.filter(t => t.id !== deletedId));
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

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
              <TemplateCard
                key={template.id}
                template={template}
                onDelete={handleDelete}
              />
            ))}

            {role === "Admin" && (
              <div
                className={styles.addCard}
                onClick={() => router.push("/Templates/CreateTemplate")}
              >
                <div className={styles.plus}>+</div>
                <div className={styles.addText}>Добавить шаблон</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
