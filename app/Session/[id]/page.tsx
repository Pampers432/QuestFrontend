"use client";

import { use, useEffect, useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [room, setRoom] = useState<any>(null);
  const [zones, setZones] = useState<QuestionPosition[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");

  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [doorMessage, setDoorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedQuest = localStorage.getItem("selectedQuest");
    const savedSession = localStorage.getItem("activeSession");

    if (!savedQuest || !savedSession) return;

    const quest = JSON.parse(savedQuest);
    const session = JSON.parse(savedSession);

    setActiveSession(session);

    const firstRoom = quest.questRooms[0];
    setRoom(firstRoom);

    setPreviewUrl(`https://localhost:7240${firstRoom.roomTemplate.previewImageUrl}`);

    const parsedZones: QuestionPosition[] = JSON.parse(firstRoom.roomTemplate.sceneData);
    setZones(parsedZones);
  }, [id]);

  if (!room || !activeSession) return <div>Загрузка...</div>;

  // ============================
  // 🔥 ЛОГИКА ДВЕРИ
  // ============================
  const handleDoorClick = () => {
    const now = new Date();
    const startsAt = new Date(activeSession.startsAt);
    const endsAt = new Date(activeSession.endsAt);

    // 1. Проверка активности
    if (!activeSession.isActive) {
      setDoorMessage("Сессия не активна");
      return;
    }

    // 2. Проверка времени начала
    if (now < startsAt) {
      setDoorMessage("Сессия ещё не началась");
      return;
    }

    // 3. Проверка времени окончания
    if (now > endsAt) {
      setDoorMessage("Время сессии истекло");
      return;
    }

    // 4. Проверка лимита времени
    if (activeSession.timeLimit && activeSession.timeLimit > 0) {
      const minutesPassed = Math.floor((now.getTime() - startsAt.getTime()) / 60000);
      if (minutesPassed > activeSession.timeLimit) {
        setDoorMessage("Вы превысили лимит времени");
        return;
      }
    }

    // 5. Проверка попыток (если нужно)
    if (activeSession.attempts && activeSession.attempts.length > 0) {
      // Здесь можно добавить логику, если нужно
    }

    // 6. Если всё ок — переход
    setDoorMessage("Переход в следующую комнату...");
    // Здесь позже добавим реальный переход
  };

  // ============================
  // 🔥 КЛИК ПО ЗОНЕ (по индексу)
  // ============================
  const handleZoneClick = (zoneIndex: number) => {
    const zone = zones[zoneIndex];

    if (zone.name.toLowerCase() === "door") {
      handleDoorClick();
      return;
    }

    const question = room.questions[zoneIndex];

    if (question) {
      setActiveQuestion(question);
    } else {
      setActiveQuestion({
        text: "Для этой зоны нет вопроса",
        answerOptions: []
      });
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <div className="room-preview-wrapper" style={{ width: "100%", height: "100%" }}>
        
        <img
          src={previewUrl}
          className="room-preview"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />

        {zones.map((z, i) => (
          <div
            key={i}
            className="zone-box"
            onClick={() => handleZoneClick(i)}
            style={{
              left: z.x,
              top: z.y,
              width: z.w,
              height: z.h,
              cursor: z.name.toLowerCase() === "door" ? "pointer" : "pointer",
              borderColor: z.name.toLowerCase() === "door" ? "red" : "#00a000",
              backgroundColor:
                z.name.toLowerCase() === "door"
                  ? "rgba(255,0,0,0.15)"
                  : "rgba(0,255,0,0.15)",
              pointerEvents: "auto"
            }}
          >
            {z.name}
          </div>
        ))}
      </div>

      {/* Модалка вопроса */}
      {activeQuestion && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setActiveQuestion(null)}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              minWidth: 350
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 10 }}>{activeQuestion.text}</h2>

            {activeQuestion.answerOptions?.map((a: any, idx: number) => (
              <button
                key={idx}
                className="btn"
                style={{ width: "100%", marginBottom: 10 }}
              >
                {a.text}
              </button>
            ))}

            <button
              className="btn"
              style={{ background: "#777", width: "100%" }}
              onClick={() => setActiveQuestion(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модалка двери */}
      {doorMessage && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setDoorMessage(null)}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              minWidth: 350
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{doorMessage}</h2>

            <button
              className="btn"
              style={{ width: "100%", marginTop: 15 }}
              onClick={() => setDoorMessage(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
