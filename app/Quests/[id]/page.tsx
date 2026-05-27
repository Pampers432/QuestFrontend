"use client";

import { useEffect, useState, useCallback } from "react";
import { Quest } from "@/Entities/Quest";
import { useRouter } from "next/navigation";
import { getStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";
import DatePicker from "react-datepicker";
import { ru } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

export default function QuestPage({ params }: { params: { id: string } }) {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [allowPartial, setAllowPartial] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [endsAtAuto, setEndsAtAuto] = useState(true);
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

  const fmtLocal = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toDate = (iso: string) => iso ? new Date(iso) : null;
  const toIso = (d: Date | null) => d ? fmtLocal(d) : "";

  const autoCalcEnd = useCallback((start: string, limit: number | null) => {
    if (!start || !limit || limit <= 0) return "";
    const d = new Date(start);
    if (isNaN(d.getTime())) return "";
    d.setMinutes(d.getMinutes() + limit);
    return fmtLocal(d);
  }, []);

  useEffect(() => {
    if (!endsAtAuto) return;
    const calc = autoCalcEnd(startsAt, timeLimit);
    if (calc) setEndsAt(calc);
  }, [startsAt, timeLimit, endsAtAuto, autoCalcEnd]);

  if (!quest) return <div className="page-container">Загрузка...</div>;

  const sortedRooms = [...quest.questRooms].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const currentRoom = sortedRooms[currentRoomIndex];

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "5%", width: 65, height: 65, opacity: 0.3, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "10%", left: "3%", width: 85, height: 42, opacity: 0.25, zIndex: 0 }}
        className="animate-drift"
      />
      <PageStars
        style={{ position: "fixed", top: "15%", left: "60%", width: 120, height: 18, opacity: 0.15, zIndex: 0 }}
      />

      <div className="page-container" style={{ maxWidth: 1400, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 className="page-title" style={{ margin: 0, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              🎮 {quest.title}
            </h1>
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
              <Badge variant={quest.visibility === "Private" ? "private" : "default"}>
                {quest.visibility === "Private" ? "🔒 Приватный" : "🌍 Публичный"}
              </Badge>
              <span style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>📚 {quest.subject}</span>
              <span style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>
                {quest.difficulty === "Easy" && "🟢"}
                {quest.difficulty === "Medium" && "🟡"}
                {quest.difficulty === "Hard" && "🔴"} {quest.difficulty}
              </span>
            </div>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--color-orange)" }}>⚙️ Настройки теста</h2>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{
            width: 140,
            height: 500,
            overflowY: "auto",
            border: "2px solid rgba(255,107,53,0.1)",
            borderRadius: 20,
            padding: 12,
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textAlign: "center", color: "var(--color-orange)", textTransform: "uppercase" }}>
              🏠 Комнаты
            </h3>
            {sortedRooms.map((room, index) => (
              <div
                key={room.id}
                onClick={() => setCurrentRoomIndex(index)}
                style={{
                  marginBottom: 8,
                  cursor: "pointer",
                  border: index === currentRoomIndex ? "3px solid var(--color-orange)" : "2px solid transparent",
                  borderRadius: 12,
                  padding: 4,
                  background: index === currentRoomIndex ? "rgba(255,107,53,0.08)" : "transparent",
                  transition: "all var(--transition-fast)",
                }}
              >
                <img
                  src={`${API_BASE}${room.roomTemplate.previewImageUrl}`}
                  alt={room.title || room.roomTemplate.name}
                  style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 8 }}
                />
              </div>
            ))}
          </div>

          <div style={{ flex: 2, minWidth: 300 }}>
            {sortedRooms.map((room) => (
              <div key={room.id} style={{
                border: "2px solid rgba(255,107,53,0.08)",
                padding: 20,
                borderRadius: 20,
                marginBottom: 20,
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
              }}>
                <h3 style={{ marginBottom: 12, color: "var(--color-text-primary)" }}>{room.title}</h3>
                <img
                  src={`${API_BASE}${room.roomTemplate.previewImageUrl}`}
                  alt=""
                  style={{ width: "100%", maxWidth: 600, borderRadius: 12 }}
                />
              </div>
            ))}
          </div>

          <div style={{
            flex: 1,
            minWidth: 280,
            border: "2px solid rgba(255,107,53,0.1)",
            padding: 24,
            borderRadius: 20,
            height: "fit-content",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxShadow: "0 8px 32px rgba(255,107,53,0.08)",
          }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>⏱️ Лимит времени (мин)</label>
              <input
                type="number"
                value={timeLimit ?? ""}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: 12, fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", outline: "none" }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
              />
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--color-text-primary)", cursor: "pointer" }}>
              <input type="checkbox" checked={allowPartial} onChange={(e) => setAllowPartial(e.target.checked)} style={{ accentColor: "var(--color-orange)", width: 18, height: 18 }} />
              ✅ Разрешить частичное прохождение
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--color-text-primary)", cursor: "pointer" }}>
              <input type="checkbox" checked={allowSkip} onChange={(e) => setAllowSkip(e.target.checked)} style={{ accentColor: "var(--color-orange)", width: 18, height: 18 }} />
              ⏭️ Разрешить пропуск вопросов
            </label>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>🔑 Код доступа</label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Оставьте пустым для генерации"
                style={{ width: "100%", padding: "10px 14px", border: "2px solid var(--color-border)", borderRadius: 12, fontSize: 14, background: "var(--color-surface)", color: "var(--color-text-primary)", outline: "none" }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>📅 Начало</label>
              <DatePicker
                selected={toDate(startsAt)}
                onChange={(d: Date | null) => setStartsAt(toIso(d))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={5}
                dateFormat="dd.MM.yyyy HH:mm"
                locale={ru}
                isClearable
                placeholderText="Выберите дату и время"
                className="date-picker-input"
                todayButton="Сегодня"
                openToDate={new Date()}
              />
<div style={{ marginTop: 4, display: "flex", gap: 6 }}>
    <Button variant="ghost" size="sm" onClick={() => { const now = new Date(); setStartsAt(fmtLocal(now)); }}>
      ⏺ Сейчас
    </Button>
  </div>
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                📅 Окончание
                {!endsAtAuto && (
                  <span
                    onClick={() => {
                      setEndsAtAuto(true);
                      const calc = autoCalcEnd(startsAt, timeLimit);
                      if (calc) setEndsAt(calc);
                    }}
                    style={{ fontSize: 11, color: "var(--color-orange)", cursor: "pointer", fontWeight: 400 }}
                  >
                    ↻ Авто
                  </span>
                )}
              </label>
              <DatePicker
                selected={toDate(endsAt)}
                onChange={(d: Date | null) => { setEndsAt(toIso(d)); setEndsAtAuto(!d); }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={5}
                dateFormat="dd.MM.yyyy HH:mm"
                locale={ru}
                isClearable
                placeholderText="Выберите дату и время"
                className="date-picker-input"
                todayButton="Сегодня"
                openToDate={new Date()}
              />
            </div>

            <Button variant="primary" size="lg" onClick={startSession} style={{ marginTop: 8, borderRadius: 9999 }}>
              🚀 Запустить тест
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
