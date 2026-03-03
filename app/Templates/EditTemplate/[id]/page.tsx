"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { TemplateEditorForm } from "@/components/TemplateEditorForm";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplateById, updateTemplate } from "@/services/templatesService";

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplateById(params.id)
      .then(setTemplate)
      .catch(() => setError("Не удалось загрузить шаблон"))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div>Загрузка...</div>;
  if (error || !template) return <div>{error ?? "Шаблон не найден"}</div>;

  return (
    <RoleGuard
      allowedRoles={["Teacher", "Admin"]}
      fallbackMessage="Редактирование шаблонов доступно только преподавателю и администратору."
    >
      <TemplateEditorForm
        mode="edit"
        initialName={template.name}
        initialZones={template.sceneData}
        initialPreviewUrl={`https://localhost:7240${template.previewImageUrl}`}
        onSubmit={async (payload) => {
          try {
            await updateTemplate(params.id, payload);
            alert("Шаблон успешно обновлен");
            router.push("/Templates");
          } catch {
            alert("Не удалось обновить шаблон");
          }
        }}
      />
    </RoleGuard>
  );
}
