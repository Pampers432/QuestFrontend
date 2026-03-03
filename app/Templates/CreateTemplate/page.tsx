"use client";

import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { TemplateEditorForm } from "@/components/TemplateEditorForm";
import { createTemplate } from "@/services/templatesService";

export default function CreateTemplatePage() {
  const router = useRouter();

  return (
    <RoleGuard
      allowedRoles={["Teacher", "Admin"]}
      fallbackMessage="Создание шаблонов доступно только преподавателю и администратору."
    >
      <TemplateEditorForm
        mode="create"
        onSubmit={async (payload) => {
          await createTemplate(payload);
          alert("Шаблон успешно создан");
          router.push("/Templates");
        }}
      />
    </RoleGuard>
  );
}
