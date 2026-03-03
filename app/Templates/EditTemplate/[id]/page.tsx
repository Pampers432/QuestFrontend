"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import * as React from "react"; // Добавляем импорт React для использования React.use()

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Распаковываем Promise params с помощью React.use()
  const { id } = React.use(params);
  
  const router = useRouter();
  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Добавляем состояние для отслеживания сохранения

  useEffect(() => {
    // 2. Используем распакованный id
    fetch(`https://localhost:7240/api/Quests/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch template');
        }
        return res.json();
      })
      .then(setTemplate)
      .catch((error) => {
        console.error("Ошибка загрузки шаблона:", error);
        // Можно добавить уведомление об ошибке
      })
      .finally(() => setLoading(false));
  }, [id]); // Зависимость от распакованного id

  const handleSave = async () => {
    if (!template) return;
    
    setSaving(true);
    try {
      // Исправляем URL на правильный эндпоинт из вашего контроллера
      const res = await fetch(
        `https://localhost:7240/api/Quests/${template.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: template.name,
            previewImageUrl: template.previewImageUrl,
            sceneData: template.sceneData
          })
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Ошибка при сохранении");
      }

      alert("Сохранено!");
      router.push("/Templates");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert(`Ошибка при сохранении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (!template) return <div style={{ padding: 24 }}>Шаблон не найден</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Редактирование шаблона</h1>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label htmlFor="name" style={{ fontWeight: "bold" }}>Название</label>
          <input
            id="name"
            type="text"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            disabled={saving}
          />
        </div>

        {template.previewImageUrl && (
          <div style={{ marginTop: 10 }}>
            <img 
              src={`https://localhost:7240${template.previewImageUrl}`} 
              alt={template.name}
              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: saving ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: saving ? "not-allowed" : "pointer",
            fontSize: 16
          }}
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}