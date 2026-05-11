"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  getStoredRole,
  canUseTemplates,
  canManageTemplates,
  clearAuthStorage,
  UserRole,
} from "@/utils/auth";
import styles from "./Navbar.module.css";
import Button from "./Button";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
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
    router.replace("/Auth");
  };

  const homeHref = role === "Student" ? "/Session" : "/Quests";

  const links = role
    ? [
        { href: homeHref, label: "Главная" },
        { href: "/Session", label: "Тест" },
        ...(canUseTemplates(role) ? [{ href: "/Templates", label: "Шаблоны" }] : []),
        { href: "/Quests", label: "Квесты" },
        ...(canManageTemplates(role) ? [{ href: "/Categories", label: "Категории" }] : []),
        ...(role === "Teacher" || role === "Admin" ? [{ href: "/Analytics", label: "Аналитика" }] : []),
      ]
    : [];

  return (
    <nav className={styles.nav}>
      <div className={styles.logo} onClick={() => router.push(homeHref)}>
        Quest Platform
      </div>

      <div className={styles.links}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname === link.href ? styles.active : ""}`}
          >
            {link.label}
          </Link>
        ))}

        {!role ? (
          <Link href="/Auth" className={styles.link}>
            Войти
          </Link>
        ) : (
          <Button variant="ghost" size="sm" onClick={logout}>
            Выйти
          </Button>
        )}
      </div>
    </nav>
  );
}
