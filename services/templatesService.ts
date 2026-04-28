import { RoomTemplate } from "@/Entities/RoomTemplate";
import { QuestionPosition } from "@/Entities/QuestionPosition";

const API_BASE_URL = "http://localhost:7240/api/quests";

export const fetchTemplates = async (): Promise<RoomTemplate[]> => {
  const res = await fetch(`${API_BASE_URL}/GetAllTemplates`);

  if (!res.ok) throw new Error("Ошибка загрузки");

  const data = await res.json();

  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    sceneData: JSON.parse(t.sceneData) as QuestionPosition[],
    previewImageUrl: t.previewImage
  }));
};

export const fetchTemplateById = async (id: string): Promise<RoomTemplate> => {
  const res = await fetch(`${API_BASE_URL}/GetTemplateById/${id}`);

  if (!res.ok) throw new Error("Ошибка загрузки шаблона");

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    sceneData: JSON.parse(data.sceneData) as QuestionPosition[],
    previewImageUrl: data.previewImage
  };
};

export const createTemplate = async (formData: FormData): Promise<any> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/PostTemplate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) throw new Error("Ошибка создания шаблона");
  return await res.json();
};

export const updateTemplate = async (id: string, formData: FormData): Promise<any> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) throw new Error("Ошибка обновления шаблона");
  return await res.json();
};
