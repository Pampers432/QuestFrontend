"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  progress: number;
  onComplete: () => void;
}

const statuses = [
  { min: 0, max: 10, text: "Запускаем двигатели..." },
  { min: 10, max: 30, text: "Прокладываем маршрут..." },
  { min: 30, max: 50, text: "Облетаем Луну..." },
  { min: 50, max: 75, text: "Входим в атмосферу..." },
  { min: 75, max: 95, text: "Снижаемся..." },
  { min: 95, max: 100, text: "Приземляемся! 🚀" },
];

function getStatus(progress: number) {
  return statuses.find((s) => progress >= s.min && progress < s.max) || statuses[statuses.length - 1];
}

export default function Preloader({ progress, onComplete }: PreloaderProps) {
  const [typed, setTyped] = useState("");
  const [displayProgress, setDisplayProgress] = useState(0);
  const [show, setShow] = useState(true);
  const status = getStatus(progress);

  useEffect(() => {
    setDisplayProgress(progress);
    if (progress >= 100) {
      setTimeout(() => {
        setShow(false);
        setTimeout(() => onComplete(), 600);
      }, 800);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    setTyped("");
    const fullText = status.text;
    let i = 0;
    const interval = setInterval(() => {
      setTyped(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [status.text]);

  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: `${Math.random() * 4}s`,
    duration: `${Math.random() * 3 + 2}s`,
  }));

  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    angle: Math.random() * 360,
    distance: Math.random() * 60 + 20,
    delay: `${Math.random() * 0.5}s`,
    duration: `${Math.random() * 0.5 + 0.5}s`,
  }));

  const mathSymbols = ["∑", "π", "√", "∞", "∫", "α", "β", "Δ", "λ"];
  const floatingSymbols = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    symbol: mathSymbols[i % mathSymbols.length],
    left: `${Math.random() * 90 + 5}%`,
    top: `${Math.random() * 70 + 10}%`,
    size: Math.random() * 14 + 14,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 4 + 4}s`,
    opacity: Math.random() * 0.15 + 0.05,
  }));

  if (!show) return null;

  const reentryIntensity = Math.max(0, Math.min(1, (progress - 50) / 25));
  const showLandingFlash = progress >= 95 && progress < 100;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 40%, #2d1b69 70%, #1a1a4e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      overflow: "hidden", transition: "opacity 0.6s ease, transform 0.6s ease",
      opacity: show ? 1 : 0, transform: show ? "scale(1)" : "scale(1.1)",
    }}>
      {/* Stars */}
      {stars.map((s) => (
        <div key={s.id} style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#fff",
          animation: `twinkle ${s.duration} ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}

      {/* Nebula */}
      <div style={{
        position: "absolute", width: "300px", height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(150,50,200,0.15), transparent)",
        top: "20%", left: "15%",
        animation: "nebulaRotate 12s ease-in-out infinite",
        filter: "blur(40px)",
      }} />
      <div style={{
        position: "absolute", width: "250px", height: "250px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(50,150,200,0.12), transparent)",
        top: "60%", right: "20%",
        animation: "nebulaRotate 15s ease-in-out infinite reverse",
        filter: "blur(40px)",
      }} />

      {/* Re-entry overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `rgba(255, 80, 20, ${reentryIntensity * 0.12})`,
        transition: "opacity 0.5s ease",
        pointerEvents: "none",
      }} />

      {/* Landing flash */}
      {showLandingFlash && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(255,255,255,0.5)",
          animation: "landingFlash 0.5s ease-out",
          pointerEvents: "none",
        }} />
      )}

      {/* Floating math symbols */}
      {floatingSymbols.map((s) => (
        <div key={s.id} style={{
          position: "absolute", left: s.left, top: s.top,
          fontSize: s.size, color: "rgba(255,255,255,0.15)",
          opacity: s.opacity,
          animation: `floatUp ${s.duration} ease-in-out infinite`,
          animationDelay: s.delay,
          pointerEvents: "none",
          fontFamily: "serif",
        }}>
          {s.symbol}
        </div>
      ))}

      {/* Spaceship */}
      <div style={{
        position: "relative",
        animation: progress < 95
          ? `flyTrajectory 8s ease-in-out infinite`
          : `flyLand 1.5s ease-in-out forwards`,
        transform: progress >= 95 ? "translate(50%, 20px) scale(1.3)" : undefined,
      }}>
        <svg width="140" height="180" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: `drop-shadow(0 0 ${10 + reentryIntensity * 30}px rgba(255,107,53,${0.3 + reentryIntensity * 0.4}))`,
            animation: progress >= 50 && progress < 95 ? "shake 0.15s ease-in-out infinite" : undefined,
          }}
        >
          {/* Engine flame */}
          <ellipse cx="70" cy="170" rx="20" ry="25" fill="#FF6B35" opacity={0.8}
            style={{ animation: "engineFlame 0.3s ease-in-out infinite" }}
          />
          <ellipse cx="70" cy="175" rx="12" ry="18" fill="#FFEAA7" opacity={0.9}
            style={{ animation: "engineFlame 0.2s ease-in-out infinite 0.1s" }}
          />
          <ellipse cx="70" cy="178" rx="6" ry="10" fill="#fff" opacity={0.9}
            style={{ animation: "engineFlame 0.25s ease-in-out infinite 0.05s" }}
          />

          {/* Body */}
          <path d="M70 5 Q110 30 110 90 L110 140 Q110 160 70 165 Q30 160 30 140 L30 90 Q30 30 70 5Z"
            fill="url(#shipGrad)" stroke="#4a4a7a" strokeWidth="2"
          />
          <defs>
            <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c0c0e0" />
              <stop offset="50%" stopColor="#8888b0" />
              <stop offset="100%" stopColor="#555580" />
            </linearGradient>
          </defs>

          {/* Window */}
          <circle cx="70" cy="65" r="28" fill="#1a1a3e" stroke="#8888b0" strokeWidth="3" />
          <circle cx="70" cy="65" r="22" fill="#2a2a5e" />

          {/* Alien inside */}
          <circle cx="70" cy="60" r="16" fill="#96CEB4" />
          <ellipse cx="62" cy="55" rx="5" ry="7" fill="white" />
          <ellipse cx="78" cy="55" rx="5" ry="7" fill="white" />
          <ellipse cx="62" cy="55" rx="3" ry="5" fill="#2D3436"
            style={{ animation: "blink 4s ease-in-out infinite" }}
          />
          <ellipse cx="78" cy="55" rx="3" ry="5" fill="#2D3436"
            style={{ animation: "blink 4s ease-in-out infinite 0.1s" }}
          />
          <path d="M63 68 Q70 74 77 68" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="70" cy="40" r="4" fill="#FF6B35" />

          {/* Wings */}
          <path d="M15 100 Q25 85 35 100 L30 130 L15 130Z" fill="#7070a0" opacity={0.8} />
          <path d="M125 100 Q115 85 105 100 L110 130 L125 130Z" fill="#7070a0" opacity={0.8} />

          {/* Antenna */}
          <line x1="70" y1="5" x2="70" y2="-10" stroke="#8888b0" strokeWidth="2" />
          <circle cx="70" cy="-12" r="4" fill="#FF6B35"
            style={{ animation: "antennaBlink 1s ease-in-out infinite" }}
          />
          <circle cx="70" cy="-12" r="2" fill="#FFEAA7"
            style={{ animation: "antennaBlink 1s ease-in-out infinite 0.3s" }}
          />

          {/* Exhaust particles */}
          {particles.map((p) => (
            <circle key={p.id} cx="70" cy="170" r="3" fill="#FF6B35"
              style={{
                animation: `particleFly ${p.duration} ease-out infinite`,
                animationDelay: p.delay,
                transformOrigin: "center",
              }}
            />
          ))}
        </svg>
      </div>

      {/* Earth */}
      <div style={{
        position: "absolute", bottom: "-5%", width: "80%", height: "30%",
        borderRadius: "50% 50% 0 0",
        background: "linear-gradient(180deg, #1a5a8a 0%, #0a3a5a 40%, #0a2a4a 100%)",
        boxShadow: "0 -20px 60px rgba(30,100,180,0.3)",
        overflow: "hidden",
        transform: `scale(${1 + (progress / 100) * 0.3})`,
        transition: "transform 0.5s ease",
      }}>
        {/* Continents */}
        <div style={{
          position: "absolute", width: "20%", height: "25%",
          background: "#2a8a4a", borderRadius: "30% 40% 20% 30%",
          top: "30%", left: "25%", opacity: 0.8,
        }} />
        <div style={{
          position: "absolute", width: "15%", height: "20%",
          background: "#2a8a4a", borderRadius: "40% 30% 30% 40%",
          top: "35%", left: "55%", opacity: 0.7,
        }} />
        <div style={{
          position: "absolute", width: "8%", height: "12%",
          background: "#2a8a4a", borderRadius: "40%",
          top: "55%", left: "40%", opacity: 0.6,
        }} />

        {/* Atmosphere glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(100,180,255,0.15), transparent 50%)",
          borderRadius: "50% 50% 0 0",
        }} />

        {/* City lights */}
        {progress > 75 && (
          <>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${15 + Math.random() * 70}%`,
                top: `${25 + Math.random() * 40}%`,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                borderRadius: "50%",
                background: "#FFEAA7",
                animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }} />
            ))}
          </>
        )}
      </div>

      {/* Progress info */}
      <div style={{
        position: "absolute", bottom: "20%", display: "flex",
        flexDirection: "column", alignItems: "center", gap: "8px",
      }}>
        {/* Typewriter text */}
        <div style={{
          fontFamily: "'Nunito', sans-serif", fontWeight: 700,
          fontSize: "18px", color: "rgba(255,255,255,0.8)",
          minHeight: "28px",
        }}>
          {typed}
          <span style={{
            display: "inline-block", width: "2px", height: "20px",
            background: "#FF6B35", marginLeft: "2px",
            animation: "blink 0.75s step-end infinite",
            verticalAlign: "middle",
          }} />
        </div>

        {/* Percentage */}
        <div style={{
          fontFamily: "'Nunito', sans-serif", fontWeight: 900,
          fontSize: "48px",
          background: "linear-gradient(270deg, #FF6B35, #4ECDC4, #45B7D1)",
          backgroundSize: "600% 600%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "gradientShift 3s ease infinite",
          lineHeight: 1,
        }}>
          {Math.floor(displayProgress)}%
        </div>

        {/* Thin progress bar */}
        <div style={{
          width: "200px", height: "4px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: `${displayProgress}%`,
            background: "linear-gradient(90deg, #FF6B35, #4ECDC4)",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes nebulaRotate {
          0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
          50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
          100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
        }
        @keyframes flyTrajectory {
          0% { transform: translate(-80px, -40px) rotate(-10deg); }
          25% { transform: translate(-20px, -20px) rotate(-5deg); }
          50% { transform: translate(20px, 0px) rotate(0deg); }
          75% { transform: translate(10px, 10px) rotate(3deg); }
          100% { transform: translate(-80px, -40px) rotate(-10deg); }
        }
        @keyframes flyLand {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(50px, 30px) scale(1.3); }
        }
        @keyframes engineFlame {
          0%, 100% { transform: scaleY(0.8) scaleX(0.6); opacity: 0.7; }
          50% { transform: scaleY(1.3) scaleX(0.8); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
        @keyframes antennaBlink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes particleFly {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes landingFlash {
          0% { opacity: 0; }
          40% { opacity: 0.6; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
