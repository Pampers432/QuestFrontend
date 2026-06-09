"use client";

import { useState, useRef, useEffect } from "react";
import { createCategory } from "@/services/categoriesService";
import { useToast } from "@/components/Toast";

interface Category {
  id: string;
  name: string;
}

interface CategorySearchProps {
  categories: Category[];
  value: string | undefined;
  onChange: (id: string | undefined, name?: string) => void;
}

export default function CategorySearch({ categories, value, onChange }: CategorySearchProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = categories.find(c => c.id === value);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const showCreate = query.trim().length > 0 &&
    !filtered.some(c => c.name.toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (cat: Category) => {
    setQuery("");
    setOpen(false);
    onChange(cat.id, cat.name);
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newCat = await createCategory({ name: query.trim() });
      setQuery("");
      setOpen(false);
      onChange(newCat.id, newCat.name);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Ошибка создания категории", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", marginBottom: 10 }}>
      <input
        type="text"
        placeholder="Поиск или создание категории..."
        value={open ? query : (selected?.name || "")}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setQuery(""); }}
        className="quest-input"
        style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
      />
      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 100,
          maxHeight: 240,
          overflowY: "auto",
        }}>
          <div style={{ padding: "6px 10px", fontSize: 12, color: "#999", borderBottom: "1px solid #eee" }}>
            {filtered.length} категорий{showCreate ? " · создать новую" : ""}
          </div>
          {filtered.map(cat => (
            <div
              key={cat.id}
              onClick={() => handleSelect(cat)}
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                background: cat.id === value ? "#f0f7ff" : "transparent",
                fontWeight: cat.id === value ? 600 : 400,
                borderBottom: "1px solid #f5f5f5",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = cat.id === value ? "#f0f7ff" : "transparent"}
            >
              {cat.name}
            </div>
          ))}
          {showCreate && (
            <div
              onClick={handleCreate}
              style={{
                padding: "10px",
                cursor: "pointer",
                color: "var(--color-orange)",
                fontWeight: 600,
                borderTop: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fff5f0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {creating ? "⏳ Создание..." : `➕ Создать "${query.trim()}"`}
            </div>
          )}
          {filtered.length === 0 && !showCreate && (
            <div style={{ padding: 12, color: "#999", textAlign: "center" }}>Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
}
