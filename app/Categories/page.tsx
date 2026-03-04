"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from "@/services/categoriesService";
import RoleGuard from "@/components/RoleGuard";
import { getStoredRole } from "@/utils/auth";

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
    if (!formData.name.trim()) {
      alert("Введите название категории");
      return;
    }

    try {
      await createCategory(formData);
      setFormData({ name: "", description: "" });
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка создания категории");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) {
      alert("Введите название категории");
      return;
    }

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
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      alert("Ошибка удаления категории");
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || "" });
  };

  if (loading) return <div style={{ padding: 24 }}>Загрузка...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "20px" }}>Управление категориями</h1>

        <div style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px"
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "15px" }}>
            {editingId ? "Редактировать категорию" : "Создать категорию"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input
              type="text"
              placeholder="Название категории *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px" }}
            />
            <textarea
              placeholder="Описание (необязательно)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", minHeight: "60px" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                style={{
                  padding: "8px 16px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                {editingId ? "Сохранить" : "Создать"}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", description: "" });
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Отмена
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "10px",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "15px",
            background: "#f8f9fa",
            borderBottom: "2px solid #ddd",
            fontWeight: "bold"
          }}>
            Список категорий
          </div>
          {categories.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
              Категории не найдены
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>{category.name}</div>
                  {category.description && (
                    <div style={{ color: "#666", fontSize: "14px", marginTop: "5px" }}>
                      {category.description}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => startEdit(category)}
                    style={{
                      padding: "6px 12px",
                      background: "#ffc107",
                      color: "#000",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    style={{
                      padding: "6px 12px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}

