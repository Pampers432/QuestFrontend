"use client";

import { ReactNode } from "react";
import styles from "./Table.module.css";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  className?: string;
}

export default function Table<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  className = "",
}: TableProps<T>) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className={`${styles.tr} ${onRowClick ? styles.clickable : ""}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className={styles.empty}>Нет данных</div>
      )}
    </div>
  );
}
