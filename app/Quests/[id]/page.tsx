"use client";

import { useEffect, useState } from "react";
import { Quest } from "@/Entities/Quest";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Badge from "@/components/Badge";

export default function QuestPage({ params }: { params: { id: string } }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [allowPartial, setAllowPartial] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";
  const router = useRouter();

  const generateAccessCode = () => {
    const part = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${part()}-${part()}`;
  };

  const startSession = async () => {
    if (!quest) return;
    const token = localStorage.getItem("auth_token");
    if (!token) { alert("Не найден токен авторизации"); return; }

    const meRes = await fetch(`${API_BASE}/api/Auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) { alert("Не удалось получить данные пользователя"); return; }

    const me = await meRes.json() as { userId: string };
    const finalAccessCode = accessCode.trim() || generateAccessCode();

    const body = {
      questId: quest.id,
      startedBy: me.userId,
      timeLimit,
      allowPartialCompletion: allowPartial,
      allowToSkip: allowSkip,
      accessCode: finalAccessCode,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isActive: false,
    };

    const res = await fetch(`${API_BASE}/api/QuestSessions/CreateSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) { alert("Ошибка создания сессии"); return; }
    const session = await res.json();
    localStorage.setItem("activeSession", JSON.stringify(session));

    const role = getStoredRole();
    router.push(role === "Teacher" || role === "Admin"
      ? `/Sessions/Dashboard/${session.id}`
      : `/Session/${session.id}`
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedQuest");
    if (saved) setQuest(JSON.parse(saved));
  }, []);

  if (!quest) return <div className="page-container">Загрузка...</div>;

  const sortedRooms = [...quest.questRooms].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const currentRoom = sortedRooms[currentRoomIndex];

  return (
    <div className="page-container" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{quest.title}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            <Badge variant={quest.visibility === "Private" ? "private" : "default"}>
              {quest.visibility === "Private" ? "Private" : "Public"}
            </Badge>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{quest.subject}</span>
            <span style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{quest.difficulty}</span>
          </div>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>Настройки теста</h2>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Room sidebar */}
        <div style={{
          width: 140,
          height: 500,
          overflowY: "auto",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: 12,
          background: "var(--color-surface)",
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, textAlign: "center", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
            Комнаты
          </h3>
          {sortedRooms.map((room, index) => (
            <div
              key={room.id}
              onClick={() => setCurrentRoomIndex(index)}
              style={{
                marginBottom: 8,
                cursor: "pointer",
                border: index === currentRoomIndex ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: 4,
                background: index === currentRoomIndex ? "var(--color-hover)" : "var(--color-surface)",
                transition: "all var(--transition-fast)",
              }}
            >
              <img
                src={`${API_BASE}${room.roomTemplate.previewImageUrl}`}
                alt={room.title || room.roomTemplate.name}
                style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
              />
            </div>
          ))}
        </div>

        {/* Room preview */}
        <div style={{ flex: 2, minWidth: 300 }}>
          {sortedRooms.map((room) => (
            <div key={room.id} style={{
              border: "1px solid var(--color-border)",
              padding: 20,
              borderRadius: "var(--radius-lg)",
              marginBottom: 20,
              background: "var(--color-surface)",
            }}>
              <h3 style={{ marginBottom: 12, color: "var(--color-text-primary)" }}>{room.title}</h3>
              <img
                src={`${API_BASE}${room.roomTemplate.previewImageUrl}`}
                alt=""
                style={{ width: "100%", maxWidth: 600, borderRadius: "var(--radius-md)" }}
              />
            </div>
          ))}
        </div>

        {/* Settings panel */}
        <div style={{
          flex: 1,
          minWidth: 280,
          border: "1px solid var(--color-border)",
          padding: 20,
          borderRadius: "var(--radius-lg)",
          height: "fit-content",
          background: "var(--color-surface)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>Лимит времени (мин)</label>
            <input
              type="number"
              value={timeLimit ?? ""}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              style={{ width: "100%", padding: "8px 12px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", outline: "none" }}
            />
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--color-text-primary)", cursor: "pointer" }}>
            <input type="checkbox" checked={allowPartial} onChange={(e) => setAllowPartial(e.target.checked)} />
            Разрешить частичное прохождение
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14, color: "var(--color-text-primary)", cursor: "pointer" }}>
            <input type="checkbox" checked={allowSkip} onChange={(e) => setAllowSkip(e.target.checked)} />
            Разрешить пропуск вопросов
          </label>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>Код доступа</label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Оставьте пустым для генерации"
              style={{ width: "100%", padding: "8px 12px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>Начало</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>Окончание</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "2px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", outline: "none" }}
            />
          </div>

          <Button variant="primary" size="lg" onClick={startSession} style={{ marginTop: 8 }}>
            Запустить тест
          </Button>
        </div>
      </div>
    </div>
  );
}
