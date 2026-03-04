const API_BASE_URL = "https://localhost:7240/api/QuestSessions";

export interface SessionDashboard {
  sessionId: string;
  accessCode: string;
  questTitle: string;
  startsAt: string;
  endsAt?: string;
  isActive: boolean;
  totalAttempts: number;
  completedAttempts: number;
  attempts: AttemptSummary[];
}

export interface AttemptSummary {
  attemptId: string;
  userId: string;
  username: string;
  status: string;
  score: number;
  maxScore: number;
  startedAt: string;
  finishedAt?: string;
}

export const fetchSessionDashboard = async (sessionId: string): Promise<SessionDashboard> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/Dashboard/${sessionId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Ошибка загрузки дашборда");
  return await res.json();
};

export const exportSessionReport = async (sessionId: string, format: "json" | "csv" = "json"): Promise<Blob> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/Export/${sessionId}?format=${format}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Ошибка экспорта отчета");
  return await res.blob();
};

