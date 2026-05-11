"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "calc(100vh - 56px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center",
    }}>
      <h1 style={{ fontSize: 64, fontWeight: 800, color: "var(--color-primary)", margin: 0, lineHeight: 1 }}>
        404
      </h1>
      <p style={{ fontSize: 18, color: "var(--color-text-secondary)", margin: "16px 0 24px" }}>
        Страница не найдена
      </p>
      <Button variant="primary" onClick={() => router.push("/")}>
        На главную
      </Button>
    </div>
  );
}
