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
}

export function EditorCanvas({ previewUrl, zones, drag }: EditorCanvasProps) {
  return (
    <div
      className="editor-canvas"
      onMouseMove={drag.onMove}
      onMouseUp={drag.stop}
    >
      <img src={previewUrl} draggable={false} style={{ width: "100%" }} />

      {zones.map((zone, index) => (
        <Zone
          key={index}
          zone={zone}
          index={index}
          startDrag={drag.startDrag}
          startResize={drag.startResize}
        />
      ))}
    </div>
  );
}
