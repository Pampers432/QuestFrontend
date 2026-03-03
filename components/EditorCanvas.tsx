import { Zone } from "./Zone";

import { QuestionPosition } from "@/Entities/QuestionPosition";

interface EditorCanvasProps {
  previewUrl: string;
  zones: QuestionPosition[];
  drag: {
    startDrag: (index: number, e: React.MouseEvent) => void;
    startResize: (index: number, e: React.MouseEvent) => void;
    onMove: (e: React.MouseEvent) => void;
    stop: () => void;
  };
  onRemoveZone?: (index: number) => void;
  canRemoveZone?: (zone: QuestionPosition, index: number) => boolean;
}

export function EditorCanvas({
  previewUrl,
  zones,
  drag,
  onRemoveZone,
  canRemoveZone
}: EditorCanvasProps) {
  return (
    <div
      className="editor-canvas"
      onMouseMove={drag.onMove}
      onMouseUp={drag.stop}
    >
      <img src={previewUrl} alt="Предпросмотр шаблона" draggable={false} style={{ width: "100%" }} />

      {zones.map((zone, index) => (
        <Zone
          key={index}
          zone={zone}
          index={index}
          startDrag={drag.startDrag}
          startResize={drag.startResize}
          onRemove={onRemoveZone}
          canRemove={canRemoveZone ? canRemoveZone(zone, index) : false}
        />
      ))}
    </div>
  );
}
