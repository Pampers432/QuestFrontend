"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/services/authService";
import { readRoleFromToken, setStoredRole } from "@/utils/auth";
import styles from "./AuthPage.module.css";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isBlocked, setIsBlocked] = useState(false);
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
          password
        });

        if (response.token) {
          localStorage.setItem("auth_token", response.token);
        }

        const resolvedRole = response.role || readRoleFromToken(response.token);
        setStoredRole(resolvedRole);

        setSuccess(response.message || "Вход выполнен успешно");
        router.push(resolvedRole === "Student" ? "/Session" : "/Quests");
      } else {
        const response = await registerUser({
          username: username.trim(),
          password,
          role
        });

        setSuccess(response.message || "Пользователь зарегистрирован");
        router.push(role.toLowerCase() === "student" ? "/Session" : "/Quests");

        if (role.toLowerCase() === "student") {
          router.push("/Session");
        }
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Неизвестная ошибка";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "login" ? styles.active : ""}`}
            onClick={() => setMode("login")}
          >
            Вход
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${mode === "register" ? styles.active : ""}`}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите username"
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </label>

          {mode === "register" && (
            <>
              <label className={styles.label}>
                Role
                <select className={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isBlocked}
                  onChange={(e) => setIsBlocked(e.target.checked)}
                  disabled
                />
                IsBlocked (по умолчанию false)
              </label>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? "Отправка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </main>
  );
}
