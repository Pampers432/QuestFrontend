"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { QuestionPosition } from "@/Entities/QuestionPosition";
import { useZones } from "@/hooks/useZones";
import { useDragResize } from "@/hooks/useDragResize";
import { EditorPanel } from "@/components/EditorPanel";
import { EditorCanvas } from "@/components/EditorCanvas";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";
import { useToast } from "@/components/Toast";

const API_BASE = "http://localhost:7240";
const STATIC_BASE = "http://localhost:7240";

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { toast } = useToast();

  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("/room.png");
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  const {
    zones,
    addZone,
    updateZone,
    removeZone,
    resetZones,
  } = useZones([]);

  const drag = useDragResize(zones, updateZone, imageSize, imageNaturalSize);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const img = containerRef.current?.querySelector('img');
      if (img) {
        setImageSize({
          width: img.clientWidth,
          height: img.clientHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [previewUrl]);

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
    () => (zone: QuestionPosition) => {
      const lower = zone.name.trim().toLowerCase();
      return lower !== "дверь" && lower !== "door";
    },
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

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error("Сервер вернул некорректный формат данных");
      }

      if (responseData.path) {
        setTemplate(prev => {
          if (!prev) return null;
          return {
            ...prev,
            name: templateName,
            previewImage: responseData.path,
            sceneData: zones
          };
        });
        
        setPreviewUrl(
          responseData.path.startsWith("http")
            ? responseData.path
            : `${STATIC_BASE}${responseData.path}`
        );
      } else {
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
      toast("Шаблон успешно сохранён!", "success");
      router.push("/Templates");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast("Ошибка при сохранении шаблона", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--color-text-secondary)" }}><span style={{ fontSize: 24 }}>⏳</span> Загрузка...</div>;
  if (!template) return <div style={{ padding: 24, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-secondary)" }}>🧭 Шаблон не найден</div>;

  return (
    <RoleGuard
      allowedRoles={["Admin"]}
      fallbackMessage="Только администратор может редактировать шаблоны."
    >
      <div ref={containerRef} style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
        <PageSun style={{ position: "fixed", top: "3%", right: "5%", width: 65, height: 65, opacity: 0.3, zIndex: 0 }} className="animate-float-slow" />
        <PageCloud style={{ position: "fixed", top: "8%", left: "3%", width: 85, height: 42, opacity: 0.25, zIndex: 0 }} className="animate-drift" />
        <PageStars style={{ position: "fixed", top: "12%", left: "60%", width: 120, height: 18, opacity: 0.15, zIndex: 0 }} />
        <EditorPanel
          templateName={templateName}
          setTemplateName={setTemplateName}
          addZone={addZone}
          saveTemplate={handleSave}
          handleFileChange={handleFileChange}
          saving={saving}
        />

        <EditorCanvas
          previewUrl={previewUrl}
          zones={zones}
          drag={drag}
          onRemoveZone={removeZone}
          canRemoveZone={canRemoveZone}
          onRenameZone={(index, name) => updateZone(index, { name })}
          imageSize={imageSize}
          imageNaturalSize={imageNaturalSize}
          onImageLoad={(w, h) => {
            setImageNaturalSize({ width: w, height: h });
          }}
        />

        {saving && <p style={{ padding: "0 15px", color: "#666" }}>Сохранение...</p>}
      </div>
    </RoleGuard>
  );
}