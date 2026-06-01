"use client";

export function ZigzagDivider({ color }: { color?: string }) {
  return (
    <div style={{ lineHeight: 0, overflow: "hidden", marginBottom: "-1px" }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: "100%", height: "80px", display: "block" }}>
        <path
          d="M0 40 Q60 0 120 40 T240 40 T360 40 T480 40 T600 40 T720 40 T840 40 T960 40 T1080 40 T1200 40 T1320 40 T1440 40 L1440 80 L0 80 Z"
          fill={color || "var(--color-surface)"}
          opacity="0.6"
        />
        <path
          d="M0 50 Q80 10 160 50 T320 50 T480 50 T640 50 T800 50 T960 50 T1120 50 T1280 50 T1440 50 L1440 80 L0 80 Z"
          fill={color || "var(--color-surface)"}
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

export function SunDoodle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="60" cy="60" r="22" fill="var(--color-yellow)" />
      <circle cx="60" cy="60" r="18" fill="#FFD93D" />
      <path d="M60 28 Q55 20 60 12 Q65 20 60 28Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M60 92 Q55 100 60 108 Q65 100 60 92Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M28 60 Q20 55 12 60 Q20 65 28 60Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M92 60 Q100 55 108 60 Q100 65 92 60Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M36 36 Q28 28 32 22 Q38 28 36 36Z" fill="var(--color-orange)" opacity="0.5" />
      <path d="M84 84 Q92 92 88 98 Q82 92 84 84Z" fill="var(--color-orange)" opacity="0.5" />
      <path d="M84 36 Q92 28 88 22 Q82 28 84 36Z" fill="var(--color-orange)" opacity="0.5" />
      <path d="M36 84 Q28 92 32 98 Q38 92 36 84Z" fill="var(--color-orange)" opacity="0.5" />
      <circle cx="53" cy="57" r="3" fill="var(--color-text-primary)" />
      <circle cx="67" cy="57" r="3" fill="var(--color-text-primary)" />
      <path d="M54 67 Q60 72 66 67" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function CloudDoodle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <ellipse cx="40" cy="55" rx="30" ry="18" fill="var(--color-surface)" opacity="0.8" />
      <ellipse cx="70" cy="45" rx="35" ry="22" fill="var(--color-surface)" opacity="0.9" />
      <ellipse cx="100" cy="55" rx="28" ry="16" fill="var(--color-surface)" opacity="0.8" />
      <ellipse cx="55" cy="38" rx="22" ry="16" fill="white" opacity="0.95" />
      <ellipse cx="85" cy="38" rx="20" ry="14" fill="white" opacity="0.95" />
    </svg>
  );
}

export function SparkleDoodle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M20 2 Q18 18 2 20 Q18 22 20 38 Q22 22 38 20 Q22 18 20 2Z" fill="var(--color-yellow)" />
      <circle cx="20" cy="20" r="4" fill="#FFD93D" />
    </svg>
  );
}

export function TreeDoodle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <rect x="34" y="70" width="12" height="45" rx="4" fill="#8B5E3C" opacity="0.6" />
      <circle cx="40" cy="35" r="28" fill="var(--color-lime)" opacity="0.7" />
      <circle cx="28" cy="50" r="20" fill="var(--color-lime)" opacity="0.5" />
      <circle cx="52" cy="50" r="20" fill="var(--color-lime)" opacity="0.5" />
      <circle cx="40" cy="28" r="18" fill="var(--color-lime-light)" opacity="0.6" />
      <circle cx="35" cy="50" r="12" fill="var(--color-teal)" opacity="0.4" />
      <circle cx="38" cy="32" r="3" fill="var(--color-orange)" opacity="0.8" />
      <circle cx="50" cy="40" r="3" fill="var(--color-orange)" opacity="0.6" />
    </svg>
  );
}

