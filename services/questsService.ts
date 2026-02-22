import { Quest } from "@/Entities/Quest";

export const fetchQuests = async (): Promise<Quest[]> => {
  const res = await fetch("https://localhost:7240/api/quests/GetAllQuests");

  if (!res.ok) throw new Error("Ошибка загрузки");

  return await res.json();
};
