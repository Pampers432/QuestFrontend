interface AlienMascotProps {
  className?: string;
}

export default function AlienMascot({ className = "" }: AlienMascotProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="100" cy="100" r="90" fill="#96CEB4" />
      <ellipse cx="70" cy="80" rx="18" ry="22" fill="white" />
      <ellipse cx="130" cy="80" rx="18" ry="22" fill="white" />
      <ellipse cx="70" cy="80" rx="10" ry="14" fill="#2D3436" />
      <ellipse cx="130" cy="80" rx="10" ry="14" fill="#2D3436" />
      <ellipse cx="74" cy="76" rx="4" ry="5" fill="white" />
      <ellipse cx="134" cy="76" rx="4" ry="5" fill="white" />
      <path
        d="M75 115 C85 130, 115 130, 125 115"
        stroke="#2D3436"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="100" cy="45" r="6" fill="#FF6B35" />
      <ellipse cx="50" cy="60" rx="6" ry="12" fill="#45B7D1" transform="rotate(-20, 50, 60)" />
      <ellipse cx="150" cy="60" rx="6" ry="12" fill="#45B7D1" transform="rotate(20, 150, 60)" />
      <circle cx="100" cy="130" r="8" fill="#FFEAA7" />
      <circle cx="90" cy="138" r="5" fill="#FFEAA7" />
      <circle cx="110" cy="138" r="5" fill="#FFEAA7" />
    </svg>
  );
}
