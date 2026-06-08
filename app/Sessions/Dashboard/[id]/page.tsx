"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchSessionDashboard, exportSessionReport, SessionDashboard } from "@/services/sessionsService";
import { getStoredRole } from "@/utils/auth";
import RoleGuard from "@/components/RoleGuard";
import Button from "@/components/Button";
import * as XLSX from 'xlsx';
import { signalRService } from "@/services/signalRService";
import { PageSun, PageCloud, PageStars, PageSparkle, PageSmiley, PageTree } from "@/components/PageDoodles";
import { PaintedDots } from "@/app/(landing)/components/Decorations";

export default function SessionDashboardPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [dashboard, setDashboard] = useState<SessionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchSessionDashboard(id);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки дашборда");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const role = getStoredRole();
    if (role !== "Teacher" && role !== "Admin") {
      router.replace("/");
      return;
    }

    loadData();
  }, [id, router, loadData]);

  useEffect(() => {
    let mounted = true;

    const initSignalR = async () => {
      try {
        await signalRService.startConnection();
        await signalRService.subscribeToSession(id);

        window.addEventListener("signalr:SessionUpdated", handleSessionUpdated);
      } catch (error) {
        console.error("[Dashboard] SignalR connection failed:", error);
      }
    };

    if (mounted) {
      initSignalR();
    }

    return () => {
      mounted = false;
      signalRService.stopConnection();
      window.removeEventListener("signalr:SessionUpdated", handleSessionUpdated);
    };
  }, [id]);

  const handleSessionUpdated = (e: Event) => {
    const event = e as CustomEvent<string>;
    const updatedSessionId = event.detail;
    if (updatedSessionId === id) {
      loadData();
    }
  };

  const exportToXLSX = () => {
    if (!dashboard) return;

    try {
      const sessionInfo = [
        ["Информация о сессии"],
        ["Код доступа", dashboard.accessCode],
        ["Название квеста", dashboard.questTitle],
        ["Дата начала", new Date(dashboard.startsAt).toLocaleString()],
        ["Дата окончания", dashboard.endsAt ? new Date(dashboard.endsAt).toLocaleString() : "-"],
        ["Статус", dashboard.isActive ? "Активна" : "Завершена"],
        ["Всего попыток", dashboard.totalAttempts],
        ["Завершено", dashboard.completedAttempts],
        []
      ];

      const resultsHeaders = [
        ["Результаты прохождения"],
        ["Ученик", "Статус", "Баллы", "Макс. баллы", "Начало", "Завершение", "Процент выполнения"]
      ];

      const resultsData = dashboard.attempts.map(attempt => {
        const percentage = attempt.maxScore > 0 
          ? Math.round((attempt.score / attempt.maxScore) * 100) 
          : 0;
        
        return [
          attempt.username,
          attempt.status === "completed" ? "Завершено" : "В процессе",
          attempt.score,
          attempt.maxScore,
          new Date(attempt.startedAt).toLocaleString(),
          attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : "-",
          `${percentage}%`
        ];
      });

      const summary = [
        [],
        ["Статистика"],
        ["Средний балл", dashboard.attempts.length > 0 
          ? (dashboard.attempts.reduce((sum, a) => sum + a.score, 0) / dashboard.attempts.length).toFixed(2)
          : 0
        ],
        ["Максимальный балл", dashboard.attempts.length > 0 
          ? Math.max(...dashboard.attempts.map(a => a.score))
          : 0
        ],
        ["Минимальный балл", dashboard.attempts.length > 0 
          ? Math.min(...dashboard.attempts.map(a => a.score))
          : 0
        ]
      ];

      const worksheetData = [
        ...sessionInfo,
        ...resultsHeaders,
        ...resultsData,
        ...summary
      ];

      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      ws['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Результаты сессии");

      const fileName = `session_${dashboard.questTitle}_${new Date().toISOString().split('T')[0]}.xlsx`
        .replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при создании Excel файла");
    }
  };

  const handleExport = async (format: "json" | "csv" | "xlsx" | "client-xlsx") => {
    if (format === "client-xlsx") {
      exportToXLSX();
      return;
    }
    try {
      const ext = format === "xlsx" ? "xlsx" : format;
      const blob = await exportSessionReport(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${id}_${new Date().toISOString().split("T")[0]}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Ошибка экспорта отчета");
    }
  };

  if (loading) return <div style={{ padding: 24, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--color-text-secondary)" }}><span style={{ fontSize: 24 }}>⏳</span> Загрузка...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!dashboard) return <div style={{ padding: 24 }}>Дашборд не найден</div>;

  return (
    <RoleGuard allowedRoles={["Teacher", "Admin"]}>
      <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, var(--color-sky-light), var(--color-peach))",
          zIndex: 0
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 0 }}>
          <PaintedDots style={{ position: "absolute", top: "8%", right: "5%", width: 170, height: 170, opacity: 0.15 }} />
        </div>
        
        <PageSun
          style={{ position: "fixed", top: "5%", right: "8%", width: 75, height: 75, opacity: 0.4, zIndex: 1 }}
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
        <PageSmiley
          style={{ position: "fixed", top: "45%", left: "45%", width: 55, height: 55, opacity: 0.15, zIndex: 1 }}
          className="animate-bounceSoft"
        />
        <PageStars
          style={{ position: "fixed", top: "25%", left: "65%", width: 120, height: 18, opacity: 0.15, zIndex: 1 }}
        />

        <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ marginBottom: "10px", background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📊 Дашборд результатов сессии
          </h1>

          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            padding: "24px",
            borderRadius: "20px",
            marginBottom: "30px",
            border: "2px solid rgba(255,107,53,0.08)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              <div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>🔑 Код доступа</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--color-orange)" }}>{dashboard.accessCode}</div>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>🎮 Название квеста</div>
                <div style={{ fontSize: "20px", fontWeight: "bold" }}>{dashboard.questTitle}</div>
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>📅 Дата начала</div>
                <div style={{ fontSize: "16px" }}>{new Date(dashboard.startsAt).toLocaleString()}</div>
              </div>
              {dashboard.endsAt && (
                <div>
                  <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>📅 Дата окончания</div>
                  <div style={{ fontSize: "16px" }}>{new Date(dashboard.endsAt).toLocaleString()}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>📊 Статус</div>
                <div style={{
                  fontSize: "16px",
                  color: dashboard.isActive ? "var(--color-success)" : "var(--color-error)",
                  fontWeight: "bold"
                }}>
                  {dashboard.isActive ? "✅ Активна" : "❌ Завершена"}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h2 style={{ color: "var(--color-text-primary)" }}>📋 Результаты прохождения</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button variant="primary" size="sm" onClick={() => handleExport("json")}>
                📄 JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport("xlsx")}>
                📊 Excel (сервер)
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleExport("client-xlsx")}>
                📊 Excel (клиент)
              </Button>
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "2px solid rgba(255,107,53,0.08)",
            borderRadius: "20px",
            overflow: "hidden"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
              gap: "10px",
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(69,183,209,0.08))",
              fontWeight: 700,
              borderBottom: "2px solid rgba(255,107,53,0.1)",
              color: "var(--color-text-secondary)",
              fontSize: 13,
            }}>
              <div>👤 Ученик</div>
              <div>📊 Статус</div>
              <div>⭐ Баллы</div>
              <div>🎯 Макс.</div>
              <div>📈 %</div>
              <div>🕐 Начало</div>
              <div>🏁 Завершение</div>
            </div>

            {dashboard.attempts.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                Пока нет попыток прохождения
              </div>
            ) : (
              dashboard.attempts.map((attempt) => {
                const percentage = attempt.maxScore > 0 
                  ? Math.round((attempt.score / attempt.maxScore) * 100) 
                  : 0;
                
                return (
                  <div
                    key={attempt.attemptId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      gap: "10px",
                      padding: "14px 20px",
                      borderBottom: "1px solid rgba(255,107,53,0.05)",
                      alignItems: "center",
                      fontSize: 14,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{attempt.username}</div>
                    <div>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: attempt.status === "completed" ? "rgba(0,184,148,0.15)" : "rgba(255,234,167,0.4)",
                        color: attempt.status === "completed" ? "var(--color-success)" : "#856404",
                      }}>
                        {attempt.status === "completed" ? "✅ Завершено" : "⏳ В процессе"}
                      </span>
                    </div>
                    <div style={{ fontWeight: "bold", color: "var(--color-orange)" }}>{attempt.score}</div>
                    <div>{attempt.maxScore}</div>
                    <div>
                      <span style={{
                        color: percentage >= 80 ? "var(--color-success)" : percentage >= 60 ? "var(--color-orange)" : "var(--color-error)",
                        fontWeight: "bold"
                      }}>
                        {percentage}%
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      {new Date(attempt.startedAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
                      {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : "-"}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{
            marginTop: "20px",
            padding: "20px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            border: "2px solid rgba(255,107,53,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
              <strong>📊 Всего попыток:</strong> {dashboard.totalAttempts} |{" "}
              <strong>✅ Завершено:</strong> {dashboard.completedAttempts} |{" "}
              <strong>⭐ Средний балл:</strong> {dashboard.attempts.length > 0 
                ? (dashboard.attempts.reduce((sum, a) => sum + a.score, 0) / dashboard.attempts.length).toFixed(1)
                : 0
              }
            </div>
            <Button variant="ghost" onClick={() => router.back()}>
              ← Назад
            </Button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
