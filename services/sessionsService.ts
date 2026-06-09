const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240"}/api/QuestSessions`;

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

export const exportSessionReport = async (sessionId: string, format: "json" | "csv" | "xlsx" = "json"): Promise<Blob> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/Export/${sessionId}?format=${format}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Ошибка экспорт отчета");
  return await res.blob();
};

export interface QuestSessionListItem {
  id: string;
  questTitle: string;
  accessCode: string;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  participantCount: number;
}

export const fetchRecentSessions = async (count: number = 10): Promise<QuestSessionListItem[]> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/RecentByAuthor?count=${count}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Ошибка загрузки сессий");
  return await res.json();
};
