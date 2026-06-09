"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSessionDashboard, SessionDashboard } from "@/services/sessionsService";
import Badge from "@/components/Badge";
import { SkeletonCard } from "@/components/Skeleton";

export default function SessionDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [dashboard, setDashboard] = useState<SessionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSessionDashboard(id);
        setDashboard(data);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="page-container" style={{ paddingTop: 40 }}>
      <SkeletonCard />
    </div>
  );
  if (error) return <div className="page-container" style={{ color: "var(--color-error)", paddingTop: 40 }}>{error}</div>;
  if (!dashboard) return <div className="page-container" style={{ paddingTop: 40 }}>Сессия не найдена</div>;

  const statusBadgeVariant = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "completed": return "success";
      case "in_progress": return "warning";
      case "failed": return "error";
      default: return "default";
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, var(--color-sky-light), var(--color-peach))",
        zIndex: 0
      }} />

      <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 600, color: "var(--color-orange)",
            padding: "8px 0", marginBottom: 8
          }}
        >
          ← Назад к аналитике
        </button>

        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          border: "2px solid rgba(255,107,53,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{dashboard.questTitle}</h1>
            <Badge variant={dashboard.isActive ? "success" : "default"}>
              {dashboard.isActive ? "Активна" : "Завершена"}
            </Badge>
          </div>

          <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap", color: "var(--color-text-secondary)", fontSize: 14 }}>
            <span>🔑 Код: <strong>{dashboard.accessCode}</strong></span>
            <span>📅 Начало: {new Date(dashboard.startsAt).toLocaleString("ru-RU")}</span>
            {dashboard.endsAt && <span>⏳ Конец: {new Date(dashboard.endsAt).toLocaleString("ru-RU")}</span>}
            <span>👥 Участников: <strong>{dashboard.totalAttempts}</strong></span>
            <span>✅ Завершили: <strong>{dashboard.completedAttempts}</strong></span>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "var(--color-orange)" }}>Участники</h2>

          {dashboard.attempts.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>Пока нет участников</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,107,53,0.1)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>👤 Участник</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>📊 Статус</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>⭐ Баллы</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>📅 Начало</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>⏹ Завершение</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.attempts.map(a => (
                    <tr key={a.attemptId} style={{ borderBottom: "1px solid rgba(255,107,53,0.06)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-primary)", fontWeight: 600 }}>{a.username}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge variant={statusBadgeVariant(a.status)}>{a.status}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-primary)" }}>{a.score}/{a.maxScore}</td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>
                        {new Date(a.startedAt).toLocaleString("ru-RU")}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>
                        {a.finishedAt ? new Date(a.finishedAt).toLocaleString("ru-RU") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
