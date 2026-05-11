"use client";

import { useEffect, useState } from "react";
import { Quest, Category } from "@/Entities/Quest";
import { fetchQuests, searchQuests, fetchQuestsByStatus, fetchQuestsByAuthor, fetchLatestQuests } from "@/services/questsService";
import { fetchCategories } from "@/services/categoriesService";
import { QuestCard } from "@/components/QuestCard";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { getStoredRole } from "@/utils/auth";
import Button from "@/components/Button";
import { SkeletonCard } from "@/components/Skeleton";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [mode, setMode] = useState<"public" | "private">("public");
  const router = useRouter();

  const loadQuests = () => {
    if (mode === "private") {
      fetchQuestsByAuthor()
        .then((data) => {
          let filtered = data;
          if (searchTerm) filtered = filtered.filter((q) => q.title.toLowerCase().includes(searchTerm.toLowerCase()));
          if (selectedCategoryId) filtered = filtered.filter((q) => q.categoryId === selectedCategoryId);
          setQuests(filtered);
        })
        .catch(() => setError("Не удалось загрузить ваши квесты"));
      return;
    }

    if (selectedStatus) {
      fetchQuestsByStatus(selectedStatus)
        .then((data) => {
          let filtered = data;
          if (searchTerm) filtered = filtered.filter((q) => q.title.toLowerCase().includes(searchTerm.toLowerCase()));
          if (selectedCategoryId) filtered = filtered.filter((q) => q.categoryId === selectedCategoryId);
          setQuests(filtered);
        })
        .catch(() => setError("Не удалось загрузить квесты по статусу"));
    } else if (searchTerm || selectedCategoryId) {
      searchQuests(searchTerm || undefined, selectedCategoryId || undefined)
        .then(setQuests)
        .catch(() => setError("Ошибка поиска"));
    } else {
      fetchQuests()
        .then(setQuests)
        .catch(() => setError("Не удалось загрузить квесты"));
    }
  };

  useEffect(() => {
    Promise.all([fetchQuests(), fetchCategories()])
      .then(([questsData, categoriesData]) => {
        setQuests(questsData);
        setCategories(categoriesData);
      })
      .catch(() => setError("Не удалось загрузить данные"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleQuestChanged = () => loadQuests();
    window.addEventListener("signalr:QuestCreated", handleQuestChanged);
    window.addEventListener("signalr:QuestUpdated", handleQuestChanged);
    window.addEventListener("signalr:QuestDeleted", handleQuestChanged);
    return () => {
      window.removeEventListener("signalr:QuestCreated", handleQuestChanged);
      window.removeEventListener("signalr:QuestUpdated", handleQuestChanged);
      window.removeEventListener("signalr:QuestDeleted", handleQuestChanged);
    };
  }, [searchTerm, selectedCategoryId, selectedStatus]);

  useEffect(() => {
    if (!loading) loadQuests();
  }, [mode, searchTerm, selectedCategoryId, selectedStatus]);

  const role = getStoredRole();
  const canCreate = role === "Teacher" || role === "Admin";

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Квесты</h1>
        {canCreate && (
          <Button variant="primary" onClick={() => router.push("/Quests/CreateQuest")}>
            + Создать квест
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 0, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <button
            onClick={() => setMode("public")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: mode === "public" ? "var(--color-primary)" : "transparent",
              color: mode === "public" ? "white" : "var(--color-text-secondary)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Общий каталог
          </button>
          <button
            onClick={() => setMode("private")}
            style={{
              padding: "8px 16px",
              border: "none",
              background: mode === "private" ? "var(--color-primary)" : "transparent",
              color: mode === "private" ? "white" : "var(--color-text-secondary)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            Мои квесты
          </button>
        </div>

        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            minWidth: 200,
            flex: 1,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
          }}
        />
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            minWidth: 150,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
          }}
        >
          <option value="">Все категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: 14,
            minWidth: 150,
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
          }}
        >
          <option value="">Все статусы</option>
          <option value="Draft">Черновик</option>
          <option value="Published">Опубликован</option>
          <option value="Archive">Архив</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-error)" }}>
          <p>{error}</p>
          <Button variant="secondary" onClick={loadQuests}>Повторить</Button>
        </div>
      ) : quests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--color-text-secondary)" }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Квесты не найдены</p>
          {canCreate && (
            <Button variant="primary" onClick={() => router.push("/Quests/CreateQuest")}>
              Создать первый квест
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onDelete={() => loadQuests()} />
          ))}
        </div>
      )}
    </div>
  );
}
