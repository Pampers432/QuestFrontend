import { Zone } from "./Zone";
import { QuestionPosition } from "@/Entities/QuestionPosition";
import { useState, useRef, useEffect } from "react";

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
  onRenameZone?: (index: number, name: string) => void;
  imageSize?: { width: number; height: number };
  imageNaturalSize?: { width: number; height: number };
  onImageLoad?: (naturalWidth: number, naturalHeight: number) => void;
}

export function EditorCanvas({
  previewUrl,
  zones,
  drag,
  onRemoveZone,
  canRemoveZone,
  onRenameZone,
  imageSize: externalImageSize,
  imageNaturalSize: externalImageNaturalSize,
  onImageLoad
}: EditorCanvasProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalImageSize, setInternalImageSize] = useState({ width: 0, height: 0 });
  const [internalImageNaturalSize, setInternalImageNaturalSize] = useState({ width: 0, height: 0 });

  const imageSize = externalImageSize || internalImageSize;
  const imageNaturalSize = externalImageNaturalSize || internalImageNaturalSize;

  const handleImageLoad = () => {
    if (imageRef.current) {
      if (!externalImageNaturalSize) {
        setInternalImageNaturalSize({
          width: imageRef.current.naturalWidth,
          height: imageRef.current.naturalHeight
        });
      }
      if (onImageLoad) {
        onImageLoad(imageRef.current.naturalWidth, imageRef.current.naturalHeight);
      }
    }
  };

  useEffect(() => {
    if (!imageRef.current || !containerRef.current || externalImageSize) return;

    const resizeObserver = new ResizeObserver(() => {
      if (imageRef.current) {
        setInternalImageSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [previewUrl, externalImageSize]);

  const getZoneStyle = (zone: QuestionPosition) => {
    if (imageSize.width === 0 || imageNaturalSize.width === 0) {
      return {
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h
      };
    }

    const scaleX = imageSize.width / imageNaturalSize.width;
    const scaleY = imageSize.height / imageNaturalSize.height;

    return {
      left: zone.x * scaleX,
      top: zone.y * scaleY,
      width: zone.w * scaleX,
      height: zone.h * scaleY
    };
  };

  return (
    <div
      ref={containerRef}
      className="editor-canvas"
      onMouseMove={drag.onMove}
      onMouseUp={drag.stop}
    >
      <img
        ref={imageRef}
        src={previewUrl}
        alt="Предпросмотр шаблона"
        draggable={false}
        style={{ width: "100%", height: "100vh", objectFit: "cover", objectPosition: "center" }}
        onLoad={handleImageLoad}
      />

      {zones.map((zone, index) => (
        <Zone
          key={index}
          zone={zone}
          index={index}
          startDrag={drag.startDrag}
          startResize={drag.startResize}
          onRemove={onRemoveZone}
          canRemove={canRemoveZone ? canRemoveZone(zone, index) : false}
          onRename={onRenameZone}
          zoneStyle={getZoneStyle(zone)}
        />
      ))}
    </div>
  );
}
