"use client";

const symbols = ["∑", "π", "√", "∞", "∫", "α", "β", "Δ", "λ"];

export default function FloatingElements() {
  const items = Array.from({ length: 9 }, (_, i) => ({
    symbol: symbols[i],
    left: `${5 + Math.random() * 90}%`,
    top: `${5 + Math.random() * 80}%`,
    size: Math.random() * 14 + 14,
    delay: `${Math.random() * 6}s`,
    duration: `${Math.random() * 4 + 5}s`,
    opacity: Math.random() * 0.2 + 0.08,
  }));

  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0,
    }}>
      {items.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: s.left, top: s.top,
          fontSize: s.size, color: "var(--color-orange)",
          opacity: s.opacity, fontFamily: "serif",
          animation: `floatUp ${s.duration} ease-in-out infinite`,
          animationDelay: s.delay,
          transform: `rotate(${Math.random() * 20 - 10}deg)`,
        }}>
          {s.symbol}
        </div>
      ))}
    </div>
  );
}
