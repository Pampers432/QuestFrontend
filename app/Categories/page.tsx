"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from "@/services/categoriesService";
import RoleGuard from "@/components/RoleGuard";
import { getStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { SkeletonCard } from "@/components/Skeleton";

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
      <div className="page-container" style={{ maxWidth: 800 }}>
        <h1 className="page-title">Управление категориями</h1>

        <div style={{
          background: "var(--color-surface)",
          padding: 24,
          borderRadius: "var(--radius-lg)",
          marginBottom: 32,
          border: "1px solid var(--color-border)",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
            {editingId ? "Редактировать категорию" : "Создать категорию"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Название категории *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                padding: "10px 12px",
                border: "2px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 15,
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                outline: "none",
              }}
            />
            <textarea
              placeholder="Описание (необязательно)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                padding: "10px 12px",
                border: "2px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: 15,
                minHeight: 60,
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                outline: "none",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}>
                {editingId ? "Сохранить" : "Создать"}
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
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 20px",
            borderBottom: "2px solid var(--color-border)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}>
            Список категорий
          </div>
          {categories.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
              Категории не найдены
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--color-border)",
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
                  <Button variant="ghost" size="sm" onClick={() => startEdit(category)}>Редактировать</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(category.id)}>Удалить</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
