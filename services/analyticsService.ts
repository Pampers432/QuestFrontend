import { AuthorAnalyticsDto } from "@/Application/DTO/AuthorAnalyticsDto";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240"}/api/Quests`;

export const fetchMyAnalytics = async (): Promise<AuthorAnalyticsDto> => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Необходимо авторизоваться");
  }

  const res = await fetch(`${API_BASE_URL}/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ошибка загрузки аналитики: ${res.status} - ${errorText}`);
  }

  return await res.json();
};
