import { useState, useRef, useEffect } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

interface ZoneProps {
  zone: QuestionPosition;
  index: number;
  startDrag: (index: number, e: React.MouseEvent) => void;
  startResize: (index: number, e: React.MouseEvent) => void;
  onRemove?: (index: number) => void;
  canRemove?: boolean;
  onRename?: (index: number, name: string) => void;
  zoneStyle?: { left: number; top: number; width: number; height: number };
}

export function Zone({
  zone,
  index,
  startDrag,
  startResize,
  onRemove,
  canRemove = false,
  onRename,
  zoneStyle
}: ZoneProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(zone.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const lower = zone.name.trim().toLowerCase();
    if (lower === "дверь" || lower === "door") return;
    setEditValue(zone.name);
    setEditing(true);
  };

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== zone.name && onRename) {
      onRename(index, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commitRename();
    } else if (e.key === "Escape") {
      setEditValue(zone.name);
      setEditing(false);
    }
  };

  return (
    <div
      className="editor-zone"
      onMouseDown={(e) => startDrag(index, e)}
      style={zoneStyle}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
          className="zone-rename-input"
        />
      ) : (
        <span onDoubleClick={handleDoubleClick} onMouseDown={(e) => e.stopPropagation()}>{zone.name}</span>
      )}

      {canRemove && onRemove && (
        <button
          type="button"
          className="editor-zone-remove"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          aria-label={`Удалить зону ${zone.name}`}
        >
          ×
        </button>
      )}

      <div
        className="editor-resize"
        onMouseDown={(e) => startResize(index, e)}
      />
    </div>
  );
}
