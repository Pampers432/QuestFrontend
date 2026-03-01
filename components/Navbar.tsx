"use client";

import Link from "next/link";
import { useState } from "react";
import { getStoredRole, canUseTemplates, canManageTemplates, clearAuthStorage, UserRole } from "@/utils/auth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [role, setRole] = useState<UserRole | null>(() => getStoredRole());

  const logout = () => {
    clearAuthStorage();
    setRole(null);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Quest Builder</div>

      <div className={styles.links}>
        <Link href="/" className={styles.link}>
          Главная
        </Link>

        {canUseTemplates(role) && (
          <Link href="/Templates" className={styles.link}>
            Шаблоны
          </Link>
        )}

        {canManageTemplates(role) && (
          <Link href="/" className={styles.link}>
            Редактор шаблонов
          </Link>
        )}

        <Link href="/Quests" className={styles.link}>
          Квесты
        </Link>

        <Link href="/Auth" className={styles.link}>
          Вход / Регистрация
        </Link>

        {role && (
          <button onClick={logout} className={styles.link} style={{ background: "none", border: "none", cursor: "pointer" }}>
            Выйти
          </button>
        )}
      </div>
    </nav>
  );
}
