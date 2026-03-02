"use client";

import { useEffect, useState } from "react";
import { Quest } from "@/Entities/Quest";
import { useRouter } from "next/navigation";

export default function QuestPage({ params }: { params: { id: string } }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [allowPartial, setAllowPartial] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const generateAccessCode = () => {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${part()}-${part()}`;
  };


  const startSession = async () => {
  if (!quest) return;

  const token = localStorage.getItem("auth_token");
  if (!token) {
    alert("Не найден токен авторизации");
    return;
  }

  // получаем текущего пользователя
  const meRes = await fetch("https://localhost:7240/api/Auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!meRes.ok) {
    alert("Не удалось получить данные пользователя");
    return;
  }

  const me = await meRes.json() as { userId: string };

  const finalAccessCode =
    accessCode.trim() === "" ? generateAccessCode() : accessCode.trim();

  const body = {
    questId: quest.id,
    startedBy: me.userId,
    timeLimit: timeLimit,
    allowPartialCompletion: allowPartial,
    allowToSkip: allowSkip,
    accessCode: finalAccessCode,
    startsAt: startsAt,
    endsAt: endsAt || null,
    isActive: false
  };

  const res = await fetch(
    "https://localhost:7240/api/QuestSessions/CreateSession",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) {
    alert("Ошибка создания сессии");
    return;
  }

  const session = await res.json();

  localStorage.setItem("activeSession", JSON.stringify(session));
  router.push(`/Session/${session.id}`);
};


  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("selectedQuest");
    if (saved) setQuest(JSON.parse(saved));
  }, []);

  if (!quest) return <div>Загрузка...</div>;

  // Сортируем комнаты по orderIndex
  const sortedRooms = [...quest.questRooms].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const currentRoom = sortedRooms[currentRoomIndex];

  return (
    <div style={{ padding: 30 }}>
      {/* ВЕРХНИЙ БЛОК — заголовки */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20
        }}
      >
        <h2 style={{ margin: 0 }}>{quest.title}</h2>
        <h2 style={{ margin: 0 }}>Настройки теста</h2>
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {/* СЛАЙДЕР КОМНАТ - только то, что нужно */}
        <div style={{
          width: "150px",
          height: "600px",
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 10
        }}>
          <h3 style={{ marginBottom: 15, textAlign: "center", fontSize: 14 }}>Комнаты</h3>
          
          {sortedRooms.map((room, index) => (
            <div
              key={room.id}
              onClick={() => setCurrentRoomIndex(index)}
              style={{
                marginBottom: 10,
                cursor: "pointer",
                border: index === currentRoomIndex ? "3px solid #1e1e1e" : "1px solid #ddd",
                borderRadius: 8,
                padding: 5,
                background: index === currentRoomIndex ? "#f0f0f0" : "white"
              }}
            >
              <img
                src={`https://localhost:7240${room.roomTemplate.previewImageUrl}`}
                alt={room.title || room.roomTemplate.name}
                style={{
                  width: "100%",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: 4
                }}
              />
            </div>
          ))}
        </div>

        {/* Центральная часть с комнатами (без изменений) */}
        <div style={{ flex: 2 }}>
          {sortedRooms.map((room) => (
            <div
              key={room.id}
              style={{
                border: "1px solid #ddd",
                padding: 20,
                borderRadius: 10,
                marginBottom: 20
              }}
            >
              <h3>{room.title}</h3>

              <img
                src={`https://localhost:7240${room.roomTemplate.previewImageUrl}`}
                style={{ width: "100%", maxWidth: 600, borderRadius: 8 }}
              />
            </div>
          ))}
        </div>

        {/* Правая панель с настройками (без изменений) */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            padding: 20,
            borderRadius: 10,
            height: "fit-content"
          }}
        >
          <label>Лимит времени (минуты)</label>
          <input
            type="number"
            value={timeLimit ?? ""}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            style={{ width: "100%", marginBottom: 15 }}
          />

          <label>
            <input
              type="checkbox"
              checked={allowPartial}
              onChange={(e) => setAllowPartial(e.target.checked)}
            />
            Разрешить частичное прохождение
          </label>

          <br />

          <label>
            <input
              type="checkbox"
              checked={allowSkip}
              onChange={(e) => setAllowSkip(e.target.checked)}
            />
            Разрешить пропуск вопросов
          </label>

          <br /><br />

          <label>Код доступа</label>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Оставьте пустым для случайной генерации"
            style={{ width: "100%", marginBottom: 15 }}
          />


          <label>Начало</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            style={{ width: "100%", marginBottom: 15 }}
          />

          <label>Окончание</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            style={{ width: "100%", marginBottom: 15 }}
          />

          <button
            style={{
              width: "100%",
              padding: 10,
              background: "#1e1e1e",
              color: "white",
              borderRadius: 8,
              border: "none",
              marginTop: 20
            }}            
            onClick={startSession}
          >
            Запустить тест
          </button>
        </div>
      </div>
    </div>
  );
}