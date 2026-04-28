"use client";

import { useEffect, useMemo, useState } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { QuestionPosition } from "@/Entities/QuestionPosition";
import { useZones } from "@/hooks/useZones";
import { useDragResize } from "@/hooks/useDragResize";
import { EditorPanel } from "@/components/EditorPanel";
import { EditorCanvas } from "@/components/EditorCanvas";

const API_BASE = "http://localhost:7240";
const STATIC_BASE = "http://localhost:7240";

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("/room.png");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const {
    zones,
    addZone,
    updateZone,
    removeZone,
    resetZones,
    printZones
  } = useZones([]);

  const drag = useDragResize(zones, updateZone);

  useEffect(() => {
    if (template?.sceneData) {
      resetZones(template.sceneData);
    }
  }, [template, resetZones]);

  useEffect(() => {
    fetch(`${API_BASE}/api/Quests/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch template");
        }
        return res.json();
      })
      .then((data) => {
        const normalized: RoomTemplate = {
          ...data,
          sceneData:
            typeof data.sceneData === "string"
              ? (JSON.parse(data.sceneData) as QuestionPosition[])
              : (data.sceneData as QuestionPosition[])
        };

        setTemplate(normalized);
        setTemplateName(normalized.name ?? "");
        
        const imageUrl = normalized.previewImage || normalized.previewImageUrl;
        setPreviewUrl(
          imageUrl?.startsWith("http")
            ? imageUrl
            : `${STATIC_BASE}${imageUrl}`
        );
      })
      .catch((error) => {
        console.error("Ошибка загрузки шаблона:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const canRemoveZone = useMemo(
    () => (zone: QuestionPosition) => zone.name.trim().toLowerCase() !== "door",
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const formData = new FormData();
      
      formData.append("Id", template.id || "");
      formData.append("Name", templateName);
      formData.append("SceneData", JSON.stringify(zones));
      
      if (previewFile) {
        formData.append("PreviewImage", previewFile);
      }

      const response = await fetch(`${API_BASE}/api/Quests/${template.id}`, {
        method: "PUT",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      // Пробуем распарсить ответ
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error("Сервер вернул некорректный формат данных");
      }

      // Обновляем шаблон в зависимости от типа ответа
      if (responseData.path) {
        // Это ответ от PostTemplate - обновляем только изображение
        setTemplate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: templateName,
            previewImage: responseData.path,
            sceneData: zones
          };
        });
        
         // Обновляем URL превью
         setPreviewUrl(
           responseData.path.startsWith("http")
             ? responseData.path
             : `${STATIC_BASE}${responseData.path}`
         );
      } else {
        // Это ответ от UpdateTemplate - используем полученные данные
        const updatedTemplate: RoomTemplate = {
          ...responseData,
          sceneData:
            typeof responseData.sceneData === "string"
              ? JSON.parse(responseData.sceneData)
              : responseData.sceneData || zones
        };
        setTemplate(updatedTemplate);
        
         if (updatedTemplate.previewImage) {
           setPreviewUrl(
             updatedTemplate.previewImage.startsWith("http")
               ? updatedTemplate.previewImage
               : `${STATIC_BASE}${updatedTemplate.previewImage}`
           );
         }
      }
      
      setPreviewFile(null);
      alert("Сохранено!");
      router.push("/Templates");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert(`Ошибка при сохранении: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (!template) return <div style={{ padding: 24 }}>Шаблон не найден</div>;

  return (
    <RoleGuard
      allowedRoles={["Admin"]}
      fallbackMessage="Только администратор может редактировать шаблоны."
    >
      <div>
        <EditorPanel
          templateName={templateName}
          setTemplateName={setTemplateName}
          addZone={addZone}
          saveTemplate={handleSave}
          printZones={printZones}
          handleFileChange={handleFileChange}
          saving={saving}
        />

        <EditorCanvas
          previewUrl={previewUrl}
          zones={zones}
          drag={drag}
          onRemoveZone={removeZone}
          canRemoveZone={canRemoveZone}
        />

        {saving && <p style={{ padding: "0 15px", color: "#666" }}>Сохранение...</p>}
      </div>
    </RoleGuard>
  );
}