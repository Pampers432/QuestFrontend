"use client";

import { use, useEffect, useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

const API = "https://localhost:7240/api/QuestSessions";

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [quest, setQuest] = useState<any>(null);
  const [roomIndex, setRoomIndex] = useState(0);

  const [room, setRoom] = useState<any>(null);
  const [zones, setZones] = useState<QuestionPosition[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");

  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);

  const [doorMessage, setDoorMessage] = useState<string | null>(null);
  const [finishMessage, setFinishMessage] = useState<string | null>(null);
  
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
    const res = await fetch(`${API}/StartAttempt`, {
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

    setPreviewUrl(`https://localhost:7240${r.roomTemplate.previewImageUrl}`);

    const parsedZones: QuestionPosition[] = JSON.parse(
      r.roomTemplate.sceneData
    );

    setZones(parsedZones);
  };

  if (!room || !activeSession || !quest)
    return <div>Загрузка...</div>;

  const handleAnswer = async (option: any, question: any) => {
    const isCorrect = option.isCorrect;
    const points = isCorrect ? question.points ?? 1 : 0;

    const updatedSession = { ...activeSession };

    updatedSession.attempts.push({
      questionId: question.id,
      isCorrect,
      pointsAwarded: points,
      answeredAt: new Date().toISOString()
    });

    updatedSession.score += points;

    localStorage.setItem("activeSession", JSON.stringify(updatedSession));
    setActiveSession(updatedSession);

    await fetch(`${API}/SaveAnswer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: updatedSession.attemptId,
        questionId: question.id,
        answerData: JSON.stringify({
          selected_options: [option.id]
        }),
        isCorrect,
        pointsAwarded: points
      })
    });

    setActiveQuestion(null);
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
    const unanswered = room.questions.filter(
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
      `${API}/FinishAttempt/${activeSession.attemptId}`,
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

    const question = room.questions[zoneIndex];

    if (question) {
      setActiveQuestion(question);
    } else {
      setActiveQuestion({
        text: "Для этой зоны нет вопроса",
        answerOptions: []
      });
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: "100%", height: "100%" }}>
        <img
          src={previewUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          draggable={false}
        />

        {zones.map((z, i) => (
          <div
            key={i}
            onClick={() => handleZoneClick(i)}
            style={{
              position: "absolute",
              left: z.x,
              top: z.y,
              width: z.w,
              height: z.h,
              cursor: "pointer",
              border: "2px solid",
              borderColor:
                z.name.toLowerCase() === "door"
                  ? "red"
                  : "#00a000",
              backgroundColor:
                z.name.toLowerCase() === "door"
                  ? "rgba(255,0,0,0.15)"
                  : "rgba(0,255,0,0.15)"
            }}
          >
            {z.name}
          </div>
        ))}
      </div>

      {/* Модалка вопроса */}
      {activeQuestion && (
        <Modal onClose={() => setActiveQuestion(null)}>
          <h2>{activeQuestion.text}</h2>

          {activeQuestion.answerOptions?.map((a: any, idx: number) => (
            <button
              key={idx}
              style={{ width: "100%", marginBottom: 10 }}
              onClick={() => handleAnswer(a, activeQuestion)}
            >
              {a.text}
            </button>
          ))}

          <button onClick={() => setActiveQuestion(null)}>
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
        background: "rgba(0,0,0,0.5)",
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
          padding: 20,
          borderRadius: 10,
          minWidth: 350
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}