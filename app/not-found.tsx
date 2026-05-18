"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { PageSun, PageCloud, PageSmiley, PageStars } from "@/components/PageDoodles";

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      textAlign: "center",
      position: "relative",
    }}>
      <PageSun
        style={{ position: "fixed", top: "5%", right: "10%", width: 100, height: 100, opacity: 0.4, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "12%", left: "5%", width: 120, height: 60, opacity: 0.3, zIndex: 0 }}
        className="animate-drift"
      />
      <PageSmiley
        style={{ position: "fixed", bottom: "8%", left: "10%", width: 60, height: 60, opacity: 0.25, zIndex: 0 }}
        className="animate-wobble"
      />
      <PageStars
        style={{ position: "fixed", top: "20%", left: "30%", width: 200, height: 30, opacity: 0.2, zIndex: 0 }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 120, lineHeight: 1, marginBottom: 16 }}>
          🧭
        </div>
        <h1 style={{ fontSize: 80, fontWeight: 900, margin: 0, lineHeight: 1, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          404
        </h1>
        <p style={{ fontSize: 20, color: "var(--color-text-secondary)", margin: "16px 0 32px", maxWidth: 400 }}>
          Ой! Кажется, эта страница заблудилась в космосе 🚀
        </p>
        <Button variant="primary" onClick={() => router.push("/")}>
          🏠 На главную
        </Button>
      </div>
    </div>
  );
}
