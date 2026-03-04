import { Quest } from "@/Entities/Quest";

const API_BASE_URL = "https://localhost:7240/api/Quests";

export const fetchQuests = async (): Promise<Quest[]> => {
  const res = await fetch(`${API_BASE_URL}/GetAllQuests`);
  if (!res.ok) throw new Error("Ошибка загрузки");
  return await res.json();
};

export const fetchLatestQuests = async (count: number = 5): Promise<Quest[]> => {
  const res = await fetch(`${API_BASE_URL}/GetLatestQuests?count=${count}`);
  if (!res.ok) throw new Error("Ошибка загрузки последних квестов");
  return await res.json();
};

export const searchQuests = async (searchTerm?: string, categoryId?: string): Promise<Quest[]> => {
  const params = new URLSearchParams();
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (categoryId) params.append("categoryId", categoryId);
  
  const res = await fetch(`${API_BASE_URL}/Search?${params.toString()}`);
  if (!res.ok) throw new Error("Ошибка поиска");
  return await res.json();
};