export function PaintedDots({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="20" cy="30" r="6" fill="var(--color-orange)" opacity="0.3" />
      <circle cx="170" cy="20" r="4" fill="var(--color-sky)" opacity="0.3" />
      <circle cx="150" cy="180" r="8" fill="var(--color-yellow)" opacity="0.4" />
      <circle cx="30" cy="160" r="5" fill="var(--color-teal)" opacity="0.3" />
      <circle cx="100" cy="10" r="3" fill="var(--color-plum)" opacity="0.3" />
      <circle cx="180" cy="100" r="5" fill="var(--color-orange)" opacity="0.2" />
      <circle cx="10" cy="90" r="4" fill="var(--color-lime)" opacity="0.3" />
      <circle cx="60" cy="190" r="3" fill="var(--color-sky)" opacity="0.25" />
      <circle cx="130" cy="50" r="7" fill="var(--color-peach)" opacity="0.5" />
      <circle cx="190" cy="150" r="3" fill="var(--color-lime)" opacity="0.3" />
      <path d="M10 50 Q30 40 50 55 T90 50 T130 60 T160 45 T190 55" stroke="var(--color-orange)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.2" />
      <path d="M20 140 Q40 130 60 145 T100 135 T140 145 T170 130 T190 140" stroke="var(--color-sky)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.15" />
    </svg>
  );
}

export function ZigzagBg({ className = "", color = "var(--color-orange)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M0 80 L40 30 L80 70 L120 20 L160 60 L200 10 L240 50 L280 0 L320 40 L360 0 L400 30 L400 120 L0 120 Z" fill={color} opacity="0.06" />
      <path d="M0 100 L60 50 L120 85 L180 40 L240 75 L300 30 L360 65 L400 50 L400 120 L0 120 Z" fill={color} opacity="0.04" />
    </svg>
  );
}

// === NEW DECORATIONS ===

export function FloatingShape({ className = "", style, color = "var(--color-orange)" }: { className?: string; style?: React.CSSProperties; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`animate-morph ${className}`} style={style}>
      <circle cx="50" cy="50" r="45" fill={color} opacity="0.08" />
    </svg>
  );
}

export function GradientOrb({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-morph ${className}`} style={{
      position: "absolute", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,107,53,0.08), transparent)",
      filter: "blur(40px)", pointerEvents: "none",
      width: "250px", height: "250px",
      animation: "morph 8s ease-in-out infinite, pulseGlow 3s ease-in-out infinite",
      ...style,
    }} />
  );
}

export function Confetti({ count = 20 }: { count?: number }) {
  if (typeof window === "undefined") return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          position: "absolute", top: "-10px", left: `${Math.random() * 100}%`,
          width: `${Math.random() * 8 + 4}px`, height: `${Math.random() * 8 + 4}px`,
          background: ["#FF6B35", "#4ECDC4", "#45B7D1", "#FFEAA7", "#DDA0DD", "#96CEB4"][Math.floor(Math.random() * 6)],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `confetti ${Math.random() * 2 + 1.5}s ease-out forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  );
}

export function BouncingDots({ className = "" }: { className?: string }) {
  return (
    <div className={className} style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: "8px", height: "8px", borderRadius: "50%",
          background: "var(--color-orange)",
          animation: "bounceSoft 0.6s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  );
}

export function ShootingStar() {
  return (
    <div style={{
      position: "absolute", width: "4px", height: "4px",
      borderRadius: "50%", background: "#fff",
      boxShadow: "0 0 6px 2px rgba(255,255,255,0.3)",
      animation: "shootingStar 4s ease-in infinite",
      animationDelay: `${Math.random() * 6}s`,
      top: `${Math.random() * 40}%`, right: "0%",
      pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute", top: "50%", right: "100%",
        width: "60px", height: "1px",
        background: "linear-gradient(to left, rgba(255,255,255,0.6), transparent)",
        transform: "translateY(-50%)",
      }} />
    </div>
  );
}
