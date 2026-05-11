"use client";

import { ReactNode } from "react";
import styles from "./Tabs.module.css";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`${styles.tab} ${active === tab.value ? styles.active : ""}`}
          onClick={() => onChange(tab.value)}
          role="tab"
          aria-selected={active === tab.value}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
