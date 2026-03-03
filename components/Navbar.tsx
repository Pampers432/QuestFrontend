"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredRole,
  canUseTemplates,
  canManageTemplates,
  clearAuthStorage,
  UserRole
} from "@/utils/auth";
import styles from "./Navbar.module.css";

const getHomeHrefByRole = (role: UserRole | null) =>
  role === "Student" ? "/Session" : "/Quests";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const syncRole = () => setRole(getStoredRole());
    syncRole();

    window.addEventListener("storage", syncRole);
    window.addEventListener("roleChanged", syncRole);

    return () => {
      window.removeEventListener("storage", syncRole);
      window.removeEventListener("roleChanged", syncRole);
    };
  }, []);

  const logout = () => {
    clearAuthStorage();
    setRole(null);

    window.history.pushState(null, "", window.location.href);
    window.history.forward();

    router.replace("/Auth");
  };


  if (role === null) {
    return (
      <nav className={styles.nav}>
        <div className={styles.logo}>Quest Builder</div>
      </nav>
    );
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Quest Builder</div>

      <div className={styles.links}>
        <Link href={getHomeHrefByRole(role)} className={styles.link}>
          Главная
        </Link>

        <Link href="/Session" className={styles.link}>
          Прохождение теста
        </Link>

        {canUseTemplates(role) && (
          <Link href="/Templates" className={styles.link}>
            Шаблоны
          </Link>
        )}

        <Link href="/Quests" className={styles.link}>
          Квесты
        </Link>

        <Link href="/Auth" className={styles.link}>
          Вход / Регистрация
        </Link>

        {role && (
          <button
            onClick={logout}
            className={styles.link}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Выйти
          </button>
        )}
      </div>
    </nav>
  );
}
