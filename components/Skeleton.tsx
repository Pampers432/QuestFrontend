"use client";

import styles from "./Skeleton.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export default function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = "var(--radius-sm)",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.title} />
      <div className={styles.text} />
      <div className={styles.textShort} />
    </div>
  );
}
