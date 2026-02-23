"use client";

import { useEffect, useState } from "react";
import { Quest } from "@/Entities/Quest";
import { useRouter } from "next/navigation";

export default function QuestPage({ params }: { params: { id: string } }) {
  const [quest, setQuest] = useState<Quest | null>(null);

  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [allowPartial, setAllowPartial] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const startSession = async () => {
  if (!quest) return;

  const body = {
    questId: quest.id,
    startedBy: "0EF0EA1A-7E15-402B-894F-5D7224607447", // временно
    timeLimit: timeLimit,
    allowPartialCompletion: allowPartial,
    allowToSkip: allowSkip,
    accessCode: accessCode,
    startsAt: startsAt,
    endsAt: endsAt || null,
    isActive: false
  };

  const res = await fetch("https://localhost:7240/api/QuestSessions/CreateSession", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    alert("Ошибка создания сессии");
    return;
  }

  const session = await res.json();

  // сохраняем сессию
  localStorage.setItem("activeSession", JSON.stringify(session));

  // переход на форму прохождения
  router.push(`/Session/${session.id}`);
};


  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("selectedQuest");
    if (saved) setQuest(JSON.parse(saved));
  }, []);

  if (!quest) return <div>Загрузка...</div>;

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
        <div style={{ flex: 2 }}>
          {quest.questRooms.map((room) => (
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
