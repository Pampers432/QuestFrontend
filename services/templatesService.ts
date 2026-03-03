import { RoomTemplate } from "@/Entities/RoomTemplate";
import { QuestionPosition } from "@/Entities/QuestionPosition";

const API_BASE = "https://localhost:7240/api/quests";

type RawTemplate = {
  id: string;
  name: string;
  sceneData: string;
  previewImage: string;
};

const mapTemplate = (t: RawTemplate): RoomTemplate => ({
  id: t.id,
  name: t.name,
  sceneData: JSON.parse(t.sceneData) as QuestionPosition[],
  previewImageUrl: t.previewImage
});

export const fetchTemplates = async (): Promise<RoomTemplate[]> => {
  const res = await fetch(`${API_BASE}/GetAllTemplates`);

  if (!res.ok) throw new Error("Ошибка загрузки");

  const data = (await res.json()) as RawTemplate[];

  return data.map(mapTemplate);
};

export const fetchTemplateById = async (id: string): Promise<RoomTemplate> => {
  const templates = await fetchTemplates();
  const template = templates.find((item) => item.id === id);

  if (!template) {
    throw new Error("Шаблон не найден");
  }

  return template;
};

export const createTemplate = async (payload: {
  name: string;
  sceneData: QuestionPosition[];
  previewImage: File | null;
}) => {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("sceneData", JSON.stringify(payload.sceneData));

  if (payload.previewImage) {
    form.append("previewImage", payload.previewImage);
  }

  const res = await fetch(`${API_BASE}/CreateTemplate`, {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    throw new Error("Не удалось создать шаблон");
  }
};

export const updateTemplate = async (
  id: string,
  payload: {
    name: string;
    sceneData: QuestionPosition[];
    previewImage: File | null;
  }
) => {
  const form = new FormData();
  form.append("id", id);
  form.append("name", payload.name);
  form.append("sceneData", JSON.stringify(payload.sceneData));

  if (payload.previewImage) {
    form.append("previewImage", payload.previewImage);
  }

  const res = await fetch(`${API_BASE}/EditTemplate`, {
    method: "PUT",
    body: form
  });

  if (!res.ok) {
    throw new Error("Не удалось обновить шаблон");
  }
};
