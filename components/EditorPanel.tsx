import React from "react";

interface EditorPanelProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  addZone: () => void;
  saveTemplate: () => void;
  printZones: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving?: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  templateName,
  setTemplateName,
  addZone,
  saveTemplate,
  printZones,
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
        />
      </div>

      <button
        onClick={addZone}
        style={{
          padding: "8px 15px",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: saving ? "not-allowed" : "pointer"
        }}
        disabled={saving}
      >
        + Добавить зону
      </button>

      <button
        onClick={saveTemplate}
        style={{
          padding: "8px 15px",
          background: saving ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: saving ? "not-allowed" : "pointer"
        }}
        disabled={saving}
      >
        {saving ? "Сохранение..." : "Сохранить шаблон"}
      </button>

      <button
        onClick={printZones}
        style={{
          padding: "8px 15px",
          background: "#17a2b8",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Вывести зоны
      </button>
    </div>
  );
};