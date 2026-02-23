interface EditorPanelProps {
  templateName: string;
  setTemplateName: (value: string) => void;
  addZone: () => void;
  saveTemplate: () => void;
  printZones: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditorPanel({
  templateName,
  setTemplateName,
  addZone,
  saveTemplate,
  printZones,
  handleFileChange
}: EditorPanelProps) {
  return (
    <div className="editor-panel">
      <input
        type="text"
        placeholder="Название шаблона"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        className="editor-input"
      />

      <button className="editor-btn" onClick={addZone}>
        Добавить объект
      </button>

      <button className="editor-btn" onClick={saveTemplate}>
        Сохранить шаблон
      </button>

      <button className="editor-btn" onClick={printZones}>
        Показать зоны
      </button>

      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
