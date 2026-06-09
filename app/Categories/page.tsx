"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from "@/services/categoriesService";
import { useToast } from "@/components/Toast";
import RoleGuard from "@/components/RoleGuard";
import { getStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { SkeletonCard } from "@/components/Skeleton";
import { PageSun, PageCloud, PageSparkle, PageStars, PageTree, PageHouse, PageSmiley, PageFlower } from "@/components/PageDoodles";
import { ZigzagDivider, PaintedDots } from "@/app/(landing)/components/Decorations";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();

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
      toast("Ошибка создания категории", "error");
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
      toast("Ошибка обновления категории", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      toast("Ошибка удаления категории", "error");
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
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, var(--color-sky-light), var(--color-peach))",
          zIndex: 0
        }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", zIndex: 0 }}>
          <PaintedDots style={{ position: "absolute", top: "5%", right: "2%", width: 180, height: 180, opacity: 0.2 }} />
        </div>
        
        <PageSun
          style={{ position: "fixed", top: "3%", right: "6%", width: 70, height: 70, opacity: 0.4, zIndex: 1 }}
          className="animate-float-slow"
        />
        <PageCloud
          style={{ position: "fixed", top: "10%", left: "5%", width: 100, height: 50, opacity: 0.3, zIndex: 1 }}
          className="animate-drift"
        />
        <PageSparkle
          style={{ position: "fixed", top: "20%", right: "15%", width: 35, height: 35, opacity: 0.3, zIndex: 1 }}
          className="animate-sparkle"
        />
        <PageTree
          style={{ position: "fixed", bottom: "15%", left: "3%", width: 70, height: 100, opacity: 0.25, zIndex: 1 }}
          className="animate-wobble"
        />
        <PageHouse
          style={{ position: "fixed", bottom: "20%", right: "8%", width: 70, height: 70, opacity: 0.2, zIndex: 1 }}
        />
        <PageSmiley
          style={{ position: "fixed", top: "40%", left: "45%", width: 50, height: 50, opacity: 0.15, zIndex: 1 }}
          className="animate-bounceSoft"
        />
        <PageFlower
          style={{ position: "fixed", bottom: "35%", right: "25%", width: 50, height: 50, opacity: 0.2, zIndex: 1 }}
          className="animate-wiggle"
        />
        <PageStars
          style={{ position: "fixed", top: "60%", left: "70%", width: 100, height: 15, opacity: 0.2, zIndex: 1 }}
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
