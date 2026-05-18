import React from "react";
import Button from "./Button";

interface EditorPanelProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  addZone: () => void;
  saveTemplate: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving?: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  templateName,
  setTemplateName,
  addZone,
  saveTemplate,
  handleFileChange,
  saving = false
}) => {
  return (
    <div style={{ 
      padding: "20px", 
      borderBottom: "1px solid #ccc",
      display: "flex",
      gap: "20px",
      alignItems: "center",
      flexWrap: "wrap"
    }}>
      <div>
        <label htmlFor="templateName" style={{ marginRight: "10px" }}>
          Название шаблона:
        </label>
        <input
          id="templateName"
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Введите название"
          style={{ padding: "5px", width: "200px" }}
          disabled={saving}
        />
      </div>

      <div>
        <label htmlFor="previewImage" style={{ marginRight: "10px" }}>
          Изображение:
        </label>
        <input
          id="previewImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={saving}
          style={{ cursor: "pointer", border: "2px dashed var(--color-border)", borderRadius: 8, padding: 8 }}
        />
      </div>

      <Button variant="primary" size="sm" onClick={addZone} disabled={saving}>
        + Добавить зону
      </Button>

      <Button variant="secondary" size="sm" onClick={saveTemplate} loading={saving}>
        {saving ? "Сохранение..." : "Сохранить шаблон"}
      </Button>
    </div>
  );
};