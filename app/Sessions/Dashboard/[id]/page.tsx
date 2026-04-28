"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchSessionDashboard, exportSessionReport, SessionDashboard } from "@/services/sessionsService";
import { getStoredRole } from "@/utils/auth";
import RoleGuard from "@/components/RoleGuard";
import * as XLSX from 'xlsx';
import { signalRService } from "@/services/signalRService";

export default function SessionDashboardPage() {
  const params = useParams();
  const id = params.id as string;

  const router = useRouter();
  const [dashboard, setDashboard] = useState<SessionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
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

  // SignalR integration
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
    console.log("[Dashboard] Session updated:", updatedSessionId);
    // If this is the current session, refresh data
    if (updatedSessionId === id) {
      loadData();
    }
  };

  const exportToXLSX = () => {
    if (!dashboard) return;

    try {
      // Подготовка данных для Excel
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

      // Заголовки для таблицы результатов
      const resultsHeaders = [
        ["Результаты прохождения"],
        ["Ученик", "Статус", "Баллы", "Макс. баллы", "Начало", "Завершение", "Процент выполнения"]
      ];

      // Данные по попыткам
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

      // Итоговая статистика
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

      // Объединяем все данные
      const worksheetData = [
        ...sessionInfo,
        ...resultsHeaders,
        ...resultsData,
        ...summary
      ];

      // Создаем рабочий лист
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Настраиваем ширину колонок
      ws['!cols'] = [
        { wch: 25 }, // Ученик
        { wch: 15 }, // Статус
        { wch: 10 }, // Баллы
        { wch: 12 }, // Макс. баллы
        { wch: 20 }, // Начало
        { wch: 20 }, // Завершение
        { wch: 15 }  // Процент
      ];

      // Создаем книгу и добавляем лист
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Результаты сессии");

      // Генерируем имя файла
      const fileName = `session_${dashboard.questTitle}_${new Date().toISOString().split('T')[0]}.xlsx`
        .replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_'); // Убираем спецсимволы

      // Сохраняем файл
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Ошибка экспорта:", err);
      alert("Ошибка при создании Excel файла");
    }
  };

  const handleExport = async (format: "json" | "xlsx") => {
    if (format === "xlsx") {
      exportToXLSX();
    } else {
      try {
        const blob = await exportSessionReport(id, format);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `session_${id}_${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        alert("Ошибка экспорта отчета");
      }
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
              onClick={() => handleExport("xlsx")}
              style={{
                padding: "8px 16px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Экспорт Excel
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
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
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
            <div>%</div>
            <div>Начало</div>
            <div>Завершение</div>
          </div>

          {dashboard.attempts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
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
                  <div>
                    <span style={{
                      color: percentage >= 80 ? "#28a745" : percentage >= 60 ? "#ffc107" : "#dc3545",
                      fontWeight: "bold"
                    }}>
                      {percentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    {new Date(attempt.startedAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : "-"}
                  </div>
                </div>
              );
            })
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
            <strong>Завершено:</strong> {dashboard.completedAttempts} |{" "}
            <strong>Средний балл:</strong> {dashboard.attempts.length > 0 
              ? (dashboard.attempts.reduce((sum, a) => sum + a.score, 0) / dashboard.attempts.length).toFixed(1)
              : 0
            }
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