"use client";

import { useState, useEffect } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handle = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "4px",
      zIndex: 999, pointerEvents: "none",
    }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: "linear-gradient(90deg, #FF6B35, #4ECDC4, #45B7D1)",
        backgroundSize: "200% 100%",
        animation: "gradientShift 3s ease infinite",
        borderRadius: "0 2px 2px 0",
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}
