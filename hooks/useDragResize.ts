import { useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export function useDragResize(zones: QuestionPosition[], updateZone: Function) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [resizing, setResizing] = useState<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: 0, h: 0 });
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });

  const startDrag = (index: number, e: React.MouseEvent) => {
    setDragging(index);
    const z = zones[index];
    setOffset({ x: e.clientX - z.x, y: e.clientY - z.y });
  };

  const startResize = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(index);

    const z = zones[index];
    setStartSize({ w: z.w, h: z.h });
    setStartMouse({ x: e.clientX, y: e.clientY });
  };

  const onMove = (e: React.MouseEvent) => {
    if (dragging !== null) {
      updateZone(dragging, {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }

    if (resizing !== null) {
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;

      updateZone(resizing, {
        w: Math.max(20, startSize.w + dx),
        h: Math.max(20, startSize.h + dy)
      });
    }
  };

  const stop = () => {
    setDragging(null);
    setResizing(null);
  };

  return { startDrag, startResize, onMove, stop };
}
