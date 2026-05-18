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
import { PageSun, PageCloud, PageSparkle, PageStars } from "@/components/PageDoodles";

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
    <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "6%", width: 70, height: 70, opacity: 0.3, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "8%", left: "3%", width: 90, height: 45, opacity: 0.25, zIndex: 0 }}
        className="animate-drift"
      />
      <PageSparkle
        style={{ position: "fixed", bottom: "10%", right: "5%", width: 30, height: 30, opacity: 0.2, zIndex: 0 }}
        className="animate-sparkle"
      />
      <PageStars
        style={{ position: "fixed", top: "12%", left: "40%", width: 140, height: 22, opacity: 0.15, zIndex: 0 }}
      />

      <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 className="page-title" style={{ margin: 0, background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🎮 Квесты
          </h1>
          {canCreate && (
            <Button variant="primary" onClick={() => router.push("/Quests/CreateQuest")}>
              + Создать квест
            </Button>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant={mode === "public" ? "primary" : "ghost"} size="sm" onClick={() => setMode("public")}>
              🌍 Общий каталог
            </Button>
            <Button variant={mode === "private" ? "primary" : "ghost"} size="sm" onClick={() => setMode("private")}>
              🔒 Мои квесты
            </Button>
          </div>

          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#999", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px 8px 36px",
                border: "2px solid var(--color-border)",
                borderRadius: "9999px",
                fontSize: 14,
                width: "100%",
                background: "rgba(255,255,255,0.7)",
                color: "var(--color-text-primary)",
                outline: "none",
                transition: "border-color 0.3s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
              onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
            />
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            style={{
              padding: "8px 16px",
              border: "2px solid var(--color-border)",
              borderRadius: "9999px",
              fontSize: 14,
              minWidth: 150,
              background: "rgba(255,255,255,0.7)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          >
            <option value="">📁 Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "8px 16px",
              border: "2px solid var(--color-border)",
              borderRadius: "9999px",
              fontSize: 14,
              minWidth: 150,
              background: "rgba(255,255,255,0.7)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          >
            <option value="">📊 Все статусы</option>
            <option value="Draft">📝 Черновик</option>
            <option value="Published">✅ Опубликован</option>
            <option value="Archive">📦 Архив</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ flex: "0 0 300px" }}>
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--color-error)" }}>
            <p>{error}</p>
            <Button variant="secondary" onClick={loadQuests}>Повторить</Button>
          </div>
        ) : quests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--color-text-secondary)", background: "rgba(255,255,255,0.7)", borderRadius: 24, backdropFilter: "blur(8px)" }}>
            <p style={{ fontSize: 18, marginBottom: 16 }}>🧭 Квесты не найдены</p>
            {canCreate && (
              <Button variant="primary" onClick={() => router.push("/Quests/CreateQuest")}>
                Создать первый квест
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
            {quests.map((quest) => (
              <div key={quest.id} style={{ flex: "0 0 300px" }}>
                <QuestCard quest={quest} onDelete={() => loadQuests()} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
