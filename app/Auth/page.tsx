"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/services/authService";
import { readRoleFromToken, setStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const title = useMemo(
    () => (mode === "login" ? "Авторизация" : "Регистрация"),
    [mode]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Введите username и password");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const response = await loginUser({
          username: username.trim(),
          password,
        });

        if (response.token) {
          localStorage.setItem("auth_token", response.token);
        }

        const resolvedRole = response.role || readRoleFromToken(response.token);
        if (resolvedRole) {
          setStoredRole(resolvedRole);
        }

        setSuccess(response.message || "Вход выполнен успешно");
        const isStudent = resolvedRole === "Student" || resolvedRole?.toLowerCase() === "student";
        router.push(isStudent ? "/Session" : "/Quests");
      } else {
        const response = await registerUser({
          username: username.trim(),
          password,
          role,
        });

        setSuccess(response.message || "Пользователь зарегистрирован");
        setStoredRole(role);
        router.push(role === "student" || role === "Student" ? "/Session" : "/Quests");
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Неизвестная ошибка";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8, color: "var(--color-text-primary)" }}>
          {title}
        </h1>

        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid var(--color-border)" }}>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              background: "transparent",
              fontSize: 15,
              fontWeight: mode === "login" ? 600 : 400,
              color: mode === "login" ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              borderBottom: mode === "login" ? "2px solid var(--color-primary)" : "2px solid transparent",
              marginBottom: -2,
              transition: "all var(--transition-fast)",
            }}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            style={{
              flex: 1,
              padding: "12px 0",
              border: "none",
              background: "transparent",
              fontSize: 15,
              fontWeight: mode === "register" ? 600 : 400,
              color: mode === "register" ? "var(--color-primary)" : "var(--color-text-secondary)",
              cursor: "pointer",
              borderBottom: mode === "register" ? "2px solid var(--color-primary)" : "2px solid transparent",
              marginBottom: -2,
              transition: "all var(--transition-fast)",
            }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={error && !username.trim() ? "Обязательное поле" : undefined}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && !password.trim() ? "Обязательное поле" : undefined}
          />

          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>
                Роль
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 15,
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {error && (
            <p style={{ color: "var(--color-error)", fontSize: 14, margin: "8px 0" }}>{error}</p>
          )}
          {success && (
            <p style={{ color: "var(--color-success)", fontSize: 14, margin: "8px 0" }}>{success}</p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} style={{ marginTop: 8 }}>
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>
        </form>
      </div>
    </div>
  );
}
