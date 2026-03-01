"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Quest Builder</div>

      <div className={styles.links}>
        <Link href="/" className={styles.link}>
          Главная
        </Link>

        <Link href="/Templates" className={styles.link}>
          Шаблоны
        </Link>       

        <Link href="/Quests" className={styles.link}>
          Квесты
        </Link>

        <Link href="/Auth" className={styles.link}>
          Вход / Регистрация
        </Link>
      </div>
    </nav>
  );
}
