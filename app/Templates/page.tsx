"use client";

import RoleGuard from "@/components/RoleGuard";
import { useEffect, useState } from "react";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplates } from "@/services/templatesService";
import TemplateCard from "@/components/TemplateCard";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import { signalRService } from "@/services/signalRService";
import Button from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";

export default function Home() {
  const router = useRouter();
  const role = getStoredRole();
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

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
    if (mounted) initSignalR();
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
    setTemplates(prev => [event.detail, ...prev]);
  };

  const handleTemplateUpdated = (e: Event) => {
    const event = e as CustomEvent<RoomTemplate>;
    setTemplates(prev => prev.map(t => t.id === event.detail.id ? event.detail : t));
  };

  const handleTemplateDeleted = (e: Event) => {
    const event = e as CustomEvent<string>;
    setTemplates(prev => prev.filter(t => t.id !== event.detail));
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return (
    <div className="page-container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
  if (error) return <div className="page-container" style={{ color: "var(--color-error)" }}>{error}</div>;

  return (
    <RoleGuard
      allowedRoles={["Teacher", "Admin"]}
      fallbackMessage="Доступ к шаблонам открыт только для преподавателя и администратора."
    >
      <div className="page-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Шаблоны комнат</h1>
          {role === "Admin" && (
            <Button variant="primary" onClick={() => router.push("/Templates/CreateTemplate")}>
              + Создать шаблон
            </Button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
