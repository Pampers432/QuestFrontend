"use client";

import { use, useEffect, useState, useRef } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

const API_BASE = "http://localhost:7240";
const STATIC_BASE = "http://localhost:7240";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [quest, setQuest] = useState<any>(null);
  const [roomIndex, setRoomIndex] = useState(0);

  const [room, setRoom] = useState<any>(null);
  const [zones, setZones] = useState<QuestionPosition[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  const [doorMessage, setDoorMessage] = useState<string | null>(null);
  const [finishMessage, setFinishMessage] = useState<string | null>(null);

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [numberAnswer, setNumberAnswer] = useState("");
  
  const goToResults = () => {
    setFinishMessage(null);
    window.location.href = `/Session/${activeSession.id}/Results`;
  };

  useEffect(() => {
    const savedQuest = localStorage.getItem("selectedQuest");
    const savedSession = localStorage.getItem("activeSession");

    if (!savedQuest || !savedSession) return;

    const q = JSON.parse(savedQuest);
    const session = JSON.parse(savedSession);

    if (!session.attemptId) {
      startAttempt(session);
    }

    if (!session.attempts) session.attempts = [];
    if (session.score === undefined) session.score = 0;

    setQuest(q);
    setActiveSession(session);

    loadRoom(q, 0);
  }, [id]);

  const startAttempt = async (session: any) => {
    const res = await fetch(`${API_BASE}/api/QuestSessions/StartAttempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.startedBy,
        questSessionId: session.id
      })
    });

    const data = await res.json();
    session.attemptId = data.id;

    localStorage.setItem("activeSession", JSON.stringify(session));
    setActiveSession({ ...session });
  };

  const loadRoom = (questData: any, index: number) => {
    const r = questData.questRooms[index];

    setRoom(r);
    setRoomIndex(index);

    setPreviewUrl(`${STATIC_BASE}${r.roomTemplate.previewImageUrl}`);

    const parsedZones: QuestionPosition[] = JSON.parse(
      r.roomTemplate.sceneData
    );

    setZones(parsedZones);
  };

  const handleImageLoad = () => {
    if (imageRef.current && containerRef.current) {
      const container = containerRef.current;
      const img = imageRef.current;
      
      // Получаем натуральные размеры изображения
      setImageNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      
      // Получаем фактические размеры после загрузки
      setImageSize({
        width: img.clientWidth,
        height: img.clientHeight
      });
    }
  };

  // Отслеживаем изменение размеров контейнера
  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [previewUrl]);

  if (!room || !activeSession || !quest)
    return <div>Загрузка...</div>;

  const handleAnswer = async (option?: any, question?: any, answerValue?: string) => {
    let isCorrect = false;
    let points = 0;

     if (question.type === "text_input" || question.type === "number_input") {
       const correctOption = question.answerOptions?.[0];
       if (correctOption) {
         if (question.type === "text_input") {
           isCorrect = answerValue?.trim().toLowerCase() === correctOption.text?.trim().toLowerCase();
         } else {
           isCorrect = parseFloat(answerValue ?? "") === parseFloat(correctOption.text ?? "");
         }
       }
       points = isCorrect ? question.points ?? 1 : 0;
     } else if (selectedOptions.length > 0) {
      const correctOptions = question.answerOptions?.filter((o: any) => o.isCorrect) || [];
      
      if (question.type === "single_choice") {
        isCorrect = correctOptions.some((o: any) => o.id === selectedOptions[0]);
        points = isCorrect ? question.points ?? 1 : 0;
      } else if (question.type === "multiple_choice") {
        const selectedCorrect = correctOptions.filter((o: any) => 
          selectedOptions.includes(o.id)
        ).length;
        isCorrect = selectedCorrect === correctOptions.length && selectedCorrect === selectedOptions.length;
        points = isCorrect ? question.points ?? 1 : 0;
      }
    } else if (option) {
      isCorrect = option.isCorrect;
      points = isCorrect ? question.points ?? 1 : 0;
    } else {
      return;
    }

    const updatedSession = { ...activeSession };

    const answerData: any = {
      selected_options: selectedOptions
    };
    if (question.type === "text_input" || question.type === "number_input") {
      answerData.text_answer = answerValue;
    }

    updatedSession.attempts.push({
      questionId: question.id,
      isCorrect,
      pointsAwarded: points,
      answeredAt: new Date().toISOString(),
      answerData: JSON.stringify(answerData)
    });

    updatedSession.score += points;

    localStorage.setItem("activeSession", JSON.stringify(updatedSession));
    setActiveSession(updatedSession);

    await fetch(`${API_BASE}/api/QuestSessions/SaveAnswer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: updatedSession.attemptId,
        questionId: question.id,
        answerData: JSON.stringify(answerData),
        isCorrect,
        pointsAwarded: points
      })
    });

    setActiveQuestion(null);
    setSelectedOptions([]);
    setTextAnswer("");
    setNumberAnswer("");
  };

  const handleDoorClick = async () => {
    const now = new Date();
    const startsAt = new Date(activeSession.startsAt);
    const endsAt = new Date(activeSession.endsAt);

    if (!activeSession.isActive) {
      setDoorMessage("Сессия не активна");
      return;
    }

    if (now < startsAt) {
      setDoorMessage("Сессия ещё не началась");
      return;
    }

    if (now > endsAt) {
      setDoorMessage("Время сессии истекло");
      return;
    }

    if (activeSession.timeLimit && activeSession.timeLimit > 0) {
      const minutesPassed = Math.floor(
        (now.getTime() - startsAt.getTime()) / 60000
      );

      if (minutesPassed > activeSession.timeLimit) {
        setDoorMessage("Вы превысили лимит времени");
        return;
      }
    }

    const answeredIds = activeSession.attempts.map((a: any) => a.questionId);
    
    // Filter questions (exclude door zones)
    const validQuestions = room.questions.filter((q: any) => {
      const targetObj = q.targetObject?.toLowerCase();
      return targetObj && targetObj !== "door";
    });
    
    const unanswered = validQuestions.filter(
      (q: any) => !answeredIds.includes(q.id)
    );

    if (!activeSession.allowPartialCompletion && unanswered.length > 0) {
      setDoorMessage("Вы должны ответить на все вопросы");
      return;
    }

    // Переход в следующую комнату
    if (roomIndex + 1 < quest.questRooms.length) {
      loadRoom(quest, roomIndex + 1);
      setDoorMessage("Переход в следующую комнату...");
      return;
    }

    // Завершение
    await fetch(
      `${API_BASE}/api/QuestSessions/FinishAttempt/${activeSession.attemptId}`,
      { method: "POST" }
    );

    goToResults();
  };

  const handleZoneClick = (zoneIndex: number) => {
    const zone = zones[zoneIndex];

    if (zone.name.toLowerCase() === "door") {
      handleDoorClick();
      return;
    }

    // Try to find by targetObject first (new format), fallback to index (old format)
    let question = room.questions.find(
      (q: any) => q.targetObject === zone.name
    );

    // Fallback: for old quests without targetObject, use zoneIndex
    if (!question && room.questions[zoneIndex]) {
      question = room.questions[zoneIndex];
    }

    if (question) {
      setActiveQuestion(question);
      setSelectedOptions([]);
      setTextAnswer("");
      setNumberAnswer("");
    } else {
      setActiveQuestion({
        text: "Для этой зоны нет вопроса",
        answerOptions: []
      });
    }
  };

  // Вычисляем масштаб для зон
  const getZoneStyle = (zone: QuestionPosition) => {
    if (imageSize.width === 0 || imageNaturalSize.width === 0) {
      return {
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h
      };
    }

    const scaleX = imageSize.width / imageNaturalSize.width;
    const scaleY = imageSize.height / imageNaturalSize.height;

    return {
      left: zone.x * scaleX,
      top: zone.y * scaleY,
      width: zone.w * scaleX,
      height: zone.h * scaleY
    };
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: "100vw", 
        height: "auto", 
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000"
      }}
    >
      <div style={{ 
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <img
          ref={imageRef}
          src={previewUrl}
          onLoad={handleImageLoad}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain"
          }}
          draggable={false}
        />

        {/* Зоны */}
        {zones.map((z, i) => {
          const zoneStyle = getZoneStyle(z);
          
          return (
            <div
              key={i}
              onClick={() => handleZoneClick(i)}
              style={{
                position: "absolute",
                cursor: "pointer",
                border: "2px solid",
                borderColor: z.name.toLowerCase() === "door" ? "red" : "#00a000",
                backgroundColor: z.name.toLowerCase() === "door" 
                  ? "rgba(255,0,0,0.15)" 
                  : "rgba(0,255,0,0.15)",
                ...zoneStyle
              }}
            >
              <span style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontWeight: "bold",
                textShadow: "1px 1px 2px black",
                fontSize: "14px"
              }}>
                {z.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Модалка вопроса */}
      {activeQuestion && (
        <Modal onClose={() => { setActiveQuestion(null); setSelectedOptions([]); setTextAnswer(""); setNumberAnswer(""); }}>
          <h2 style={{ marginBottom: 20, fontSize: 24 }}>{activeQuestion.text}</h2>
          
          {/* Тип вопроса: Один вариант ответа (radio) */}
          {activeQuestion.type === "single_choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {activeQuestion.answerOptions?.map((a: any, idx: number) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={a.id}
                    checked={selectedOptions.includes(a.id)}
                    onChange={() => {
                      setSelectedOptions([a.id]);
                      setTimeout(() => {
                        handleAnswer(a, activeQuestion);
                      }, 100);
                    }}
                    style={{ width: 20, height: 20, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 16 }}>{a.text}</span>
                </label>
              ))}
            </div>
          )}

          {/* Тип вопроса: Несколько вариантов ответа (checkbox) */}
          {activeQuestion.type === "multiple_choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {activeQuestion.answerOptions?.map((a: any, idx: number) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 15px",
                    border: "2px solid #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(a.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, a.id]);
                      } else {
                        setSelectedOptions(selectedOptions.filter(id => id !== a.id));
                      }
                    }}
                    style={{ width: 20, height: 20, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 16 }}>{a.text}</span>
                </label>
              ))}
              <button
                onClick={() => handleAnswer(undefined, activeQuestion)}
                disabled={selectedOptions.length === 0}
                style={{
                  marginTop: 10,
                  padding: "12px 20px",
                  background: selectedOptions.length === 0 ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: selectedOptions.length === 0 ? "not-allowed" : "pointer",
                  fontSize: 16
                }}
              >
                Ответить ({selectedOptions.length} выбрано)
              </button>
            </div>
          )}

          {/* Тип вопроса: Текстовый ответ */}
          {activeQuestion.type === "text_input" && (
            <div style={{ marginBottom: 20, width: "100%" }}>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Введите ваш ответ..."
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "2px solid #ddd",
                  borderRadius: 8,
                  minHeight: 100,
                  resize: "vertical",
                  boxSizing: "border-box"
                }}
              />
              <button
                onClick={() => handleAnswer(undefined, activeQuestion, textAnswer)}
                disabled={!textAnswer.trim()}
                style={{
                  marginTop: 10,
                  padding: "12px 20px",
                  background: !textAnswer.trim() ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: !textAnswer.trim() ? "not-allowed" : "pointer",
                  fontSize: 16
                }}
              >
                Ответить
              </button>
            </div>
          )}

          {/* Тип вопроса: Числовой ответ */}
          {activeQuestion.type === "number_input" && (
            <div style={{ marginBottom: 20, width: "100%" }}>
              <input
                type="number"
                value={numberAnswer}
                onChange={(e) => setNumberAnswer(e.target.value)}
                placeholder="Введите число..."
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "2px solid #ddd",
                  borderRadius: 8,
                  marginBottom: 10,
                  boxSizing: "border-box"
                }}
              />
              <button
                onClick={() => handleAnswer(undefined, activeQuestion, numberAnswer)}
                disabled={!numberAnswer.trim()}
                style={{
                  padding: "12px 20px",
                  background: !numberAnswer.trim() ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: !numberAnswer.trim() ? "not-allowed" : "pointer",
                  fontSize: 16
                }}
              >
                Ответить
              </button>
            </div>
          )}

          {/* Fallback для старых вопросов без типа */}
          {!activeQuestion.type && activeQuestion.answerOptions?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeQuestion.answerOptions?.map((a: any, idx: number) => (
                <button
                  key={idx}
                  style={{ width: "100%", marginBottom: 10, padding: 12 }}
                  onClick={() => handleAnswer(a, activeQuestion)}
                >
                  {a.text}
                </button>
              ))}
            </div>
          )}

          <button 
            onClick={() => { setActiveQuestion(null); setSelectedOptions([]); setTextAnswer(""); setNumberAnswer(""); }}
            style={{
              marginTop: 10,
              padding: "8px 16px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Закрыть
          </button>
        </Modal>
      )}

      {/* Модалка двери */}
      {doorMessage && (
        <Modal onClose={() => setDoorMessage(null)}>
          <h2>{doorMessage}</h2>
          <button onClick={() => setDoorMessage(null)}>
            Закрыть
          </button>
        </Modal>
      )}

      {/* Модалка завершения */}
      {finishMessage && (
        <Modal>
          <h2>{finishMessage}</h2>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: 40,
          borderRadius: 16,
          minWidth: 600,
          maxWidth: "80vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}