"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";

type SessionPayload = {
  id?: string;
  isActive?: boolean;
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
    try {
      const res = await fetch(`${API_BASE}/api/QuestSessions/GetByAccessCode/${encodeURIComponent(code)}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const trimmedCode = accessCode.trim();
    if (!trimmedCode) { setError("Введите код доступа"); return; }
    setIsSubmitting(true);

    try {
      const session = await getSessionByCode(trimmedCode);
      if (!session || !session.id) { setError("Сессия не найдена"); return; }
      if (session.isActive === false) { setError("Сессия неактивна"); return; }

      const quest = session.quest || resolveQuest(session);
      if (!quest) { setError("Не удалось получить данные теста"); return; }

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
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>Вход в тест</h1>
          <p style={{ margin: "8px 0 0", color: "var(--color-text-secondary)", fontSize: 15 }}>
            Введите код доступа, чтобы начать тест
          </p>
        </div>

        <div>
          <label htmlFor="access-code" style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>
            Код доступа
          </label>
          <input
            id="access-code"
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="XXXX-XXXX"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "2px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 16,
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              outline: "none",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          />
        </div>

        {error && <p style={{ margin: 0, color: "var(--color-error)", fontSize: 14 }}>{error}</p>}

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
          {isSubmitting ? "Проверяем..." : "Открыть тест"}
        </Button>
      </form>
    </div>
  );
}
