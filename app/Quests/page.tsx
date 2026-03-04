"use client";

import { useEffect, useState } from "react";
import { Quest, Category } from "@/Entities/Quest";
import { fetchQuests, searchQuests } from "@/services/questsService";
import { fetchCategories } from "@/services/categoriesService";
import { QuestCard } from "@/components/QuestCard";
import styles from "./QuestsPage.module.css";
import { useRouter } from "next/navigation";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const router = useRouter();

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
    if (searchTerm || selectedCategoryId) {
      const timeoutId = setTimeout(() => {
        searchQuests(searchTerm || undefined, selectedCategoryId || undefined)
          .then(setQuests)
          .catch(() => setError("Ошибка поиска"));
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchQuests()
        .then(setQuests)
        .catch(() => setError("Не удалось загрузить квесты"));
    }
  }, [searchTerm, selectedCategoryId]);

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
      </div>

      <div className={styles.grid}>
        {quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}

        <div className={styles.addCard} onClick={() => router.push("/Quests/CreateQuest")}>
          <div className={styles.plus}>+</div>
          <div className={styles.addText}>Добавить квест</div>
        </div>
      </div>
    </div>
  );
}
