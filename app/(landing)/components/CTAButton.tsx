"use client";

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
}

export default function CTAButton({ children, onClick, variant = "primary", className = "" }: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`cta ${variant === "primary" ? "cta-primary" : "cta-ghost"} ${className}`}
    >
      {children}
    </button>
  );
}
