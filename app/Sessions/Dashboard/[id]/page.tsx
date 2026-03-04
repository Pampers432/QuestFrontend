"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSessionDashboard, exportSessionReport, SessionDashboard } from "@/services/sessionsService";
import { getStoredRole } from "@/utils/auth";
import RoleGuard from "@/components/RoleGuard";

export default function SessionDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<SessionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = getStoredRole();
    if (role !== "Teacher" && role !== "Admin") {
      router.replace("/");
      return;
    }

    fetchSessionDashboard(params.id)
      .then(setDashboard)
      .catch((err) => setError(err.message || "Ошибка загрузки дашборда"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleExport = async (format: "json" | "csv") => {
    try {
      const blob = await exportSessionReport(params.id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${params.id}_${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Ошибка экспорта отчета");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!dashboard) return <div style={{ padding: 24 }}>Дашборд не найден</div>;

  return (
    <RoleGuard allowedRoles={["Teacher", "Admin"]}>
      <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "10px" }}>Дашборд результатов сессии</h1>

        <div style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px"
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>Код доступа</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{dashboard.accessCode}</div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>Название квеста</div>
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{dashboard.questTitle}</div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>Дата начала</div>
              <div style={{ fontSize: "16px" }}>{new Date(dashboard.startsAt).toLocaleString()}</div>
            </div>
            {dashboard.endsAt && (
              <div>
                <div style={{ fontSize: "14px", color: "#666" }}>Дата окончания</div>
                <div style={{ fontSize: "16px" }}>{new Date(dashboard.endsAt).toLocaleString()}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: "14px", color: "#666" }}>Статус</div>
              <div style={{
                fontSize: "16px",
                color: dashboard.isActive ? "#28a745" : "#dc3545",
                fontWeight: "bold"
              }}>
                {dashboard.isActive ? "Активна" : "Завершена"}
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
          <h2>Результаты прохождения</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleExport("json")}
              style={{
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Экспорт JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              style={{
                padding: "8px 16px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Экспорт CSV
            </button>
          </div>
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "10px",
          overflow: "hidden"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
            gap: "10px",
            padding: "15px",
            background: "#f8f9fa",
            fontWeight: "bold",
            borderBottom: "2px solid #ddd"
          }}>
            <div>Ученик</div>
            <div>Статус</div>
            <div>Баллы</div>
            <div>Макс. баллы</div>
            <div>Начало</div>
            <div>Завершение</div>
          </div>

          {dashboard.attempts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
              Пока нет попыток прохождения
            </div>
          ) : (
            dashboard.attempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                  gap: "10px",
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  alignItems: "center"
                }}
              >
                <div>{attempt.username}</div>
                <div>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    background: attempt.status === "completed" ? "#d4edda" : "#fff3cd",
                    color: attempt.status === "completed" ? "#155724" : "#856404"
                  }}>
                    {attempt.status === "completed" ? "Завершено" : "В процессе"}
                  </span>
                </div>
                <div style={{ fontWeight: "bold" }}>{attempt.score}</div>
                <div>{attempt.maxScore}</div>
                <div style={{ fontSize: "14px" }}>
                  {new Date(attempt.startedAt).toLocaleString()}
                </div>
                <div style={{ fontSize: "14px" }}>
                  {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : "-"}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e7f3ff",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <strong>Всего попыток:</strong> {dashboard.totalAttempts} |{" "}
            <strong>Завершено:</strong> {dashboard.completedAttempts}
          </div>
          <button
            onClick={() => router.back()}
            style={{
              padding: "8px 16px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Назад
          </button>
        </div>
      </div>
    </RoleGuard>
  );
}

