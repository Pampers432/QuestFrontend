"use client";

import { useMousePosition } from "../hooks/useMousePosition";

interface AlienMascotProps {
  className?: string;
  variant?: "happy" | "thinking" | "celebrate" | "idle" | "excited";
  size?: number;
}

export default function AlienMascot({ className = "", variant = "idle", size }: AlienMascotProps) {
  const { normalizedX, normalizedY } = useMousePosition();

  const pupilOffsetX = normalizedX * 3;
  const pupilOffsetY = normalizedY * 2 - 1;

  const getMouth = () => {
    switch (variant) {
      case "happy": return "M65 75 Q70 82 75 75";
      case "thinking": return "M65 75 Q70 73 75 75";
      case "celebrate": return "M62 72 Q70 85 78 72";
      case "excited": return "M63 72 Q70 84 77 72";
      default: return "M67 76 Q70 79 73 76";
    }
  };

  const getEyeStyle = () => ({
    transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`,
    transition: "transform 0.1s ease",
  });

  const shouldBlink = variant !== "excited" && variant !== "celebrate";

  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: size, height: size }}
    >
      {/* Body */}
      <circle cx="70" cy="75" r="55" fill="#96CEB4"
        style={{ animation: variant === "celebrate" ? "bounceSoft 0.5s ease-in-out infinite" : undefined }}
      />

      {/* Eyes */}
      <ellipse cx="52" cy="60" rx="14" ry="18" fill="white" />
      <ellipse cx="88" cy="60" rx="14" ry="18" fill="white" />
      <ellipse cx="52" cy="60" rx="9" ry="13" fill="#2D3436" style={shouldBlink ? { animation: "blink 4s ease-in-out infinite" } : {}} />
      <ellipse cx="88" cy="60" rx="9" ry="13" fill="#2D3436" style={shouldBlink ? { animation: "blink 4s ease-in-out infinite 0.15s" } : {}} />

      {/* Pupils */}
      <ellipse cx="52" cy="57" rx="4" ry="5" fill="white" style={getEyeStyle()} />
      <ellipse cx="88" cy="57" rx="4" ry="5" fill="white" style={getEyeStyle()} />

      {/* Mouth */}
      <path
        d={getMouth()}
        stroke="#2D3436"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      >
        {variant === "celebrate" && (
          <animate attributeName="d" values={getMouth() + ";" + "M60 72 Q70 86 80 72" + ";" + getMouth()} dur="1s" repeatCount="indefinite" />
        )}
      </path>

      {/* Antenna */}
      <line x1="70" y1="20" x2="70" y2="5" stroke="#2D3436" strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="2" r="7" fill="#FF6B35">
        {variant === "excited" && (
          <animate attributeName="r" values="7;9;7" dur="0.5s" repeatCount="indefinite" />
        )}
      </circle>
      <circle cx="70" cy="2" r="4" fill="#FFEAA7" />

      {/* Cheek blush */}
      <ellipse cx="42" cy="72" rx="7" ry="4" fill="#FF8C5A" opacity="0.4" />
      <ellipse cx="98" cy="72" rx="7" ry="4" fill="#FF8C5A" opacity="0.4" />

      {/* Ears */}
      <ellipse cx="35" cy="45" rx="8" ry="14" fill="#7ab89a" transform="rotate(-15, 35, 45)" />
      <ellipse cx="105" cy="45" rx="8" ry="14" fill="#7ab89a" transform="rotate(15, 105, 45)" />

      {/* Sparkles for celebrate */}
      {variant === "celebrate" && (
        <>
          <text x="25" y="30" fontSize="12" fill="#FFEAA7" style={{ animation: "floatUp 1s ease-in-out infinite" }}>✦</text>
          <text x="100" y="25" fontSize="10" fill="#FF6B35" style={{ animation: "floatUp 1.3s ease-in-out infinite 0.3s" }}>✦</text>
          <text x="115" y="50" fontSize="14" fill="#4ECDC4" style={{ animation: "floatUp 0.8s ease-in-out infinite 0.6s" }}>✦</text>
          <text x="15" y="55" fontSize="9" fill="#45B7D1" style={{ animation: "floatUp 1.1s ease-in-out infinite 0.2s" }}>✦</text>
        </>
      )}
    </svg>
  );
}
