"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "@/services/authService";
import { readRoleFromToken, setStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { PageSun, PageCloud, PageSmiley, PageFlower } from "@/components/PageDoodles";
import styles from "./AuthPage.module.css";

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
      setError("Введите имя пользователя и пароль");
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
    <div className={styles.page}>
      <PageSun
        style={{
          position: "fixed",
          top: "5%",
          right: "8%",
          width: 100,
          height: 100,
          opacity: 0.5,
          zIndex: 0,
        }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{
          position: "fixed",
          top: "12%",
          left: "5%",
          width: 120,
          height: 60,
          opacity: 0.4,
          zIndex: 0,
        }}
        className="animate-drift"
      />
      <PageCloud
        style={{
          position: "fixed",
          bottom: "15%",
          right: "10%",
          width: 100,
          height: 50,
          opacity: 0.3,
          zIndex: 0,
        }}
        className="animate-float"
      />
      <PageSmiley
        style={{
          position: "fixed",
          bottom: "8%",
          left: "10%",
          width: 60,
          height: 60,
          opacity: 0.3,
          zIndex: 0,
        }}
        className="animate-wobble"
      />
      <PageFlower
        style={{
          position: "fixed",
          top: "40%",
          right: "3%",
          width: 40,
          height: 40,
          opacity: 0.3,
          zIndex: 0,
        }}
        className="animate-bounceSoft"
      />

      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.modeSwitch}>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`${styles.modeButton} ${mode === "login" ? styles.active : ""}`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            className={`${styles.modeButton} ${mode === "register" ? styles.active : ""}`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <Input
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={error && !username.trim() ? "Обязательное поле" : undefined}
          />

          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && !password.trim() ? "Обязательное поле" : undefined}
          />

          {mode === "register" && (
            <div>
              <label className={styles.label}>
                Роль
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.input}
                >
                  <option value="student">Студент</option>
                  <option value="teacher">Учитель</option>
                </select>
              </label>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <Button type="submit" variant="primary" size="lg" loading={isSubmitting} style={{ marginTop: 8, borderRadius: 9999 }}>
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
          </Button>
        </form>
      </div>
    </div>
  );
}
