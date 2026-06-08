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
    <div style={{ minHeight: "calc(100vh - 64px)", position: "relative" }}>
      <PageSun
        style={{ position: "fixed", top: "3%", right: "5%", width: 70, height: 70, opacity: 0.3, zIndex: 0 }}
        className="animate-float-slow"
      />
      <PageStars
        style={{ position: "fixed", top: "10%", left: "5%", width: 120, height: 20, opacity: 0.2, zIndex: 0 }}
      />

      <div style={{
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,107,53,0.1)",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🗺️</span>
          <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
            Комната {roomIndex + 1} / {quest.questRooms.length}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
            ⭐ Баллы: <strong style={{ color: "var(--color-orange)" }}>{activeSession.score}</strong>
          </span>
          <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
            ✓ {activeSession.attempts?.length || 0}
          </span>
        </div>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          width: "100vw", 
          height: "auto", 
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.85)",
          position: "relative",
          zIndex: 1,
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
               width: "100vw",
               height: "auto"
             }}
             draggable={false}
           />

          {zones.map((z, i) => {
            const zoneStyle = getZoneStyle(z);
            const displayName = renameMap[z.name] || z.name;
            const isDoor = z.name.toLowerCase() === "door" || z.name.toLowerCase() === "дверь";
            
            return (
              <div
                key={i}
                onClick={() => handleZoneClick(i)}
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: isDoor ? "rgba(255,107,53,0.8)" : "rgba(78,205,196,0.8)",
                  backgroundColor: isDoor 
                    ? "rgba(255,107,53,0.15)" 
                    : "rgba(78,205,196,0.15)",
                  borderRadius: 8,
                  transition: "all 0.3s ease",
                  ...zoneStyle
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDoor ? "var(--color-orange)" : "var(--color-teal)";
                  e.currentTarget.style.backgroundColor = isDoor 
                    ? "rgba(255,107,53,0.3)" 
                    : "rgba(78,205,196,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDoor ? "rgba(255,107,53,0.8)" : "rgba(78,205,196,0.8)";
                  e.currentTarget.style.backgroundColor = isDoor 
                    ? "rgba(255,107,53,0.15)" 
                    : "rgba(78,205,196,0.15)";
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
                  fontSize: isDoor ? "16px" : "13px",
                  pointerEvents: "none",
                }}>
                  {isDoor ? "🚪 " : ""}{displayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {activeQuestion && (
        <Modal onClose={() => { setActiveQuestion(null); setSelectedOptions([]); setTextAnswer(""); setNumberAnswer(""); }}>
          <h2 style={{ marginBottom: 20, fontSize: 24 }}>📝 {activeQuestion.text}</h2>
          {activeQuestion.attachment && (
            <div style={{ marginBottom: 20, textAlign: "center" }}>
              <img
                src={activeQuestion.attachment}
                alt="question image"
                style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 12, objectFit: "contain" }}
              />
            </div>
          )}
          
          {activeQuestion.type === "single_choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {activeQuestion.answerOptions?.map((a: any, idx: number) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
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
                    style={{ width: 20, height: 20, cursor: "pointer", accentColor: "var(--color-orange)" }}
                  />
                  {a.attachment && (
                    <img src={a.attachment} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <span style={{ fontSize: 16 }}>{a.text}</span>
                </label>
              ))}
            </div>
          )}

          {activeQuestion.type === "multiple_choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {activeQuestion.answerOptions?.map((a: any, idx: number) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
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
                    style={{ width: 20, height: 20, cursor: "pointer", accentColor: "var(--color-orange)" }}
                  />
                  {a.attachment && (
                    <img src={a.attachment} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <span style={{ fontSize: 16 }}>{a.text}</span>
                </label>
              ))}
              <Button variant="primary" onClick={() => handleAnswer(undefined, activeQuestion)} disabled={selectedOptions.length === 0}>
                ✅ Ответить ({selectedOptions.length} выбрано)
              </Button>
            </div>
          )}

          {activeQuestion.type === "text_input" && (
            <div style={{ marginBottom: 20, width: "100%" }}>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="✏️ Введите ваш ответ..."
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "2px solid #e0e0e0",
                  borderRadius: 12,
                  minHeight: 100,
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
              <Button variant="primary" onClick={() => handleAnswer(undefined, activeQuestion, textAnswer)} disabled={!textAnswer.trim()}>
                ✅ Ответить
              </Button>
            </div>
          )}

          {activeQuestion.type === "number_input" && (
            <div style={{ marginBottom: 20, width: "100%" }}>
              <input
                type="number"
                value={numberAnswer}
                onChange={(e) => setNumberAnswer(e.target.value)}
                placeholder="🔢 Введите число..."
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "2px solid #e0e0e0",
                  borderRadius: 12,
                  marginBottom: 10,
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--color-orange)"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
              <Button variant="primary" onClick={() => handleAnswer(undefined, activeQuestion, numberAnswer)} disabled={!numberAnswer.trim()}>
                ✅ Ответить
              </Button>
            </div>
          )}

          {!activeQuestion.type && activeQuestion.answerOptions?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeQuestion.answerOptions?.map((a: any, idx: number) => (
                <Button key={idx} variant="secondary" onClick={() => handleAnswer(a, activeQuestion)} style={{ width: "100%" }}>
                  {a.text}
                </Button>
              ))}
            </div>
          )}

          <Button variant="ghost" onClick={() => { setActiveQuestion(null); setSelectedOptions([]); setTextAnswer(""); setNumberAnswer(""); }}>
            ✕ Закрыть
          </Button>
        </Modal>
      )}

      {doorMessage && (
        <Modal onClose={() => setDoorMessage(null)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {doorMessage.includes("следующую") ? "🚪➡️" : "⚠️"}
            </div>
            <h2>{doorMessage}</h2>
            <Button variant="primary" onClick={() => setDoorMessage(null)}>
              OK
            </Button>
          </div>
        </Modal>
      )}

      {showDoorConfirm && (
        <Modal>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚪</div>
            <h2>Перейти в следующую комнату?</h2>
            <p style={{ marginBottom: 24, color: "var(--color-text-secondary)" }}>
              {pendingRoomIndex !== null && quest
                ? `Комната ${pendingRoomIndex + 1} из ${quest.questRooms.length}`
                : ""}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Button variant="secondary" onClick={cancelDoorTransition}>
                Отмена
              </Button>
              <Button variant="primary" onClick={confirmDoorTransition}>
                Перейти
              </Button>
            </div>
          </div>
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
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
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
          padding: 36,
          borderRadius: 24,
          minWidth: 500,
          maxWidth: "80vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
