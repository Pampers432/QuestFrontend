"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { PageSun, PageCloud, PageSmiley, PageStars } from "@/components/PageDoodles";
import { getImageUrl } from "@/utils/imageUrl";

const STATIC_BASE = "http://localhost:7240";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

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

  if (!session || !quest) return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--color-text-secondary)", gap: 12 }}>
      <span style={{ fontSize: 32 }}>⏳</span> Загрузка...
    </div>
  );

  const sortedRooms = [...quest.questRooms].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const currentRoom = sortedRooms[selectedRoomIndex];

  const sortedQuestions = [...(currentRoom?.questions || [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const getAnswerText = (question: any, answer: any) => {
    if (!answer) return "Нет ответа";
    
    try {
      if (!answer.answerData) return "Нет данных ответа";
      
      let answerData = answer.answerData;
      if (typeof answerData === 'string') {
        answerData = JSON.parse(answerData);
      }
      
      if (question.type === "text_input" || question.type === "number_input") {
        return answerData?.text_answer || "Нет ответа";
      }
      
      if (question.type === "single_choice") {
        const selectedOptionId = answerData?.selected_options?.[0];
        if (!selectedOptionId) return "Не выбран вариант";
        const option = question.answerOptions?.find((o: any) => o.id === selectedOptionId);
        return option?.text || "Неизвестный вариант";
      }
      
      if (question.type === "multiple_choice") {
        const selectedIds = answerData?.selected_options || [];
        if (selectedIds.length === 0) return "Не выбраны варианты";
        const texts = selectedIds.map((id: string) => {
          const opt = question.answerOptions?.find((o: any) => o.id === id);
          return opt?.text || "Неизвестный вариант";
        });
        return texts.join(", ");
      }
      
      return "Неизвестный тип вопроса";

    } catch (e) {
      console.error("Ошибка парсинга ответа:", e);
      return "Ошибка формата ответа";
    }
  };

  const totalQuestions = quest.questRooms.reduce((acc: number, room: any) => 
    acc + (room.questions?.length || 0), 0
  );
  
  const answeredQuestions = session.attempts?.length || 0;
  const correctAnswers = session.attempts?.filter((a: any) => a.isCorrect).length || 0;
  const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100) || 0;

  const getScoreEmoji = () => {
    if (completionPercentage >= 80) return "🌟";
    if (completionPercentage >= 50) return "👍";
    return "💪";
  };

  const getScoreColor = () => {
    if (completionPercentage >= 80) return "var(--color-success)";
    if (completionPercentage >= 50) return "var(--color-orange)";
    return "var(--color-error)";
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", position: "relative" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "6%", width: 80, height: 80, opacity: 0.35, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageCloud
        style={{ position: "fixed", top: "8%", left: "3%", width: 100, height: 50, opacity: 0.3, zIndex: 0 }}
        className="animate-drift"
      />
      <PageSmiley
        style={{ position: "fixed", bottom: "5%", right: "8%", width: 50, height: 50, opacity: 0.2, zIndex: 0 }}
        className="animate-wobble"
      />
      <PageStars
        style={{ position: "fixed", top: "15%", left: "30%", width: 160, height: 25, opacity: 0.2, zIndex: 0 }}
      />

      <div style={{ 
        padding: "40px 20px", 
        maxWidth: "1200px", 
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: "32px", 
            fontWeight: 800,
            background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {getScoreEmoji()} Результаты прохождения
          </h1>
          
          <div style={{
            padding: "8px 16px",
            background: "rgba(255,255,255,0.7)",
            borderRadius: "9999px",
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            border: "1px solid rgba(255,107,53,0.1)",
          }}>
            ID: {id.slice(0, 8)}...
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #2a5298 100%)",
          borderRadius: "24px",
          padding: "32px",
          color: "white",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(30,58,95,0.3)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(255,107,53,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(69,183,209,0.15) 0%, transparent 50%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
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
                <div style={{ fontSize: "14px", opacity: 0.8 }}>📚 Предмет</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>{quest.subject || "Не указан"}</div>
              </div>
              <div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>📊 Сложность</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  {quest.difficulty === "Easy" && "🟢 Легкий"}
                  {quest.difficulty === "Medium" && "🟡 Средний"}
                  {quest.difficulty === "Hard" && "🔴 Сложный"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>👤 Автор</div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>{quest.author?.username || "Неизвестен"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            border: "2px solid rgba(255,107,53,0.08)",
          }}>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "5px" }}>⭐ Всего баллов</div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--color-orange)" }}>{session.score}</div>
            <div style={{ fontSize: "14px", color: "#999" }}>из {totalQuestions * 10} максимальных</div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            border: "2px solid rgba(0,184,148,0.08)",
          }}>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "5px" }}>✅ Правильных ответов</div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--color-success)" }}>{correctAnswers}</div>
            <div style={{ fontSize: "14px", color: "#999" }}>из {answeredQuestions}</div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            border: "2px solid rgba(255,107,53,0.08)",
          }}>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "5px" }}>📈 Прогресс</div>
            <div style={{ fontSize: "36px", fontWeight: 800, color: getScoreColor() }}>{completionPercentage}%</div>
            <div style={{ fontSize: "14px", color: "#999" }}>{answeredQuestions} из {totalQuestions} вопросов</div>
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          overflowX: "auto",
          padding: "5px",
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
                  background: index === selectedRoomIndex ? "linear-gradient(135deg, var(--color-orange), var(--color-accent))" : "rgba(255,255,255,0.7)",
                  color: index === selectedRoomIndex ? "white" : "var(--color-text-secondary)",
                  border: index === selectedRoomIndex ? "none" : "2px solid rgba(255,107,53,0.1)",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  boxShadow: index === selectedRoomIndex ? "0 5px 15px rgba(255,107,53,0.3)" : "none",
                }}
              >
                {room.title || `Комната ${index + 1}`} ({answeredInRoom}/{roomQuestions})
              </button>
            );
          })}
        </div>

        {currentRoom && (
          <div style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid rgba(255,107,53,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <img
                src={getImageUrl(currentRoom.roomTemplate.previewImageUrl)}
                alt={currentRoom.title}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "12px",
                  objectFit: "cover"
                }}
              />
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "20px" }}>
                  {currentRoom.title || currentRoom.roomTemplate.name}
                </h3>
                <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                  Вопросов в комнате: {currentRoom.questions?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 style={{ 
          fontSize: "24px", 
          fontWeight: 700, 
          margin: "30px 0 20px 0",
          background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          📋 Детали ответов
        </h2>

        {sortedQuestions.length === 0 ? (
          <div style={{
            padding: "60px",
            textAlign: "center",
            background: "rgba(255,255,255,0.7)",
            borderRadius: "20px",
            color: "var(--color-text-secondary)",
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
                  padding: "24px",
                  border: "2px solid",
                  borderColor: answer?.isCorrect ? "rgba(0,184,148,0.2)" : "rgba(225,112,85,0.2)",
                  borderRadius: "20px",
                  marginBottom: "15px",
                  background: answer?.isCorrect ? "rgba(0,184,148,0.05)" : "rgba(225,112,85,0.05)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  borderLeft: `5px solid ${answer?.isCorrect ? "var(--color-success)" : "var(--color-error)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <h3 style={{ 
                    margin: "0 0 15px 0", 
                    fontSize: "18px", 
                    fontWeight: 600,
                    color: "var(--color-text-primary)"
                  }}>
                    {index + 1}. {q.text}
                  </h3>
                  
                  <div style={{
                    padding: "4px 14px",
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    background: answer?.isCorrect ? "rgba(0,184,148,0.15)" : "rgba(225,112,85,0.15)",
                    color: answer?.isCorrect ? "var(--color-success)" : "var(--color-error)",
                  }}>
                    {answer?.isCorrect ? "✅" : "❌"} {answer?.pointsAwarded || 0} баллов
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "15px",
                  background: "rgba(255,255,255,0.6)",
                  padding: "16px",
                  borderRadius: "12px",
                }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "5px" }}>Ваш ответ</div>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: 500,
                      color: answer?.isCorrect ? "var(--color-success)" : "var(--color-error)"
                    }}>
                      {getAnswerText(q, answer)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "5px" }}>Правильный ответ</div>
                    <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--color-success)" }}>
                      {q.answerOptions?.find((o: any) => o.isCorrect)?.text || "Не указан"}
                    </div>
                  </div>
                </div>

                {q.hint && (
                  <div style={{
                    padding: "10px 16px",
                    background: "rgba(255,234,167,0.3)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#975a16",
                    border: "1px solid rgba(255,234,167,0.5)",
                  }}>
                    💡 <strong>Подсказка:</strong> {q.hint}
                  </div>
                )}

                <div style={{
                  marginTop: "10px",
                  fontSize: "13px",
                  color: "var(--color-text-secondary)",
                }}>
                  🕐 {answer && new Date(answer.answeredAt).toLocaleString()}
                </div>
              </div>
            );
          })
        )}

        <div style={{
          display: "flex",
          gap: "15px",
          marginTop: "40px",
          justifyContent: "center"
        }}>
          <Button variant="primary" onClick={() => router.push("/")}>
            🏠 На главную
          </Button>

          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Сохранить результаты
          </Button>
        </div>
      </div>

      <div style={{
        position: "fixed", bottom: "5%", left: "5%", zIndex: 0,
        opacity: 0.15, fontSize: "100px",
      }}>
        {getScoreEmoji()}
      </div>
    </div>
  );
}
