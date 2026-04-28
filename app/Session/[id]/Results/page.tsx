"use client";

import { use, useEffect, useState } from "react";

const STATIC_BASE = "http://localhost:7240";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [session, setSession] = useState<any>(null);
  const [quest, setQuest] = useState<any>(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  useEffect(() => {
    const savedSession = localStorage.getItem("activeSession");
    const savedQuest = localStorage.getItem("selectedQuest");

    if (!savedSession || !savedQuest) return;

    setSession(JSON.parse(savedSession));
    setQuest(JSON.parse(savedQuest));
  }, [id]);

  if (!session || !quest) return <div>Загрузка...</div>;

  // Сортируем комнаты по orderIndex
  const sortedRooms = [...quest.questRooms].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const currentRoom = sortedRooms[selectedRoomIndex];

  // Сортируем вопросы текущей комнаты по orderIndex
  const sortedQuestions = [...(currentRoom?.questions || [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  // Функция для безопасного получения текста ответа
  const getAnswerText = (question: any, answer: any) => {
    if (!answer) return "Нет ответа";
    
    try {
      if (!answer.answerData) return "Нет данных ответа";
      
      let answerData = answer.answerData;
      if (typeof answerData === 'string') {
        answerData = JSON.parse(answerData);
      }
      
      const selectedOptionId = answerData?.selected_options?.[0];
      if (!selectedOptionId) return "Не выбран вариант";
      
      const option = question.answerOptions?.find((o: any) => o.id === selectedOptionId);
      return option?.text || "Неизвестный вариант";
      
    } catch (e) {
      console.error("Ошибка парсинга ответа:", e);
      return "Ошибка формата ответа";
    }
  };

  // Подсчет статистики
  const totalQuestions = quest.questRooms.reduce((acc: number, room: any) => 
    acc + (room.questions?.length || 0), 0
  );
  
  const answeredQuestions = session.attempts?.length || 0;
  const correctAnswers = session.attempts?.filter((a: any) => a.isCorrect).length || 0;
  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100) || 0;

  return (
    <div style={{ 
      padding: "40px 20px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Заголовок */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px"
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "32px", 
          fontWeight: "600",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Результаты прохождения
        </h1>
        
        <div style={{
          padding: "8px 16px",
          background: "#f0f0f0",
          borderRadius: "20px",
          fontSize: "14px",
          color: "#666"
        }}>
          ID: {id.slice(0, 8)}...
        </div>
      </div>

      {/* Основная информация о квесте */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px",
        padding: "30px",
        color: "white",
        marginBottom: "30px",
        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
      }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>{quest.title}</h2>
        {quest.description && (
          <p style={{ margin: "0 0 20px 0", opacity: 0.9 }}>{quest.description}</p>
        )}
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px"
        }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Предмет</div>
            <div style={{ fontSize: "18px", fontWeight: "600" }}>{quest.subject || "Не указан"}</div>
          </div>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Сложность</div>
            <div style={{ fontSize: "18px", fontWeight: "600" }}>
              {quest.difficulty === "Easy" && "🟢 Легкий"}
              {quest.difficulty === "Medium" && "🟡 Средний"}
              {quest.difficulty === "Hard" && "🔴 Сложный"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Автор</div>
            <div style={{ fontSize: "18px", fontWeight: "600" }}>{quest.author?.username || "Неизвестен"}</div>
          </div>
        </div>
      </div>

      {/* Статистика прохождения */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div style={{
          background: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          border: "1px solid #f0f0f0"
        }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Всего баллов</div>
          <div style={{ fontSize: "36px", fontWeight: "700", color: "#667eea" }}>{session.score}</div>
          <div style={{ fontSize: "14px", color: "#999" }}>из {totalQuestions * 10} максимальных</div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          border: "1px solid #f0f0f0"
        }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Правильных ответов</div>
          <div style={{ fontSize: "36px", fontWeight: "700", color: "#48bb78" }}>{correctAnswers}</div>
          <div style={{ fontSize: "14px", color: "#999" }}>из {answeredQuestions}</div>
        </div>

        <div style={{
          background: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          border: "1px solid #f0f0f0"
        }}>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>Прогресс</div>
          <div style={{ fontSize: "36px", fontWeight: "700", color: "#f6ad55" }}>{completionPercentage}%</div>
          <div style={{ fontSize: "14px", color: "#999" }}>{answeredQuestions} из {totalQuestions} вопросов</div>
        </div>
      </div>

      {/* Вкладки комнат */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        overflowX: "auto",
        padding: "5px",
        scrollbarWidth: "thin"
      }}>
        {sortedRooms.map((room: any, index: number) => {
          const roomQuestions = room.questions?.length || 0;
          const answeredInRoom = session.attempts?.filter((a: any) => 
            room.questions?.some((q: any) => q.id === a.questionId)
          ).length || 0;
          
          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoomIndex(index)}
              style={{
                padding: "12px 24px",
                background: index === selectedRoomIndex ? "#667eea" : "white",
                color: index === selectedRoomIndex ? "white" : "#333",
                border: index === selectedRoomIndex ? "none" : "1px solid #e0e0e0",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                boxShadow: index === selectedRoomIndex ? "0 5px 15px rgba(102, 126, 234, 0.3)" : "none"
              }}
            >
              {room.title || `Комната ${index + 1}`} ({answeredInRoom}/{roomQuestions})
            </button>
          );
        })}
      </div>

      {/* Информация о текущей комнате */}
      {currentRoom && (
        <div style={{
          background: "#f8f9fa",
          borderRadius: "15px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img
              src={`${STATIC_BASE}${currentRoom.roomTemplate.previewImageUrl}`}
              alt={currentRoom.title}
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "10px",
                objectFit: "cover"
              }}
            />
            <div>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
                {currentRoom.title || currentRoom.roomTemplate.name}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>
                Вопросов в комнате: {currentRoom.questions?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Список ответов */}
      <h2 style={{ 
        fontSize: "24px", 
        fontWeight: "600", 
        margin: "30px 0 20px 0",
        color: "#333"
      }}>
        Детали ответов
      </h2>

      {sortedQuestions.length === 0 ? (
        <div style={{
          padding: "60px",
          textAlign: "center",
          background: "#f8f9fa",
          borderRadius: "15px",
          color: "#999"
        }}>
          В этой комнате нет вопросов
        </div>
      ) : (
        sortedQuestions.map((q: any, index: number) => {
          const answer = session.attempts?.find((a: any) => a.questionId === q.id);

          return (
            <div
              key={q.id}
              style={{
                padding: "25px",
                border: "1px solid #e0e0e0",
                borderRadius: "15px",
                marginBottom: "15px",
                background: "white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                transition: "transform 0.2s, box-shadow 0.2s",
                borderLeft: `5px solid ${answer?.isCorrect ? "#48bb78" : "#f56565"}`,
                cursor: "pointer",
                // ":hover": {
                //   transform: "translateY(-2px)",
                //   boxShadow: "0 5px 20px rgba(0,0,0,0.05)"
                // }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <h3 style={{ 
                  margin: "0 0 15px 0", 
                  fontSize: "18px", 
                  fontWeight: "600",
                  color: "#333"
                }}>
                  {index + 1}. {q.text}
                </h3>
                
                <div style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  background: answer?.isCorrect ? "#c6f6d5" : "#fed7d7",
                  color: answer?.isCorrect ? "#22543d" : "#742a2a"
                }}>
                  {answer?.isCorrect ? "+" : "-"} {answer?.pointsAwarded || 0} баллов
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "15px",
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "10px"
              }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#999", marginBottom: "5px" }}>Ваш ответ</div>
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: "500",
                    color: answer?.isCorrect ? "#22543d" : "#742a2a"
                  }}>
                    {getAnswerText(q, answer)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#999", marginBottom: "5px" }}>Правильный ответ</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#22543d" }}>
                    {q.answerOptions?.find((o: any) => o.isCorrect)?.text || "Не указан"}
                  </div>
                </div>
              </div>

              {q.hint && (
                <div style={{
                  padding: "10px",
                  background: "#fffbeb",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#975a16"
                }}>
                  <strong>Подсказка:</strong> {q.hint}
                </div>
              )}

              <div style={{
                marginTop: "10px",
                fontSize: "13px",
                color: "#999"
              }}>
                {answer && new Date(answer.answeredAt).toLocaleString()}
              </div>
            </div>
          );
        })
      )}

      {/* Кнопки действий */}
      <div style={{
        display: "flex",
        gap: "15px",
        marginTop: "40px",
        justifyContent: "center"
      }}>
        <button
          onClick={() => window.location.href = "/"}
          style={{
            padding: "15px 40px",
            fontSize: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "transform 0.2s",
            boxShadow: "0 5px 20px rgba(102, 126, 234, 0.3)"
          }}
        >
          На главную
        </button>

        <button
          onClick={() => window.print()}
          style={{
            padding: "15px 40px",
            fontSize: "16px",
            background: "white",
            color: "#667eea",
            border: "2px solid #667eea",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "transform 0.2s"
          }}
        >
          Сохранить результаты
        </button>
      </div>
    </div>
  );
}