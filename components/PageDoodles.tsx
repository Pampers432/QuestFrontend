"use client";

export function PageSun({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="60" cy="60" r="22" fill="var(--color-yellow)" />
      <circle cx="60" cy="60" r="18" fill="#FFD93D" />
      <path d="M60 28Q55 20 60 12Q65 20 60 28Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M60 92Q55 100 60 108Q65 100 60 92Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M28 60Q20 55 12 60Q20 65 28 60Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M92 60Q100 55 108 60Q100 65 92 60Z" fill="var(--color-orange)" opacity="0.7" />
      <path d="M36 36Q28 28 32 22Q38 28 36 36Z" fill="var(--color-orange)" opacity="0.5" />
      <path d="M84 84Q92 92 88 98Q82 92 84 84Z" fill="var(--color-orange)" opacity="0.5" />
      <path d="M84 36Q92 28 88 22Q82 28 84 36Z" fill="var(--color-orange)" opacity="0.5" />
      <path d="M36 84Q28 92 32 98Q38 92 36 84Z" fill="var(--color-orange)" opacity="0.5" />
      <circle cx="53" cy="57" r="3" fill="var(--color-text-primary)" />
      <circle cx="67" cy="57" r="3" fill="var(--color-text-primary)" />
      <path d="M54 67Q60 72 66 67" stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PageCloud({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <ellipse cx="40" cy="55" rx="30" ry="18" fill="white" opacity="0.8" />
      <ellipse cx="70" cy="45" rx="35" ry="22" fill="white" opacity="0.9" />
      <ellipse cx="100" cy="55" rx="28" ry="16" fill="white" opacity="0.8" />
      <ellipse cx="55" cy="38" rx="22" ry="16" fill="white" opacity="0.95" />
      <ellipse cx="85" cy="38" rx="20" ry="14" fill="white" opacity="0.95" />
    </svg>
  );
}

export function PageTree({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
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

export function PageSparkle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M20 2Q18 18 2 20Q18 22 20 38Q22 22 38 20Q22 18 20 2Z" fill="var(--color-yellow)" />
      <circle cx="20" cy="20" r="4" fill="#FFD93D" />
    </svg>
  );
}

export function PageHouse({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M10 55L50 15L90 55" stroke="var(--color-orange)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="var(--color-orange)" fillOpacity="0.15" />
      <rect x="30" y="55" width="40" height="40" rx="3" fill="var(--color-teal)" fillOpacity="0.25" stroke="var(--color-teal)" strokeWidth="2" />
      <rect x="42" y="70" width="16" height="25" rx="2" fill="var(--color-orange)" fillOpacity="0.3" />
      <rect x="34" y="60" width="10" height="12" rx="1" fill="white" fillOpacity="0.6" />
      <rect x="56" y="58" width="8" height="8" rx="1" fill="white" fillOpacity="0.6" />
      <path d="M25 45L25 35" stroke="var(--color-orange)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function PageChristmasTree({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <rect x="34" y="90" width="12" height="25" rx="3" fill="#8B5E3C" opacity="0.7" />
      <polygon points="40,15 15,55 65,55" fill="var(--color-teal)" fillOpacity="0.7" />
      <polygon points="40,30 18,65 62,65" fill="var(--color-teal)" fillOpacity="0.6" />
      <polygon points="40,45 22,75 58,75" fill="var(--color-teal)" fillOpacity="0.5" />
      <polygon points="40,55 25,82 55,82" fill="var(--color-lime)" fillOpacity="0.4" />
      <circle cx="40" cy="20" r="4" fill="var(--color-yellow)" opacity="0.9" />
      <circle cx="28" cy="48" r="3" fill="var(--color-orange)" opacity="0.8" />
      <circle cx="52" cy="45" r="3" fill="var(--color-orange)" opacity="0.8" />
      <circle cx="35" cy="60" r="3" fill="var(--color-yellow)" opacity="0.8" />
      <circle cx="48" cy="65" r="3" fill="var(--color-orange)" opacity="0.8" />
    </svg>
  );
}

export function PageSmiley({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="40" cy="40" r="35" fill="var(--color-yellow)" opacity="0.6" />
      <circle cx="30" cy="33" r="4" fill="var(--color-text-primary)" />
      <circle cx="50" cy="33" r="4" fill="var(--color-text-primary)" />
      <path d="M26 50Q40 62 54 50" stroke="var(--color-text-primary)" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function PageFlower({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="30" cy="20" r="8" fill="var(--color-orange)" opacity="0.6" />
      <circle cx="20" cy="28" r="8" fill="var(--color-plum)" opacity="0.6" />
      <circle cx="40" cy="28" r="8" fill="var(--color-plum)" opacity="0.6" />
      <circle cx="22" cy="42" r="8" fill="var(--color-orange)" opacity="0.6" />
      <circle cx="38" cy="42" r="8" fill="var(--color-orange)" opacity="0.6" />
      <circle cx="30" cy="33" r="6" fill="var(--color-yellow)" opacity="0.9" />
      <circle cx="30" cy="33" r="3" fill="var(--color-orange)" opacity="0.5" />
    </svg>
  );
}

export function PageStars({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M10 15L13 9L19 8L14 13L16 19L10 16L4 19L6 13L1 8L7 9L10 15Z" fill="var(--color-yellow)" opacity="0.5" />
      <path d="M60 10L62 6L66 5L63 9L64 13L60 11L56 13L57 9L54 5L58 6L60 10Z" fill="var(--color-yellow)" opacity="0.4" />
      <path d="M130 20L132 16L136 15L133 19L134 23L130 21L126 23L127 19L124 15L128 16L130 20Z" fill="var(--color-yellow)" opacity="0.5" />
      <path d="M170 8L172 4L176 3L173 7L174 11L170 9L166 11L167 7L164 3L168 4L170 8Z" fill="var(--color-yellow)" opacity="0.4" />
      <path d="M100 25L102 21L106 20L103 24L104 28L100 26L96 28L97 24L94 20L98 21L100 25Z" fill="var(--color-yellow)" opacity="0.3" />
    </svg>
  );
}
