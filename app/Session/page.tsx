"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";

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
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      position: "relative",
    }}>
      <PageSun
        style={{ position: "fixed", top: "5%", right: "8%", width: 90, height: 90, opacity: 0.45, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "12%", left: "5%", width: 110, height: 55, opacity: 0.35, zIndex: 0 }}
        className="animate-drift"
      />
      <PageCloud
        style={{ position: "fixed", bottom: "15%", right: "8%", width: 90, height: 45, opacity: 0.25, zIndex: 0 }}
        className="animate-float"
      />
      <PageStars
        style={{ position: "fixed", bottom: "25%", left: "10%", width: 150, height: 25, opacity: 0.2, zIndex: 0 }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "2px solid rgba(255,107,53,0.12)",
          borderRadius: 24,
          padding: 36,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 16px 48px rgba(255,107,53,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Вход в тест
          </h1>
          <p style={{ margin: "8px 0 0", color: "var(--color-text-secondary)", fontSize: 15 }}>
            Введите код доступа, чтобы начать тест
          </p>
        </div>

        <div>
          <label htmlFor="access-code" style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>
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
              padding: "12px 16px",
              border: "2px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 18,
              background: "var(--color-surface)",
              color: "var(--color-text-primary)",
              outline: "none",
              letterSpacing: "2px",
              textTransform: "uppercase",
              textAlign: "center",
              fontWeight: 700,
              transition: "border-color 0.3s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
            onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
          />
        </div>

        {error && (
          <p style={{ margin: 0, color: "var(--color-error)", fontSize: 14, textAlign: "center" }}>
            ❌ {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} style={{ borderRadius: 9999 }}>
          {isSubmitting ? "Проверяем..." : "🔓 Открыть тест"}
        </Button>
      </form>
    </div>
  );
}
