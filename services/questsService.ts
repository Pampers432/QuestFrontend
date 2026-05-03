import { Quest } from "@/Entities/Quest";
import { CreateQuestRequest } from "@/Entities/Dto";

const API_BASE_URL = "http://localhost:7240/api/Quests";

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

export const fetchQuestById = async (id: string): Promise<Quest> => {
  const res = await fetch(`${API_BASE_URL}/GetById/${id}`);
  if (!res.ok) throw new Error("Квест не найден");
  return await res.json();
};

export const fetchQuestsByStatus = async (status: string): Promise<Quest[]> => {
  const res = await fetch(`${API_BASE_URL}/ByStatus?status=${encodeURIComponent(status)}`);
  if (!res.ok) throw new Error("Ошибка загрузки квестов по статусу");
  return await res.json();
};

export const updateQuest = async (id: string, request: CreateQuestRequest): Promise<void> => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Необходимо авторизоваться");

  const res = await fetch(`${API_BASE_URL}/UpdateQuest/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ошибка обновления: ${res.status} - ${errorText}`);
  }
};

export const deleteQuest = async (id: string): Promise<void> => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Необходимо авторизоваться");

  const res = await fetch(`${API_BASE_URL}/DeleteQuest/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ошибка удаления: ${res.status} - ${errorText}`);
  }
};
