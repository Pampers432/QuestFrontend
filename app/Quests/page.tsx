"use client";

import { useEffect, useState } from "react";
import { Quest, Category } from "@/Entities/Quest";
import { fetchQuests, searchQuests, fetchQuestsByStatus } from "@/services/questsService";
import { fetchCategories } from "@/services/categoriesService";
import { QuestCard } from "@/components/QuestCard";
import styles from "./QuestsPage.module.css";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { getStoredRole } from "@/utils/auth";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const router = useRouter();

  const loadQuests = () => {
    if (selectedStatus) {
      fetchQuestsByStatus(selectedStatus)
        .then((data) => {
          let filtered = data;
          if (searchTerm) {
            filtered = filtered.filter(q =>
              q.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          if (selectedCategoryId) {
            filtered = filtered.filter(q => q.categoryId === selectedCategoryId);
          }
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
    const handleQuestChanged = () => {
      loadQuests();
    };

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
    if (!loading) {
      loadQuests();
    }
  }, [searchTerm, selectedCategoryId, selectedStatus]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Все квесты</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "14px",
            minWidth: "200px",
            flex: 1
          }}
        />
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "14px",
            minWidth: "150px"
          }}
        >
          <option value="">Все категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "14px",
            minWidth: "150px"
          }}
        >
          <option value="">Все статусы</option>
          <option value="Draft">Черновик</option>
          <option value="Published">Опубликован</option>
          <option value="Archive">Архив</option>
        </select>
      </div>

      <div className={styles.grid}>
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} onDelete={() => loadQuests()} />
        ))}

        {(() => {
          const role = getStoredRole();
          return (role === "Teacher" || role === "Admin") && (
            <div className={styles.addCard} onClick={() => router.push("/Quests/CreateQuest")}>
              <div className={styles.plus}>+</div>
              <div className={styles.addText}>Добавить квест</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
