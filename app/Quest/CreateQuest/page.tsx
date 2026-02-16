"use client";

import { useEffect, useState } from "react";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export default function CreateQuest() {
  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [questions, setQuestions] = useState<{ [key: string]: string }>({});
  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "Easy",
    status: "Draft"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
  if (!template) return;

  const request = {
    title: questData.title,
    description: questData.description,
    subject: questData.subject,
    difficulty: questData.difficulty,
    status: questData.status,
    rooms: [
      {
        roomTemplateId: template.id,
        title: template.name,
        orderIndex: 0,
        questions: template.sceneData
          .filter(z => z.name.toLowerCase() !== "door")
          .map((zone, index) => ({
            text: questions[zone.name],
            type: "Text",
            points: 1,
            hint: null,
            orderIndex: index,
            answerOptions: [] // пока без вариантов
          }))
      }
    ]
  };

  const response = await fetch("https://localhost:7240/api/quests/CreateQuest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const result = await response.json();
  console.log(result);
};

  // ============================
  // Загружаем template из localStorage
  // ============================
  useEffect(() => {
    const saved = localStorage.getItem("selectedTemplate");

    if (saved) {
      const parsed = JSON.parse(saved) as RoomTemplate;
      setTemplate(parsed);

      // создаём пустые поля для вопросов
      const initial: any = {};
      parsed.sceneData.forEach((z) => {
        if (z.name.toLowerCase() !== "door") {
          initial[z.name] = "";
        }
      });

      setQuestions(initial);
    }
  }, []);

  if (!template) {
    return <div style={{ padding: 30 }}>Шаблон не найден</div>;
  }

  // ============================
  // UI
  // ============================

  return (
    <div style={{ padding: 30 }}>
      <h1>Создание квеста</h1>

      <h2>Шаблон: {template.name}</h2>

      <div style={{ display: "flex", gap: 40 }}>

  {/* Левая часть — комната */}
  <div
    style={{
      position: "relative",
      display: "inline-block",
      border: "1px solid #ccc",
      borderRadius: 8
    }}
  >
    <img
      src={`https://localhost:7240${template.previewImageUrl}`}
      alt="preview"
      style={{
        width: "600px",
        borderRadius: 8,
        display: "block"
      }}
    />
  </div>

  {/* Правая часть — форма квеста */}
  <div
    style={{
      minWidth: 350,
      display: "flex",
      flexDirection: "column",
      gap: 15,
      padding: 20,
      border: "1px solid #ddd",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}
  >
    <h2>Создание квеста</h2>

    <input
      name="title"
      placeholder="Название квеста"
      value={questData.title}
      onChange={handleChange}
      style={{ padding: 8 }}
    />

    <textarea
      name="description"
      placeholder="Описание"
      value={questData.description}
      onChange={handleChange}
      rows={4}
      style={{ padding: 8 }}
    />

    <input
      name="subject"
      placeholder="Предмет"
      value={questData.subject}
      onChange={handleChange}
      style={{ padding: 8 }}
    />

    <select
      name="difficulty"
      value={questData.difficulty}
      onChange={handleChange}
      style={{ padding: 8 }}
    >
      <option value="Easy">Лёгкий</option>
      <option value="Medium">Средний</option>
      <option value="Hard">Сложный</option>
    </select>

    <select
      name="status"
      value={questData.status}
      onChange={handleChange}
      style={{ padding: 8 }}
    >
      <option value="Draft">Черновик</option>
      <option value="Published">Опубликован</option>
      <option value="Archived">Архив</option>
    </select>

    <button
      style={{
        padding: 10,
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer"
      }}
      onClick={handleSubmit}
    >
      Создать квест
    </button>
  </div>

</div>


      <h3>Вопросы по зонам</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {template.sceneData
          .filter((z) => z.name.toLowerCase() !== "door")
          .map((zone) => (
            <div
              key={zone.name}
              style={{
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "#fafafa"
              }}
            >
              <b>Зона: {zone.name}</b>

              <textarea
                placeholder="Введите текст вопроса"
                value={questions[zone.name]}
                onChange={(e) =>
                  setQuestions((prev) => ({
                    ...prev,
                    [zone.name]: e.target.value
                  }))
                }
                style={{
                  width: "100%",
                  height: 80,
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  resize: "none"
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
