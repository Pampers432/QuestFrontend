"use client";

import { useEffect, useState } from "react";
import { RoomTemplate } from "@/types/RoomTemplate";
import { QuestionPosition } from "@/types/QuestionPosition";

export default function Home() {
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("https://localhost:7240/api/quests/GetAllTemplates");

      if (!res.ok) throw new Error("Ошибка загрузки");

      const data = await res.json();

      const mappedTemplates: RoomTemplate[] = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        sceneData: JSON.parse(t.sceneData) as QuestionPosition[],
        previewImageUrl: t.previewImage
      }));

      setTemplates(mappedTemplates);
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить шаблоны");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Шаблоны комнат</h1>

      {templates.length === 0 && <p>Шаблонов пока нет</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 300px)",
          gap: 20
        }}
      >
        {templates.map((template) => {
          const doorCount = template.sceneData.filter(
            (obj) => obj.name.toLowerCase() === "door"
          ).length;

          const zonesCount = template.sceneData.length - doorCount;

          return (
            <div
              key={template.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 15,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}
            >
              <h3>{template.name}</h3>

              {template.previewImageUrl && (
                <img
                  src={`https://localhost:7240${template.previewImageUrl}`}
                  alt={template.name}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 6
                  }}
                />
              )}

              <p>
                Вопросов: <b>{zonesCount}</b>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
