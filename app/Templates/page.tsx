"use client";

import * as React from "react";
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
import { PageSun, PageCloud, PageSparkle, PageStars, PageTree, PageHouse, PageChristmasTree } from "@/components/PageDoodles";
import { PaintedDots } from "@/app/(landing)/components/Decorations";

export default function Home({ searchParams }: { searchParams: Promise<{ select?: string }> }) {
  const router = useRouter();
  const sp = React.use(searchParams);
  const selectMode = sp.select === "true";
  const role = getStoredRole();
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  const handleSelectForQuest = (template: RoomTemplate) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(template.id!)) {
        next.delete(template.id!);
      } else {
        next.add(template.id!);
      }
      return next;
    });
  };

  const confirmSelection = () => {
    const selected = templates.filter(t => selectedIds.has(t.id!));
    localStorage.setItem("selectedTemplates", JSON.stringify(selected));
    router.push("/Quests/CreateQuest");
  };

  if (loading) return (
    <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
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
      <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, var(--color-sky-light), var(--color-peach))",
          zIndex: 0
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 0 }}>
          <PaintedDots style={{ position: "absolute", top: "8%", left: "2%", width: 180, height: 180, opacity: 0.15 }} />
        </div>
        
        <PageSun
          style={{ position: "fixed", top: "3%", right: "8%", width: 75, height: 75, opacity: 0.4, zIndex: 1 }}
          className="animate-float-slow"
        />
        <PageCloud
          style={{ position: "fixed", top: "12%", left: "5%", width: 110, height: 55, opacity: 0.35, zIndex: 1 }}
          className="animate-drift"
        />
        <PageSparkle
          style={{ position: "fixed", top: "75%", right: "8%", width: 35, height: 35, opacity: 0.25, zIndex: 1 }}
          className="animate-sparkle"
        />
        <PageTree
          style={{ position: "fixed", bottom: "10%", left: "3%", width: 80, height: 110, opacity: 0.25, zIndex: 1 }}
          className="animate-wobble"
        />
        <PageHouse
          style={{ position: "fixed", bottom: "15%", right: "10%", width: 75, height: 75, opacity: 0.2, zIndex: 1 }}
        />
        <PageChristmasTree
          style={{ position: "fixed", top: "50%", right: "3%", width: 65, height: 90, opacity: 0.15, zIndex: 1 }}
        />
        <PageStars
          style={{ position: "fixed", top: "25%", left: "60%", width: 120, height: 18, opacity: 0.15, zIndex: 1 }}
        />

        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h1 className="page-title" style={{ margin: 0, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🏗️ Шаблоны комнат
            </h1>
            {role === "Admin" && !selectMode && (
              <Button variant="primary" onClick={() => router.push("/Templates/CreateTemplate")}>
                + Создать шаблон
              </Button>
            )}
          </div>

          {selectMode && (
            <div style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "2px solid var(--color-orange)",
            }}>
              <span style={{ fontWeight: 600, color: "var(--color-orange)" }}>
                {selectedIds.size === 0
                  ? "Выберите шаблоны для квеста"
                  : `Выбрано ${selectedIds.size} шаблон${selectedIds.size === 1 ? "" : "ов"}`}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => router.push("/Quests/CreateQuest")}>
                  Отмена
                </Button>
                <Button variant="primary" size="sm" onClick={confirmSelection} disabled={selectedIds.size === 0}>
                  Подтвердить выбор
                </Button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={selectedIds.has(template.id!)}
                onSelectForQuest={selectMode ? () => handleSelectForQuest(template) : undefined}
                onDelete={handleDelete}
                onCardClick={selectMode ? () => handleSelectForQuest(template) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
