import { QuestionPosition } from "@/Entities/QuestionPosition";

interface ZoneProps {
  zone: QuestionPosition;
  index: number;
  startDrag: (index: number, e: React.MouseEvent) => void;
  startResize: (index: number, e: React.MouseEvent) => void;
}


export function Zone({ zone, index, startDrag, startResize }: ZoneProps) {
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
      {zone.name}

      <div
        className="editor-resize"
        onMouseDown={(e) => startResize(index, e)}
      />
    </div>
  );
}
