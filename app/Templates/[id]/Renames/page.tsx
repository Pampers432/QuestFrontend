"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplateById, fetchTemplateRenames, updateTemplateRenames } from "@/services/templatesService";
import Button from "@/components/Button";

export default function TemplateRenamesPage() {
  const params = useParams();
  const templateId = params.id as string;
  const router = useRouter();

  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const tpl = await fetchTemplateById(templateId);
        setTemplate(tpl);
        const initialMap: Record<string, string> = {};
        tpl.sceneData.forEach((zone: any) => {
          initialMap[zone.name] = zone.name;
        });
        setRenameMap(initialMap);

        const renames = await fetchTemplateRenames(templateId);
        renames.forEach((r: any) => {
          if (initialMap.hasOwnProperty(r.systemKey)) {
            initialMap[r.systemKey] = r.displayName;
          }
        });
        setRenameMap({ ...initialMap });
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [templateId]);

  const handleChange = (systemKey: string, value: string) => {
    setRenameMap(prev => ({ ...prev, [systemKey]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const renamesArray = Object.entries(renameMap).map(([systemKey, displayName]) => ({
        systemKey,
        displayName,
      }));
      await updateTemplateRenames(templateId, renamesArray);
      router.back();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-container">Загрузка...</div>;
  if (error) return <div className="page-container" style={{ color: "var(--color-error)" }}>{error}</div>;
  if (!template) return <div className="page-container">Шаблон не найден</div>;

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Переименования зон</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
          Шаблон: <strong>{template.name}</strong>
        </p>
      </div>

      <div style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--color-surface)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-background)", borderBottom: "2px solid var(--color-border)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 13, textTransform: "uppercase" }}>Системное имя</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 13, textTransform: "uppercase" }}>Отображаемое название</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(renameMap).map(([systemKey, displayName]) => (
              <tr key={systemKey} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "12px 16px", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
                  {systemKey}
                </td>
                <td style={{ padding: "8px 16px" }}>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => handleChange(systemKey, e.target.value)}
                    maxLength={50}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 14,
                      background: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          Сохранить
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Назад
        </Button>
      </div>
    </div>
  );
}
