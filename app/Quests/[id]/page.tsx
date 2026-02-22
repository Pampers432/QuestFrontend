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

      {/* ОСНОВНОЙ КОНТЕЙНЕР */}
      <div style={{ display: "flex", gap: 40 }}>
        {/* ЛЕВАЯ ЧАСТЬ — комнаты */}
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

        {/* ПРАВАЯ ЧАСТЬ — форма */}
        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            padding: 20,
            borderRadius: 10,
            height: "fit-content"
          }}
        >
          {/* Заголовок убрали — он теперь сверху */}
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
          >
            Начать тест
          </button>
        </div>
      </div>
    </div>
  );
}
