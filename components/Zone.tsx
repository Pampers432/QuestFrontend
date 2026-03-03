import { QuestionPosition } from "@/Entities/QuestionPosition";

interface ZoneProps {
  zone: QuestionPosition;
  index: number;
  startDrag: (index: number, e: React.MouseEvent) => void;
  startResize: (index: number, e: React.MouseEvent) => void;
  onRemove?: (index: number) => void;
  canRemove?: boolean;
}

export function Zone({
  zone,
  index,
  startDrag,
  startResize,
  onRemove,
  canRemove = false
}: ZoneProps) {
  return (
    <div
      className="editor-zone"
      onMouseDown={(e) => startDrag(index, e)}
      style={{
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h
      }}
    >
      <span>{zone.name}</span>

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
