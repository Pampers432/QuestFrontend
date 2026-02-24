"use client";

import { use, useEffect, useState } from "react";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [session, setSession] = useState<any>(null);
  const [quest, setQuest] = useState<any>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("activeSession");
    const savedQuest = localStorage.getItem("selectedQuest");

    if (!savedSession || !savedQuest) return;

    setSession(JSON.parse(savedSession));
    setQuest(JSON.parse(savedQuest));
  }, [id]);

  if (!session || !quest) return <div>Загрузка...</div>;

  const room = quest.questRooms[0];

  // сортируем вопросы по orderIndex
  const sortedQuestions = [...room.questions].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Результаты прохождения</h1>

      <div
        style={{
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "10px",
          marginBottom: "30px"
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>{quest.title}</h2>

        <p><strong>Статус:</strong> Завершено</p>
        <p><strong>Очки:</strong> {session.score}</p>
        <p><strong>Начато:</strong> {new Date(session.startsAt).toLocaleString()}</p>
        <p><strong>Завершено:</strong> {new Date().toLocaleString()}</p>
      </div>

      <h2 style={{ marginBottom: "20px" }}>Ответы</h2>

      {sortedQuestions.map((q: any, index: number) => {
        const answer = session.attempts.find((a: any) => a.questionId === q.id);

        return (
          <div
            key={q.id}
            style={{
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              marginBottom: "20px",
              background: answer?.isCorrect ? "#e6ffe6" : "#ffe6e6"
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              {index + 1}. {q.text}
            </h3>

            <div style={{ marginBottom: "10px" }}>
              <strong>Ваш ответ:</strong>{" "}
              {answer
                ? q.answerOptions.find((o: any) => o.id === JSON.parse(answer.answerData).selected_options[0])?.text
                : "Нет ответа"}
            </div>

            <div>
              <strong>Правильный ответ:</strong>{" "}
              {q.answerOptions.find((o: any) => o.isCorrect)?.text}
            </div>

            <div style={{ marginTop: "10px" }}>
              <strong>Очки:</strong> {answer?.pointsAwarded ?? 0}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => (window.location.href = "/")}
        style={{
          marginTop: "30px",
          padding: "12px 20px",
          fontSize: "16px",
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        На главную
      </button>
    </div>
  );
}
