"use client";

import { use, useEffect, useState } from "react";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ← обязательная распаковка

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("activeSession");
    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (parsed.id === id) {
      setSession(parsed);
    }
  }, [id]);

  if (!session) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Сессия теста</h1>

      <div
        style={{
          border: "1px solid #ddd",
          padding: 20,
          borderRadius: 10,
          maxWidth: 500,
          marginTop: 20
        }}
      >
        <p><b>ID сессии:</b> {session.id}</p>
        <p><b>ID квеста:</b> {session.questId}</p>
        <p><b>Код доступа:</b> {session.accessCode}</p>
        <p><b>Лимит времени:</b> {session.timeLimit ?? "Без лимита"}</p>
        <p><b>Частичное прохождение:</b> {session.allowPartialCompletion ? "Да" : "Нет"}</p>
        <p><b>Можно пропускать вопросы:</b> {session.allowToSkip ? "Да" : "Нет"}</p>
        <p><b>Начало:</b> {session.startsAt}</p>
        <p><b>Окончание:</b> {session.endsAt ?? "Не задано"}</p>
        <p><b>Активна:</b> {session.isActive ? "Да" : "Нет"}</p>
      </div>
    </div>
  );
}
