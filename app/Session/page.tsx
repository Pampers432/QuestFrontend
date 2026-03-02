"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://localhost:7240/api/QuestSessions";

type SessionPayload = {
  id?: string;
  quest?: unknown;
  questSnapshot?: unknown;
  questSession?: { quest?: unknown } | null;
};

const resolveQuest = (session: SessionPayload) => {
  if (session.quest) return session.quest;
  if (session.questSnapshot) return session.questSnapshot;
  if (session.questSession?.quest) return session.questSession.quest;
  return null;
};

export default function SessionAccessPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getSessionByCode = async (code: string) => {
    const requests = [
      `${API}/ByAccessCode/${encodeURIComponent(code)}`,
      `${API}/GetByAccessCode/${encodeURIComponent(code)}`,
      `${API}?accessCode=${encodeURIComponent(code)}`
    ];

    for (const url of requests) {
      const res = await fetch(url);
      if (!res.ok) continue;

      const session = (await res.json()) as SessionPayload;
      if (session?.id) return session;
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const trimmedCode = accessCode.trim();
    if (!trimmedCode) {
      setError("Введите AccessCode");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await getSessionByCode(trimmedCode);

      if (!session) {
        setError("Сессия с таким AccessCode не найдена");
        return;
      }

      const quest = resolveQuest(session);
      if (!quest) {
        setError("Не удалось получить данные теста для сессии");
        return;
      }

      localStorage.setItem("activeSession", JSON.stringify(session));
      localStorage.setItem("selectedQuest", JSON.stringify(quest));

      router.push(`/Session/${session.id}`);
    } catch {
      setError("Не удалось подключиться к сессии");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>Вход в тест</h1>
        <p style={{ margin: 0, color: "#555" }}>Введите AccessCode сессии, чтобы начать тест.</p>

        <label htmlFor="access-code" style={{ fontWeight: 600 }}>
          AccessCode
        </label>
        <input
          id="access-code"
          type="text"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="Например: TEST-2026"
          style={{
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "16px"
          }}
        />

        {error && <p style={{ margin: 0, color: "#d11a2a" }}>{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            marginTop: "8px",
            width: "100%",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontWeight: 600,
            color: "white",
            background: "#171717",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.75 : 1
          }}
        >
          {isSubmitting ? "Проверяем..." : "Открыть тест"}
        </button>
      </form>
    </main>
  );
}
