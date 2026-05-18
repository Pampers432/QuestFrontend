"use client";

import { useEffect, useState } from "react";
import { AuthorAnalyticsDto } from "@/Application/DTO/AuthorAnalyticsDto";
import { fetchMyAnalytics } from "@/services/analyticsService";
import { SkeletonCard } from "@/components/Skeleton";
import Badge from "@/components/Badge";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";

function SummaryCard({ value, label, color, icon }: { value: string | number; label: string; color: string; icon?: string }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      borderRadius: 20,
      padding: 28,
      textAlign: "center",
      color: "white",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      position: "relative",
      overflow: "hidden",
    }}>
      {icon && <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.9 }}>{icon}</div>}
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
    <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "6%", width: 65, height: 65, opacity: 0.3, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "8%", left: "3%", width: 85, height: 42, opacity: 0.25, zIndex: 0 }}
        className="animate-drift"
      />
      <PageStars
        style={{ position: "fixed", top: "12%", left: "50%", width: 130, height: 20, opacity: 0.15, zIndex: 0 }}
      />

      <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
        <h1 className="page-title" style={{ background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          📊 Аналитика
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 40 }}>
          <SummaryCard value={analytics.totalQuests} label="Всего квестов" color="#1E3A5F" icon="🎮" />
          <SummaryCard value={analytics.totalSessions} label="Сессий" color="#2a5298" icon="📋" />
          <SummaryCard value={analytics.totalAttempts} label="Попыток" color="#FF6F3C" icon="🎯" />
          <SummaryCard value={analytics.completedAttempts} label="Завершено" color="#00B894" icon="✅" />
          <SummaryCard value={`${analytics.averageScorePercent?.toFixed(1) ?? "0.0"}%`} label="Средний балл" color="#6C5CE7" icon="⭐" />
        </div>

        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          border: "2px solid rgba(255,107,53,0.08)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "var(--color-orange)" }}>
            🕐 Недавние попытки
          </h2>
          {analytics.recentAttempts.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>Попыток пока нет</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255,107,53,0.1)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>👤 Пользователь</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>🎮 Квест</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>📊 Статус</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>⭐ Баллы</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)" }}>📅 Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentAttempts.map(attempt => (
                    <tr key={attempt.attemptId} style={{ borderBottom: "1px solid rgba(255,107,53,0.06)" }}>
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
    </div>
  );
}
