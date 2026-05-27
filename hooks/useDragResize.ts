import { useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export function useDragResize(
  zones: QuestionPosition[],
  updateZone: Function,
  imageSize?: { width: number; height: number },
  imageNaturalSize?: { width: number; height: number }
) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [resizing, setResizing] = useState<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: 0, h: 0 });
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });

  const getScale = () => {
    if (!imageSize || !imageNaturalSize || imageNaturalSize.width === 0 || imageSize.width === 0) {
      return { scaleX: 1, scaleY: 1 };
    }
    return {
      scaleX: imageSize.width / imageNaturalSize.width,
      scaleY: imageSize.height / imageNaturalSize.height
    };
  };

  const startDrag = (index: number, e: React.MouseEvent) => {
    setDragging(index);
    const z = zones[index];
    const { scaleX, scaleY } = getScale();
    setOffset({ x: e.clientX - z.x * scaleX, y: e.clientY - z.y * scaleY });
  };

  const startResize = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(index);

    const z = zones[index];
    const { scaleX, scaleY } = getScale();
    setStartSize({ w: z.w, h: z.h });
    setStartMouse({ x: e.clientX, y: e.clientY });
  };

  const onMove = (e: React.MouseEvent) => {
    const { scaleX, scaleY } = getScale();

    if (dragging !== null) {
      updateZone(dragging, {
        x: Math.round((e.clientX - offset.x) / scaleX),
        y: Math.round((e.clientY - offset.y) / scaleY)
      });
    }

    if (resizing !== null) {
      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;

      updateZone(resizing, {
        w: Math.max(20, startSize.w + dx / scaleX),
        h: Math.max(20, startSize.h + dy / scaleY)
      });
    }
  };

  const stop = () => {
    setDragging(null);
    setResizing(null);
  };

  return { startDrag, startResize, onMove, stop };
}
