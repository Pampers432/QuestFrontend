"use client";

import { useState, useRef } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zones, setZones] = useState<QuestionPosition[]>([
    { name: "obj1", x: 100, y: 150, w: 200, h: 350 },
    { name: "obj2", x: 350, y: 140, w: 120, h: 380 },
    { name: "obj3", x: 420, y: 350, w: 350, h: 250 },
    { name: "obj4", x: 750, y: 330, w: 250, h: 200 },
    { name: "door", x: 1050, y: 150, w: 250, h: 400 }
  ]);

  const [templateName, setTemplateName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("/room.png");

  const [dragging, setDragging] = useState<number | null>(null);
  const [resizing, setResizing] = useState<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: 0, h: 0 });
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const saveTemplate = async () => {
    if (!selectedFile) return alert("Выберите изображение");
    if (!templateName.trim()) return alert("Введите название шаблона");

    const formData = new FormData();
    formData.append("Name", templateName);
    formData.append("SceneData", JSON.stringify(zones));
    formData.append("PreviewImage", selectedFile);

    try {
      const res = await fetch("https://localhost:7240/api/quests/PostTemplate", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      alert("Шаблон успешно сохранён!");
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении шаблона");
    }
  };

  const printZones = () => {
    console.clear();
    console.log("=== Текущие зоны ===");
    console.log(JSON.stringify(zones, null, 2));
  };

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    setDragging(index);
    const zone = zones[index];
    setOffset({ x: e.clientX - zone.x, y: e.clientY - zone.y });
  };

  const handleResizeMouseDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing(index);

    const zone = zones[index];
    setStartSize({ w: zone.w, h: zone.h });
    setStartMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging !== null) {
      const newZones = [...zones];
      newZones[dragging].x = e.clientX - offset.x;
      newZones[dragging].y = e.clientY - offset.y;
      setZones(newZones);
    }

    if (resizing !== null) {
      const newZones = [...zones];
      const zone = newZones[resizing];

      const dx = e.clientX - startMouse.x;
      const dy = e.clientY - startMouse.y;

      zone.w = Math.max(20, startSize.w + dx);
      zone.h = Math.max(20, startSize.h + dy);

      setZones(newZones);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const addNewZone = () => {
    const newIndex = zones.length + 1;
    setZones([
      ...zones,
      { name: `obj${newIndex}`, x: 100, y: 100, w: 150, h: 150 }
    ]);
  };

  return (
    <div>
      <div className="editor-panel">
        <input
          type="text"
          placeholder="Название шаблона"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="editor-input"
        />

        <button className="editor-btn" onClick={addNewZone}>
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

      <div
        ref={containerRef}
        className="editor-canvas"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img src={previewUrl} draggable={false} style={{ width: "100%" }} />

        {zones.map((zone, index) => (
          <div
            key={index}
            className="editor-zone"
            onMouseDown={(e) => handleMouseDown(index, e)}
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
              onMouseDown={(e) => handleResizeMouseDown(index, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
