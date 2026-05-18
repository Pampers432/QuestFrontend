"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from "@/services/categoriesService";
import RoleGuard from "@/components/RoleGuard";
import { getStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { SkeletonCard } from "@/components/Skeleton";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    const role = getStoredRole();
    if (role !== "Admin") {
      router.replace("/");
      return;
    }
    loadCategories();
  }, [router]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError("Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    try {
      await createCategory(formData);
      setFormData({ name: "", description: "" });
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка создания категории");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) return;
    try {
      await updateCategory(id, formData);
      setEditingId(null);
      setFormData({ name: "", description: "" });
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка обновления категории");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка удаления категории");
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || "" });
  };

  if (loading) return <div className="page-container"><SkeletonCard /></div>;
  if (error) return <div className="page-container" style={{ color: "var(--color-error)" }}>{error}</div>;

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
        <PageSun
          style={{ position: "fixed", top: "3%", right: "6%", width: 65, height: 65, opacity: 0.3, zIndex: 0 }}
          className="animate-float-slow"
        />
        <PageCloud
          style={{ position: "fixed", top: "8%", left: "3%", width: 85, height: 42, opacity: 0.25, zIndex: 0 }}
          className="animate-drift"
        />
        <PageStars
          style={{ position: "fixed", top: "12%", left: "50%", width: 130, height: 20, opacity: 0.15, zIndex: 0 }}
        />

        <div className="page-container" style={{ maxWidth: 800, position: "relative", zIndex: 1 }}>
          <h1 className="page-title" style={{ background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            📁 Управление категориями
          </h1>

          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            padding: 24,
            borderRadius: 20,
            marginBottom: 32,
            border: "2px solid rgba(255,107,53,0.1)",
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "var(--color-orange)" }}>
              {editingId ? "✏️ Редактировать категорию" : "➕ Создать категорию"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Название категории *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  padding: "12px 16px",
                  border: "2px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 15,
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
                onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
              />
              <textarea
                placeholder="Описание (необязательно)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  padding: "12px 16px",
                  border: "2px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 15,
                  minHeight: 60,
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="primary" onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}>
                  {editingId ? "💾 Сохранить" : "➕ Создать"}
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={() => { setEditingId(null); setFormData({ name: "", description: "" }); }}>
                    Отмена
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "2px solid rgba(255,107,53,0.08)",
            borderRadius: 20,
            overflow: "hidden",
          }}>
            <div style={{
              padding: "16px 20px",
              borderBottom: "2px solid rgba(255,107,53,0.1)",
              fontWeight: 700,
              color: "var(--color-orange)",
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              📋 Список категорий
            </div>
            {categories.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
                Категории не найдены
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255,107,53,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{category.name}</div>
                    {category.description && (
                      <div style={{ color: "var(--color-text-secondary)", fontSize: 14, marginTop: 4 }}>{category.description}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>✏️ Редактировать</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(category.id)}>🗑️ Удалить</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
