"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Quest Builder</div>

      <div className={styles.links}>
        <Link href="/Quest" className={styles.link}>
          Quest
        </Link>

        <Link href="/" className={styles.link}>
          Home
        </Link>
      </div>
    </nav>
  );
}
