"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuestionPosition } from "@/Entities/QuestionPosition";
import { useTemplateRenames } from "@/hooks/useTemplateRenames";
import Button from "@/components/Button";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";

const API_BASE = "http://localhost:7240";
const STATIC_BASE = "http://localhost:7240";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
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
  const [showDoorConfirm, setShowDoorConfirm] = useState(false);
  const [pendingRoomIndex, setPendingRoomIndex] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [numberAnswer, setNumberAnswer] = useState("");

  const currentTemplateId = room?.roomTemplate?.id || "";
  const renameMap = useTemplateRenames(currentTemplateId);
  
  const goToResults = () => {
    setShowDoorConfirm(false);
    setPendingRoomIndex(null);
    router.push(`/Session/${activeSession.id}/Results`);
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
      const img = imageRef.current;
      
      setImageNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      
      setImageSize({
        width: img.clientWidth,
        height: img.clientHeight
      });
    }
  };

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

  useEffect(() => {
    if (!doorMessage) return;
    const timer = setTimeout(() => setDoorMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [doorMessage]);

  if (!room || !activeSession || !quest)
    return (
      <div style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        color: "var(--color-text-secondary)",
        gap: 12,
      }}>
        <span style={{ fontSize: 32 }}>⏳</span> Загрузка...
      </div>
    );

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
    } else if (option) {
      isCorrect = option.isCorrect;
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
    } else {
      return;
    }

    const updatedSession = { ...activeSession };

    const answerData: any = {
      selected_options: option?.id ? [option.id] : selectedOptions
    };
    if (question.type === "text_input" || question.type === "number_input") {
      answerData.text_answer = answerValue;
    }

    const existingIdx = updatedSession.attempts.findIndex(
      (a: any) => a.questionId === question.id
    );
    if (existingIdx !== -1) {
      updatedSession.score -= updatedSession.attempts[existingIdx].pointsAwarded;
      updatedSession.attempts.splice(existingIdx, 1);
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

  const confirmDoorTransition = () => {
    if (pendingRoomIndex !== null && quest) {
      loadRoom(quest, pendingRoomIndex);
    }
    setShowDoorConfirm(false);
    setPendingRoomIndex(null);
  };

  const cancelDoorTransition = () => {
    setShowDoorConfirm(false);
    setPendingRoomIndex(null);
  };

  const finishQuestConfirmation = () => {
    fetch(
      `${API_BASE}/api/QuestSessions/FinishAttempt/${activeSession.attemptId}`,
      { method: "POST" }
    );
    goToResults();
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
    
    const validQuestions = room.questions.filter((q: any) => {
      const targetObj = q.targetObject?.toLowerCase();
      return targetObj && targetObj !== "door" && targetObj !== "дверь";
    });
    
    const unanswered = validQuestions.filter(
      (q: any) => !answeredIds.includes(q.id)
    );

    if (!activeSession.allowPartialCompletion && unanswered.length > 0) {
      setDoorMessage("Вы должны ответить на все вопросы");
      return;
    }

    if (roomIndex + 1 < quest.questRooms.length) {
      setPendingRoomIndex(roomIndex + 1);
      setShowDoorConfirm(true);
      return;
    }

    await fetch(
      `${API_BASE}/api/QuestSessions/FinishAttempt/${activeSession.attemptId}`,
      { method: "POST" }
    );
    goToResults();
  };

  const handleZoneClick = (zoneIndex: number) => {
    const zone = zones[zoneIndex];

    if (zone.name.toLowerCase() === "door" || zone.name.toLowerCase() === "дверь") {
      handleDoorClick();
      return;
    }

    let question = room.questions.find(
      (q: any) => q.targetObject === zone.name
    );

    if (!question && room.questions[zoneIndex]) {
      question = room.questions[zoneIndex];
    }

    if (question) {
      setActiveQuestion(question);
      const prev = activeSession.attempts.find(
        (a: any) => a.questionId === question.id
      );
      if (prev) {
        const data = JSON.parse(prev.answerData || "{}");
        setSelectedOptions(data.selected_options || []);
        setTextAnswer(data.text_answer || "");
        setNumberAnswer(data.text_answer || "");
      } else {
        setSelectedOptions([]);
        setTextAnswer("");
        setNumberAnswer("");
      }
    } else {
      setActiveQuestion({
        text: "Для этой зоны нет вопроса",
        answerOptions: []
      });
    }
  };

  const getZoneStyle = (zone: QuestionPosition) => {
    if (imageSize.width === 0 || imageNaturalSize.width === 0) {
      return { left: zone.x, top: zone.y, width: zone.w, height: zone.h };
    }
    return {
      left: zone.x * (imageSize.width / imageNaturalSize.width),
      top: zone.y * (imageSize.height / imageNaturalSize.height),
      width: zone.w * (imageSize.width / imageNaturalSize.width),
      height: zone.h * (imageSize.height / imageNaturalSize.height),
    };
  };

  return (
    <div ref={containerRef} style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <img
          ref={imageRef}
          src={previewUrl}
          onLoad={handleImageLoad}
          style={{
            width: "100%",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
          draggable={false}
        />

        {zones.map((z, i) => {
          const zoneStyle = getZoneStyle(z);

          return (
            <div
              key={i}
              onClick={() => handleZoneClick(i)}
              style={{
                position: "absolute",
                cursor: "pointer",
                ...zoneStyle
              }}
            />
          );
        })}
      </div>

      {activeQuestion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setActiveQuestion(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              maxWidth: 520,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 20, lineHeight: 1.4 }}>
              {activeQuestion.text}
            </h3>

            {(activeQuestion.type === "single_choice" || activeQuestion.type === "multiple_choice") && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {activeQuestion.answerOptions?.map((opt: any) => {
                  const isSelected = selectedOptions.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        if (activeQuestion.type === "single_choice") {
                          handleAnswer(opt, activeQuestion);
                        } else {
                          setSelectedOptions(prev =>
                            prev.includes(opt.id)
                              ? prev.filter((id: string) => id !== opt.id)
                              : [...prev, opt.id]
                          );
                        }
                      }}
                      style={{
                        padding: "12px 16px",
                        border: `2px solid ${isSelected ? "var(--color-teal)" : "#e0e0e0"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        backgroundColor: isSelected ? "rgba(78,205,196,0.1)" : "white",
                        fontWeight: isSelected ? 600 : 400,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {opt.text}
                    </div>
                  );
                })}
                {activeQuestion.type === "multiple_choice" && (
                  <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setActiveQuestion(null)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: "2px solid #e0e0e0",
                        background: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleAnswer(undefined, activeQuestion)}
                      disabled={selectedOptions.length === 0}
                      style={{
                        padding: "8px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: selectedOptions.length === 0 ? "#ccc" : "var(--color-teal)",
                        color: "white",
                        cursor: selectedOptions.length === 0 ? "not-allowed" : "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Ответить
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeQuestion.type === "text_input" && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnswer(undefined, activeQuestion, textAnswer)}
                  placeholder="Введите ответ..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "2px solid #e0e0e0",
                    fontSize: 16,
                    boxSizing: "border-box",
                  }}
                  autoFocus
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setActiveQuestion(null)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "2px solid #e0e0e0",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleAnswer(undefined, activeQuestion, textAnswer)}
                    disabled={!textAnswer.trim()}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: !textAnswer.trim() ? "#ccc" : "var(--color-teal)",
                      color: "white",
                      cursor: !textAnswer.trim() ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Ответить
                  </button>
                </div>
              </div>
            )}

            {activeQuestion.type === "number_input" && (
              <div style={{ marginTop: 16 }}>
                <input
                  type="number"
                  value={numberAnswer}
                  onChange={(e) => setNumberAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnswer(undefined, activeQuestion, numberAnswer)}
                  placeholder="Введите число..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "2px solid #e0e0e0",
                    fontSize: 16,
                    boxSizing: "border-box",
                  }}
                  autoFocus
                />
                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setActiveQuestion(null)}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "2px solid #e0e0e0",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => handleAnswer(undefined, activeQuestion, numberAnswer)}
                    disabled={!numberAnswer.trim()}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "none",
                      background: !numberAnswer.trim() ? "#ccc" : "var(--color-teal)",
                      color: "white",
                      cursor: !numberAnswer.trim() ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Ответить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {doorMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
            background: "#333",
            color: "white",
            padding: "14px 28px",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
          onClick={() => setDoorMessage(null)}
        >
          {doorMessage}
        </div>
      )}

      {showDoorConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={cancelDoorTransition}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚪</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
              Перейти в следующую комнату?
            </h3>
            <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
              Все ответы в этой комнате сохранены.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={cancelDoorTransition}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "2px solid #e0e0e0",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Остаться
              </button>
              <button
                onClick={confirmDoorTransition}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--color-orange)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Вперёд!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
