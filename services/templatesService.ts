import { RoomTemplate } from "@/Entities/RoomTemplate";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export const fetchTemplates = async (): Promise<RoomTemplate[]> => {
  const res = await fetch("https://localhost:7240/api/quests/GetAllTemplates");

  if (!res.ok) throw new Error("Ошибка загрузки");

  const data = await res.json();

  return data.map((t: any) => ({
    id: t.id,
    name: t.name,
    sceneData: JSON.parse(t.sceneData) as QuestionPosition[],
    previewImageUrl: t.previewImage
  }));
};
