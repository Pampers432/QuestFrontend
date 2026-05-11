"use client";

import { useEffect, useState } from "react";
import { AuthorAnalyticsDto } from "@/Application/DTO/AuthorAnalyticsDto";
import { fetchMyAnalytics } from "@/services/analyticsService";
import { SkeletonCard } from "@/components/Skeleton";
import Badge from "@/components/Badge";

function SummaryCard({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      borderRadius: "var(--radius-lg)",
      padding: 24,
      textAlign: "center",
      color: "white",
      boxShadow: "var(--shadow-md)",
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AuthorAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchMyAnalytics();
        setAnalytics(data);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки аналитики");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) return (
    <div className="page-container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 40 }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
  if (error) return <div className="page-container" style={{ color: "var(--color-error)" }}>{error}</div>;
  if (!analytics) return <div className="page-container">Данные не найдены</div>;

  const statusBadgeVariant = (status: string): "success" | "warning" | "error" | "default" => {
    switch (status) {
      case "completed": return "success";
      case "in_progress": return "warning";
      case "failed": return "error";
      default: return "default";
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Аналитика</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 40 }}>
        <SummaryCard value={analytics.totalQuests} label="Всего квестов" color="#1E3A5F" />
        <SummaryCard value={analytics.totalSessions} label="Сессий" color="#2a5298" />
        <SummaryCard value={analytics.totalAttempts} label="Попыток" color="#FF6F3C" />
        <SummaryCard value={analytics.completedAttempts} label="Завершено" color="#00B894" />
        <SummaryCard value={`${analytics.averageScorePercent?.toFixed(1) ?? "0.0"}%`} label="Средний балл" color="#6C5CE7" />
      </div>

      <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)", border: "1px solid var(--color-border)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: "var(--color-text-primary)" }}>Недавние попытки</h2>
        {analytics.recentAttempts.length === 0 ? (
          <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>Попыток пока нет</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>Пользователь</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>Квест</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>Статус</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>Баллы</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>Дата</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentAttempts.map(attempt => (
                  <tr key={attempt.attemptId} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--color-text-primary)" }}>{attempt.username}</td>
                    <td style={{ padding: "12px 16px", color: "var(--color-text-primary)" }}>{attempt.questTitle}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge variant={statusBadgeVariant(attempt.status)}>{attempt.status}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--color-text-primary)" }}>{attempt.score}/{attempt.maxScore}</td>
                    <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)" }}>
                      {new Date(attempt.startedAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
