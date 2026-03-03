"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { useZones } from "@/hooks/useZones";
import { useDragResize } from "@/hooks/useDragResize";
import { EditorPanel } from "@/components/EditorPanel";
import { EditorCanvas } from "@/components/EditorCanvas";

export default function Home() {
  const router = useRouter();
  const { zones, addZone, updateZone, removeZone, printZones } = useZones([
    { name: "Door", x: 100, y: 150, w: 200, h: 350 },
    { name: "obj1", x: 350, y: 140, w: 120, h: 380 }
  ]);

  const drag = useDragResize(zones, updateZone);

  const [templateName, setTemplateName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("/room.png");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Введите название шаблона");
      return;
    }

    if (!previewFile) {
      alert("Выберите изображение для превью");
      return;
    }

    if (zones.length === 0) {
      alert("Добавьте хотя бы одну зону");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("Name", templateName);
      formData.append("PreviewImage", previewFile);
      formData.append("SceneData", JSON.stringify(zones));

      const response = await fetch("https://localhost:7240/api/Quests/PostTemplate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при сохранении шаблона");
      }

      const result = await response.json();
      
      alert(result.message || "Шаблон успешно сохранен!");
      
      setTemplateName("");
      setPreviewUrl("/room.png");
      setPreviewFile(null);
      
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      alert(`Ошибка: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
    } finally {
      setSaving(false);
    }
  };

  const canRemoveZone = (zoneName: string) => zoneName.trim().toLowerCase() !== "door";

  return (
    <RoleGuard
      allowedRoles={["Admin"]}
      fallbackMessage="Только администратор может добавлять шаблоны."
    >
      <div>
        <EditorPanel
          templateName={templateName}
          setTemplateName={setTemplateName}
          addZone={addZone}
          saveTemplate={saveTemplate}
          printZones={printZones}
          handleFileChange={handleFileChange}
          saving={saving}
        />

        <EditorCanvas
          previewUrl={previewUrl}
          zones={zones}
          drag={drag}
          onRemoveZone={removeZone}
          canRemoveZone={(zone) => canRemoveZone(zone.name)}
        />
      </div>
    </RoleGuard>
  );
}