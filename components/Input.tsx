"use client";

import { InputHTMLAttributes, useState } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  rightElement,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`${styles.group} ${className}`}>
      <input
        id={inputId}
        className={`${styles.field} ${error ? styles.hasError : ""} ${rightElement ? styles.hasRight : ""}`}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <label htmlFor={inputId} className={`${styles.label} ${focused || props.value ? styles.floating : ""}`}>
        {label}
      </label>
      {rightElement && <div className={styles.right}>{rightElement}</div>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
