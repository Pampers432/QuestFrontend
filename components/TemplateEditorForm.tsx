"use client";

import { useMemo, useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";
import { useZones } from "@/hooks/useZones";
import { useDragResize } from "@/hooks/useDragResize";
import { EditorCanvas } from "@/components/EditorCanvas";
import { EditorPanel } from "@/components/EditorPanel";

interface TemplateEditorFormProps {
  mode: "create" | "edit";
  initialName?: string;
  initialZones?: QuestionPosition[];
  initialPreviewUrl?: string;
  onSubmit: (payload: {
    name: string;
    sceneData: QuestionPosition[];
    previewImage: File | null;
  }) => Promise<void>;
}

export function TemplateEditorForm({
  mode,
  initialName = "",
  initialZones = [{ name: "door", x: 100, y: 100, w: 120, h: 120 }],
  initialPreviewUrl = "",
  onSubmit
}: TemplateEditorFormProps) {
  const [templateName, setTemplateName] = useState(initialName);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { zones, addZone, updateZone, printZones, removeZone } = useZones(initialZones);
  const drag = useDragResize(zones, updateZone);

  const title = useMemo(
    () => (mode === "create" ? "Создание шаблона" : "Редактирование шаблона"),
    [mode]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      alert("Введите название шаблона");
      return;
    }

    if (!previewUrl) {
      alert("Загрузите изображение комнаты");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: templateName.trim(),
        sceneData: zones,
        previewImage
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">{title}</h1>

      <EditorPanel
        templateName={templateName}
        setTemplateName={setTemplateName}
        addZone={addZone}
        saveTemplate={saveTemplate}
        printZones={printZones}
        handleFileChange={handleFileChange}
      />

      {saving && <p>Сохранение...</p>}

      {previewUrl ? (
        <EditorCanvas previewUrl={previewUrl} zones={zones} drag={drag} />
      ) : (
        <p>Загрузите изображение, чтобы начать разметку.</p>
      )}

      <div style={{ marginTop: 16 }}>
        <h3 className="page-subtitle">Объекты</h3>
        <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
          {zones.map((zone, index) => {
            const isDoor = zone.name.toLowerCase() === "door";

            return (
              <div key={`${zone.name}-${index}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="editor-input"
                  value={zone.name}
                  onChange={(e) => updateZone(index, { name: e.target.value })}
                />

                <button
                  className="editor-btn"
                  type="button"
                  onClick={() => removeZone(index)}
                  disabled={isDoor}
                  title={isDoor ? "Дверь нельзя удалить" : "Удалить объект"}
                  style={isDoor ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                >
                  Удалить
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
