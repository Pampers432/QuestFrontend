"use client";

import { InputHTMLAttributes, useState } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`${styles.group} ${className}`}>
      <input
        id={inputId}
        className={`${styles.field} ${error ? styles.hasError : ""}`}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <label htmlFor={inputId} className={`${styles.label} ${focused || props.value ? styles.floating : ""}`}>
        {label}
      </label>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
