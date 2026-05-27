"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { fetchTemplateById, fetchTemplateRenames, updateTemplateRenames } from "@/services/templatesService";
import Button from "@/components/Button";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";

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
        if (typeof tpl.sceneData === "string") tpl.sceneData = JSON.parse(tpl.sceneData);
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
    <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "6%", width: 65, height: 65, opacity: 0.3, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "8%", left: "3%", width: 85, height: 42, opacity: 0.25, zIndex: 0 }}
        className="animate-drift"
      />
      <PageStars
        style={{ position: "fixed", top: "12%", left: "50%", width: 130, height: 20, opacity: 0.15, zIndex: 0 }}
      />

      <div className="page-container" style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title" style={{ margin: 0, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📝 Переименования зон
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: 8 }}>
            🏗️ Шаблон: <strong>{template.name}</strong>
          </p>
        </div>

        <div style={{
          border: "2px solid rgba(255,107,53,0.1)",
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(69,183,209,0.08))", borderBottom: "2px solid rgba(255,107,53,0.1)" }}>
                <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700, color: "var(--color-text-secondary)", fontSize: 13, textTransform: "uppercase" }}>🔧 Системное имя</th>
                <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700, color: "var(--color-text-secondary)", fontSize: 13, textTransform: "uppercase" }}>📌 Отображаемое название</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(renameMap).map(([systemKey, displayName]) => (
                <tr key={systemKey} style={{ borderBottom: "1px solid rgba(255,107,53,0.06)" }}>
                  <td style={{ padding: "14px 20px", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", fontSize: 14 }}>
                    {systemKey}
                  </td>
                  <td style={{ padding: "10px 20px" }}>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => handleChange(systemKey, e.target.value)}
                      maxLength={50}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "2px solid var(--color-border)",
                        borderRadius: 12,
                        fontSize: 14,
                        background: "var(--color-surface)",
                        color: "var(--color-text-primary)",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.3s ease",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
                      onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            💾 Сохранить
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            ← Назад
          </Button>
        </div>
      </div>
    </div>
  );
}
