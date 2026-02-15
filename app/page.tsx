"use client";

import { useState, useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zones, setZones] = useState([
    { name: "obj1", x: 100, y: 150, w: 200, h: 350 },
    { name: "obj2", x: 350, y: 140, w: 120, h: 380 },
    { name: "obj3", x: 420, y: 350, w: 350, h: 250 },
    { name: "obj4", x: 750, y: 330, w: 250, h: 200 },
    { name: "door", x: 1050, y: 150, w: 250, h: 400 }
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("/room.png");
  const [templateName, setTemplateName] = useState<string>("");

  // =========================
  // Загрузка файла
  // =========================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // =========================
  // Сохранение шаблона
  // =========================
  const saveTemplate = async () => {
    if (!selectedFile) {
      alert("Выберите изображение");
      return;
    }

    if (!templateName.trim()) {
      alert("Введите название шаблона");
      return;
    }

    const formData = new FormData();
    formData.append("Name", templateName);
    formData.append("SceneData", JSON.stringify(zones));
    formData.append("PreviewImage", selectedFile);

    try {
      const res = await fetch("https://localhost:7240/api/quests/PostTemplate", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const data = await res.json();
      console.log("Успешно:", data);
      alert("Шаблон успешно сохранён!");
    } catch (err) {
      console.error("Ошибка:", err);
      alert("Ошибка при сохранении шаблона");
    }
  };

  // =========================
  // Drag & Resize
  // =========================
  const [dragging, setDragging] = useState<number | null>(null);
  const [resizing, setResizing] = useState<number | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ w: 0, h: 0 });
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });

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
    const newZone = {
      name: `obj${newIndex}`,
      x: 100,
      y: 100,
      w: 150,
      h: 150
    };
    setZones([...zones, newZone]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        
        <input
          type="text"
          placeholder="Название шаблона"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />

        <button className="b1" onClick={addNewZone}>
          Добавить объект
        </button>

        <button
          className="b1"
          onClick={saveTemplate}
          style={{ marginLeft: 10 }}
        >
          Сохранить шаблон
        </button>

        <div
          style={{
            marginTop: "15px",
            border: "1px solid #ddd",
            padding: "10px",
            display: "inline-block"
          }}
        >
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          border: "1px solid #000"
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          src={previewUrl}
          alt=""
          draggable={false}
          style={{ display: "block" }}
        />

        {zones.map((zone, index) => (
          <div
            key={index}
            onMouseDown={(e) => handleMouseDown(index, e)}
            style={{
              position: "absolute",
              left: zone.x,
              top: zone.y,
              width: zone.w,
              height: zone.h,
              border: "2px solid red",
              backgroundColor: "rgba(255,0,0,0.15)",
              cursor: dragging === index ? "grabbing" : "grab",
              boxSizing: "border-box",
              userSelect: "none"
            }}
          >
            <div
              onMouseDown={(e) => handleResizeMouseDown(index, e)}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 15,
                height: 15,
                background: "red",
                cursor: "nwse-resize"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}