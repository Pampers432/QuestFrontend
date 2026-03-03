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

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("/room.png");

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
    fetch(`https://localhost:7240/api/Quests/${id}`)
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
        setPreviewUrl(
          normalized.previewImageUrl?.startsWith("http")
            ? normalized.previewImageUrl
            : `https://localhost:7240${normalized.previewImageUrl}`
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
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const res = await fetch(`https://localhost:7240/api/Quests/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          previewImageUrl: template.previewImageUrl,
          sceneData: zones
        })
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "Ошибка при сохранении");
      }

      alert("Сохранено!");
      router.push("/Templates");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert(
        `Ошибка при сохранении: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
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
