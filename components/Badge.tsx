"use client";

import { ReactNode } from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  variant?: "default" | "success" | "error" | "warning" | "private";
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
