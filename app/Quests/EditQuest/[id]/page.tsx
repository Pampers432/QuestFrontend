"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { CreateQuestRequest, CreateQuestRoomRequest, CreateQuestionRequest, CreateAnswerOptionRequest } from "@/Entities/Dto";
import { Question } from "@/Entities/Question";
import { AnswerOption } from "@/Entities/AnswerOption";
import RoleGuard from "@/components/RoleGuard";
import Button from "@/components/Button";
import CategorySearch from "@/components/CategorySearch";
import { fetchCategories } from "@/services/categoriesService";
import { fetchQuestById, updateQuest } from "@/services/questsService";
import { Quest } from "@/Entities/Quest";
import { PageSun, PageCloud, PageStars } from "@/components/PageDoodles";
import { getImageUrl } from "@/utils/imageUrl";

type LocalQuestionState = {
  text: string;
  type: string;
  points: number;
  hint: string;
  answerOptions?: (AnswerOption & { id: string })[];
};

type LocalRoomData = {
  template: RoomTemplate;
  title?: string;
  questions: {
    [key: string]: LocalQuestionState;
  };
};

const API_BASE = "http://localhost:7240";
const STATIC_BASE = "http://localhost:7240";

export default function EditQuest() {
  const router = useRouter();
  const params = useParams();
  const questId = params.id as string;

  const [rooms, setRooms] = useState<LocalRoomData[]>([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const [draggedRoomIndex, setDraggedRoomIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "Easy",
    status: "Draft",
    categoryId: "" as string | undefined,
    visibility: "Public" as "Public" | "Private"
  });

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const loadQuest = async () => {
      try {
        const quest = await fetchQuestById(questId);
        setQuestData({
          title: quest.title,
          description: quest.description || "",
          subject: quest.subject,
          difficulty: quest.difficulty,
          status: quest.status,
          categoryId: quest.categoryId || "",
          visibility: (quest.visibility as "Public" | "Private") || "Public"
        });

        const loadedRooms: LocalRoomData[] = quest.questRooms.map(room => {
          const initialQuestions: { [key: string]: LocalQuestionState } = {};

          if (typeof room.roomTemplate.sceneData === "string") {
            room.roomTemplate.sceneData = JSON.parse(room.roomTemplate.sceneData as string);
          }
          room.roomTemplate.sceneData.forEach((zone: any) => {
            if (zone.name.trim().toLowerCase() === "door" || zone.name.trim().toLowerCase() === "дверь") return;

            const existingQuestion = room.questions?.find(q => q.targetObject === zone.name);
            if (existingQuestion) {
              initialQuestions[zone.name] = {
                text: existingQuestion.text,
                type: existingQuestion.type,
                points: existingQuestion.points,
                hint: existingQuestion.hint || "",
                answerOptions: (existingQuestion.answerOptions || []).map(ao => ({
                  id: crypto.randomUUID(),
                  questionId: "",
                  text: ao.text,
                  isCorrect: ao.isCorrect,
                  matchPair: null,
                  sequenceOrder: null,
                  orderIndex: ao.orderIndex
                }))
              };
            } else {
              initialQuestions[zone.name] = {
                text: "",
                type: "single_choice",
                points: 10,
                hint: "",
                answerOptions: [
                  { id: crypto.randomUUID(), questionId: "", text: "", isCorrect: false, matchPair: null, sequenceOrder: null, orderIndex: 0 },
                  { id: crypto.randomUUID(), questionId: "", text: "", isCorrect: false, matchPair: null, sequenceOrder: null, orderIndex: 1 }
                ]
              };
            }
          });

          return {
            template: room.roomTemplate as RoomTemplate,
            title: room.title ?? undefined,
            questions: initialQuestions
          };
        });

        setRooms(loadedRooms);
      } catch (err) {
        setError("Не удалось загрузить квест");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (questId) {
      loadQuest();
    }
  }, [questId]);

  const addOption = (zoneName: string) => {
    setRooms(prev => {
      const newRooms = [...prev];
      const currentRoom = newRooms[currentRoomIndex];
      const currentOptions = currentRoom.questions[zoneName]?.answerOptions || [];
      const newOption: AnswerOption & { id: string } = {
        id: crypto.randomUUID(),
        questionId: "",
        text: "",
        isCorrect: false,
        matchPair: null,
        sequenceOrder: null,
        orderIndex: currentOptions.length
      };
      newRooms[currentRoomIndex] = {
        ...currentRoom,
        questions: {
          ...currentRoom.questions,
          [zoneName]: {
            ...currentRoom.questions[zoneName],
            answerOptions: [...currentOptions, newOption]
          }
        }
      };
      return newRooms;
    });
  };

  const removeOption = (zoneName: string, optionId: string) => {
    setRooms(prev => {
      const newRooms = [...prev];
      const currentRoom = newRooms[currentRoomIndex];
      newRooms[currentRoomIndex] = {
        ...currentRoom,
        questions: {
          ...currentRoom.questions,
          [zoneName]: {
            ...currentRoom.questions[zoneName],
            answerOptions: (currentRoom.questions[zoneName].answerOptions || [])
              .filter(o => o.id !== optionId)
              .map((o, index) => ({ ...o, orderIndex: index }))
          }
        }
      };
      return newRooms;
    });
  };

  const toggleCorrect = (zoneName: string, optionId: string) => {
    setRooms(prev => {
      const newRooms = [...prev];
      const currentRoom = newRooms[currentRoomIndex];
      const question = currentRoom.questions[zoneName];
      if (question.type === "single_choice") {
        newRooms[currentRoomIndex] = {
          ...currentRoom,
          questions: {
            ...currentRoom.questions,
            [zoneName]: {
              ...question,
              answerOptions: (question.answerOptions || []).map(o => ({
                ...o,
                isCorrect: o.id === optionId
              }))
            }
          }
        };
      } else {
        newRooms[currentRoomIndex] = {
          ...currentRoom,
          questions: {
            ...currentRoom.questions,
            [zoneName]: {
              ...question,
              answerOptions: (question.answerOptions || []).map(o =>
                o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
              )
            }
          }
        };
      }
      return newRooms;
    });
  };

  const removeRoom = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (rooms.length <= 1) {
      alert("Нельзя удалить последнюю комнату.");
      return;
    }
    setRooms(prev => {
      const newRooms = prev.filter((_, index) => index !== indexToRemove);
      if (indexToRemove === currentRoomIndex) {
        setCurrentRoomIndex(0);
      } else if (indexToRemove < currentRoomIndex) {
        setCurrentRoomIndex(prev => prev - 1);
      }
      return newRooms;
    });
  };

  const handleDragStart = (index: number, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedRoomIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedRoomIndex === null || draggedRoomIndex === targetIndex) return;
    setRooms(prev => {
      const newRooms = [...prev];
      const draggedRoom = newRooms[draggedRoomIndex];
      newRooms.splice(draggedRoomIndex, 1);
      newRooms.splice(targetIndex, 0, draggedRoom);
      return newRooms;
    });
    if (draggedRoomIndex === currentRoomIndex) {
      setCurrentRoomIndex(targetIndex);
    } else if (draggedRoomIndex < currentRoomIndex && targetIndex >= currentRoomIndex) {
      setCurrentRoomIndex(prev => prev - 1);
    } else if (draggedRoomIndex > currentRoomIndex && targetIndex <= currentRoomIndex) {
      setCurrentRoomIndex(prev => prev + 1);
    }
    setDraggedRoomIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedRoomIndex(null);
  };

  const selectRoom = (index: number) => {
    setCurrentRoomIndex(index);
  };

  const addNewRoom = () => {
    router.push('/Templates?select=true');
  };

  const validateQuest = (): boolean => {
    if (!questData.title.trim()) {
      alert("Введите название квеста");
      return false;
    }
    if (!questData.subject.trim()) {
      alert("Введите предмет");
      return false;
    }
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      const room = rooms[roomIndex];
      for (const [zoneName, question] of Object.entries(room.questions)) {
        if (zoneName.trim().toLowerCase() === "door" || zoneName.trim().toLowerCase() === "дверь") continue;
        if (!question.text.trim()) {
          alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не введён текст вопроса`);
          return false;
        }
        if (["single_choice", "multiple_choice"].includes(question.type)) {
          const options = question.answerOptions || [];
          if (options.length < 2) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" должно быть минимум 2 варианта ответа`);
            return false;
          }
          const emptyOptions = options.filter(opt => !opt.text?.trim());
          if (emptyOptions.length > 0) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" есть пустые варианты ответа`);
            return false;
          }
          const hasCorrect = options.some(opt => opt.isCorrect);
          if (!hasCorrect) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не выбран правильный ответ`);
            return false;
          }
        }
        if (["text_input", "number_input"].includes(question.type)) {
          if (!question.answerOptions || question.answerOptions.length === 0 || !question.answerOptions[0]?.text?.trim()) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не введён правильный ответ`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const saveQuest = async () => {
    if (!validateQuest()) return;

    const questRequest: CreateQuestRequest = {
      title: questData.title,
      description: questData.description || undefined,
      subject: questData.subject,
      difficulty: questData.difficulty,
      status: questData.status,
      categoryId: questData.categoryId || undefined,
      visibility: questData.visibility,
      rooms: rooms.map((room, roomIndex): CreateQuestRoomRequest => ({
        roomTemplateId: room.template.id!,
        title: room.title,
        orderIndex: roomIndex,
        questions: Object.entries(room.questions)
          .filter(([zoneName]) => { const lower = zoneName.trim().toLowerCase(); return lower !== "door" && lower !== "дверь"; })
          .map(([zoneName, question], qIndex): CreateQuestionRequest => ({
            text: question.text,
            type: question.type,
            points: question.points,
            hint: question.hint || undefined,
            targetObject: zoneName,
            orderIndex: qIndex,
            answerOptions: (question.answerOptions || []).map((opt, optIndex): CreateAnswerOptionRequest => ({
              text: opt.text || undefined,
              isCorrect: opt.isCorrect || false,
              orderIndex: optIndex
            }))
          }))
      }))
    };

    try {
      await updateQuest(questId, questRequest);
      alert("Квест успешно обновлён!");
      router.push('/Quests');
    } catch (err) {
      console.error("Ошибка при обновлении квеста:", err);
      alert("Произошла ошибка при обновлении квеста. Пожалуйста, попробуйте снова.");
    }
  };

  const updateRoomTitle = (title: string) => {
    setRooms(prev => {
      const newRooms = [...prev];
      newRooms[currentRoomIndex] = {
        ...newRooms[currentRoomIndex],
        title
      };
      return newRooms;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setQuestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight
      });
      setImageNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  };

  if (loading) return <div style={{ padding: 24, minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--color-text-secondary)" }}><span style={{ fontSize: 24 }}>⏳</span> Загрузка...</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (rooms.length === 0) {
    return (
      <RoleGuard
        allowedRoles={["Teacher", "Admin"]}
        fallbackMessage="Редактирование квестов доступно только преподавателю и администратору."
      >
        <div className="page-container">
          <h1 className="page-title" style={{ background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✏️ Редактирование квеста</h1>
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Комнаты не найдены</p>
            <Button variant="primary" onClick={() => router.push('/Quests')}>
              Вернуться к списку квестов
            </Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  const currentRoom = rooms[currentRoomIndex];
  const displayWidth = 600;

  const questionTypes = [
    { value: "single_choice", label: "Один вариант ответа" },
    { value: "multiple_choice", label: "Несколько вариантов ответа" },
    { value: "text_input", label: "Текстовый ответ" },
    { value: "number_input", label: "Числовой ответ" }
  ];

  return (
    <RoleGuard
      allowedRoles={["Teacher", "Admin"]}
      fallbackMessage="Редактирование квестов доступно только преподавателю и администратору."
    >
    <div style={{ position: "relative", minHeight: "calc(100vh - 64px)" }}>
      <PageSun style={{ position: "fixed", top: "3%", right: "5%", width: 65, height: 65, opacity: 0.3, zIndex: 0 }} className="animate-float-slow" />
      <PageCloud style={{ position: "fixed", top: "8%", left: "3%", width: 85, height: 42, opacity: 0.25, zIndex: 0 }} className="animate-drift" />
      <PageStars style={{ position: "fixed", top: "12%", left: "60%", width: 120, height: 18, opacity: 0.15, zIndex: 0 }} />
    <div className="page-container" style={{ position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 className="page-title" style={{ background: "linear-gradient(135deg, var(--color-orange), var(--color-sky))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✏️ Редактирование квеста</h1>
        <Button variant="ghost" onClick={() => router.push('/Quests')}>
          Отмена
        </Button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div className="rooms-sidebar" style={{
          width: 140,
          height: 500,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10
        }}>
          {rooms.map((room, index) => (
            <div
              key={room.template.id}
              draggable
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => selectRoom(index)}
              className="room-thumbnail"
              style={{
                marginBottom: 10,
                cursor: "grab",
                border: index === currentRoomIndex ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: 4,
                padding: 5,
                background: index === currentRoomIndex ? "#f0f7ff" : "white",
                opacity: draggedRoomIndex === index ? 0.5 : 1,
                position: "relative",
                transition: "all 0.2s"
              }}
            >
              <img
                src={getImageUrl(room.template.previewImageUrl)}
                alt={room.template.name}
                style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 4, pointerEvents: "none" }}
              />
              <div style={{ fontSize: 12, textAlign: "center", marginTop: 5, paddingRight: 20 }}>
                {room.template.name}
              </div>
              <button
                onClick={(e) => removeRoom(index, e)}
                title="Удалить комнату"
                style={{
                  position: "absolute", top: 2, right: 2, width: 20, height: 20,
                  background: "#dc3545", color: "white", border: "none", borderRadius: "50%",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: "bold", zIndex: 10
                }}
              >
                ✕
              </button>
              <div style={{
                position: "absolute", top: 2, left: 2,
                background: "rgba(0,0,0,0.5)", color: "white",
                width: 20, height: 20, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, zIndex: 10
              }}>
                {index + 1}
              </div>
            </div>
          ))}

          <div
            onClick={addNewRoom}
            className="add-room-button"
            style={{
              border: "2px dashed #aaa", borderRadius: 4, padding: 5, height: 120,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", cursor: "pointer", background: "#f9f9f9"
            }}
          >
            <div style={{ fontSize: 32, color: "#aaa" }}>+</div>
            <div style={{ fontSize: 12, color: "#666", textAlign: "center" }}>
              Добавить комнату
            </div>
          </div>
        </div>

        <div className="room-preview-wrapper" style={{ position: "relative", width: displayWidth }}>
          <img
            ref={imageRef}
            src={getImageUrl(currentRoom.template.previewImageUrl)}
            alt="preview"
            className="room-preview"
            onLoad={handleImageLoad}
            style={{ width: "100%", height: "auto" }}
          />

          {imageSize.width > 0 && currentRoom.template.sceneData.map((zone) => {
            const scaleX = imageSize.width / imageNaturalSize.width;
            const scaleY = imageSize.height / imageNaturalSize.height;
            const x = zone.x * scaleX;
            const y = zone.y * scaleY;
            const w = zone.w * scaleX;
            const h = zone.h * scaleY;

            return (
              <div
                key={zone.name}
                className="zone-box"
                style={{
                  position: "absolute",
                  border: "2px solid #007bff",
                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  textShadow: "1px 1px 2px black",
                  left: x,
                  top: y,
                  width: w,
                  height: h
                }}
              >
                {zone.name}
              </div>
            );
          })}
        </div>

        <div className="quest-form" style={{ width: 350 }}>
          <h3 style={{ marginTop: 0, marginBottom: 15 }}>Информация о квесте</h3>
          
          <input
            name="title"
            placeholder="Название квеста *"
            value={questData.title}
            onChange={handleChange}
            className="quest-input"
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <textarea
            name="description"
            placeholder="Описание"
            value={questData.description}
            onChange={handleChange}
            className="quest-textarea"
            style={{ width: "100%", marginBottom: 10, padding: 8, minHeight: 60 }}
          />

          <input
            name="subject"
            placeholder="Предмет *"
            value={questData.subject}
            onChange={handleChange}
            className="quest-input"
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />

          <CategorySearch
            categories={categories}
            value={questData.categoryId}
            onChange={(id) => setQuestData(prev => ({ ...prev, categoryId: id }))}
          />

          <select
            name="difficulty"
            value={questData.difficulty}
            onChange={handleChange}
            className="quest-select"
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          >
            <option value="Easy">Лёгкий</option>
            <option value="Medium">Средний</option>
            <option value="Hard">Сложный</option>
          </select>

          <select
            name="status"
            value={questData.status}
            onChange={handleChange}
            className="quest-select"
            style={{ width: "100%", marginBottom: 20, padding: 8 }}
          >
            <option value="Draft">Черновик</option>
            <option value="Published">Опубликован</option>
            <option value="Archive">Архив</option>
          </select>

          <h3 style={{ marginBottom: 15 }}>Текущая комната</h3>
          
          <input
            placeholder="Название комнаты (необязательно)"
            value={currentRoom.title || ""}
            onChange={(e) => updateRoomTitle(e.target.value)}
            className="quest-input"
            style={{ width: "100%", marginBottom: 20, padding: 8 }}
          />

          <Button variant="primary" onClick={saveQuest} style={{ width: "100%" }}>
            Сохранить изменения
          </Button>
        </div>
      </div>

      <h3 style={{ marginTop: 40, marginBottom: 20 }}>
        Вопросы по зонам (Комната: {currentRoom.template.name})
      </h3>

      {currentRoom.template.sceneData
        .filter((zone) => { const lower = zone.name.trim().toLowerCase(); return lower !== "door" && lower !== "дверь"; })
        .map((zone, zoneIndex) => (
        <div key={zone.name} className="question-card" style={{ 
          border: "1px solid #ddd", 
          padding: 20, 
          marginBottom: 20, 
          borderRadius: 8,
          background: "#fafafa"
        }}>
          <div className="question-card-title" style={{ 
            fontWeight: "bold", 
            marginBottom: 15,
            fontSize: 16,
            color: "#007bff"
          }}>
            Зона: {zone.name}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
            <select
              value={currentRoom.questions[zone.name]?.type || "single_choice"}
              onChange={(e) => {
                setRooms(prev => {
                  const newRooms = [...prev];
                  const currentQuestion = newRooms[currentRoomIndex].questions[zone.name];
                  const isChoiceType = e.target.value === "single_choice" || e.target.value === "multiple_choice";
                  newRooms[currentRoomIndex] = {
                    ...newRooms[currentRoomIndex],
                    questions: {
                      ...newRooms[currentRoomIndex].questions,
                      [zone.name]: {
                        ...currentQuestion,
                        type: e.target.value,
                        answerOptions: isChoiceType && currentQuestion?.answerOptions && currentQuestion.answerOptions.length >= 2 
                          ? currentQuestion.answerOptions.slice(0, 2).map((opt, idx) => ({ ...opt, orderIndex: idx }))
                          : isChoiceType
                            ? [
                                { id: crypto.randomUUID(), questionId: "", text: "", isCorrect: false, matchPair: null, sequenceOrder: null, orderIndex: 0 },
                                { id: crypto.randomUUID(), questionId: "", text: "", isCorrect: false, matchPair: null, sequenceOrder: null, orderIndex: 1 }
                              ]
                            : []
                      }
                    }
                  };
                  return newRooms;
                });
              }}
              className="quest-select"
              style={{ padding: 8 }}
            >
              {questionTypes.map(qt => (
                <option key={qt.value} value={qt.value}>
                  {qt.label}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-secondary)" }}>Количество баллов</div>
            <input
              type="number"
              placeholder="Баллы"
              value={currentRoom.questions[zone.name]?.points || 10}
              onChange={(e) => {
                setRooms(prev => {
                  const newRooms = [...prev];
                  newRooms[currentRoomIndex] = {
                    ...newRooms[currentRoomIndex],
                    questions: {
                      ...newRooms[currentRoomIndex].questions,
                      [zone.name]: {
                        ...newRooms[currentRoomIndex].questions[zone.name],
                        points: parseInt(e.target.value) || 0
                      }
                    }
                  };
                  return newRooms;
                });
              }}
              className="quest-input"
              style={{ padding: 8 }}
              min="0"
              max="100"
            />
            </div>
          </div>

          <textarea
            placeholder="Введите текст вопроса *"
            value={currentRoom.questions[zone.name]?.text || ""}
            onChange={(e) => {
              setRooms(prev => {
                const newRooms = [...prev];
                newRooms[currentRoomIndex] = {
                  ...newRooms[currentRoomIndex],
                  questions: {
                    ...newRooms[currentRoomIndex].questions,
                    [zone.name]: {
                      ...newRooms[currentRoomIndex].questions[zone.name],
                      text: e.target.value
                    }
                  }
                };
                return newRooms;
              });
            }}
            className="quest-textarea"
            style={{ width: "100%", marginBottom: 10, padding: 8, minHeight: 60 }}
          />

          <input
            placeholder="Подсказка (необязательно)"
            value={currentRoom.questions[zone.name]?.hint || ""}
            onChange={(e) => {
              setRooms(prev => {
                const newRooms = [...prev];
                newRooms[currentRoomIndex] = {
                  ...newRooms[currentRoomIndex],
                  questions: {
                    ...newRooms[currentRoomIndex].questions,
                    [zone.name]: {
                      ...newRooms[currentRoomIndex].questions[zone.name],
                      hint: e.target.value
                    }
                  }
                };
                return newRooms;
              });
            }}
            className="quest-input"
            style={{ width: "100%", marginBottom: 15, padding: 8 }}
          />

          {currentRoom.questions[zone.name] && ["text_input", "number_input"].includes(
            currentRoom.questions[zone.name]?.type || ""
          ) && (
            <div style={{ marginTop: 10, marginBottom: 15 }}>
              <div style={{ fontWeight: "bold", marginBottom: 10 }}>Правильный ответ:</div>
              <input
                type={currentRoom.questions[zone.name]?.type === "number_input" ? "number" : "text"}
                placeholder={currentRoom.questions[zone.name]?.type === "number_input" ? "Введите число" : "Введите текст"}
                value={currentRoom.questions[zone.name]?.answerOptions?.[0]?.text || ""}
                onChange={(e) => {
                  setRooms(prev => {
                    const newRooms = [...prev];
                    const currentOptions = newRooms[currentRoomIndex].questions[zone.name]?.answerOptions || [];
                    const newOptions = currentOptions.length > 0
                      ? currentOptions.map((opt, idx) => idx === 0 ? { ...opt, text: e.target.value, isCorrect: true, orderIndex: 0 } : { ...opt, orderIndex: idx + 1 })
                      : [{ id: crypto.randomUUID(), questionId: "", text: e.target.value, isCorrect: true, matchPair: null, sequenceOrder: null, orderIndex: 0 }];
                    newRooms[currentRoomIndex] = {
                      ...newRooms[currentRoomIndex],
                      questions: {
                        ...newRooms[currentRoomIndex].questions,
                        [zone.name]: {
                          ...newRooms[currentRoomIndex].questions[zone.name],
                          answerOptions: newOptions
                        }
                      }
                    };
                    return newRooms;
                  });
                }}
                className="quest-input"
                style={{ width: "100%", padding: 8 }}
              />
            </div>
          )}

          {currentRoom.questions[zone.name] && ["single_choice", "multiple_choice"].includes(
            currentRoom.questions[zone.name]?.type || ""
          ) && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: "bold", marginBottom: 10 }}>Варианты ответа:</div>
              
              {(currentRoom.questions[zone.name]?.answerOptions || []).map(option => (
                <div key={option.id} className="answer-row" style={{ 
                  display: "flex", 
                  gap: 10, 
                  marginBottom: 10,
                  alignItems: "center"
                }}>
                  <input
                    type={currentRoom.questions[zone.name]?.type === "single_choice" ? "radio" : "checkbox"}
                    checked={option.isCorrect || false}
                    onChange={() => toggleCorrect(zone.name, option.id)}
                  />

                  <input
                    value={option.text || ""}
                    placeholder="Текст варианта *"
                    onChange={(e) => {
                      setRooms(prev => {
                        const newRooms = [...prev];
                        newRooms[currentRoomIndex] = {
                          ...newRooms[currentRoomIndex],
                          questions: {
                            ...newRooms[currentRoomIndex].questions,
                            [zone.name]: {
                              ...newRooms[currentRoomIndex].questions[zone.name],
                              answerOptions: (newRooms[currentRoomIndex].questions[zone.name].answerOptions || []).map(o =>
                                o.id === option.id ? { ...o, text: e.target.value } : o
                              )
                            }
                          }
                        };
                        return newRooms;
                      });
                    }}
                    className="answer-input"
                    style={{ flex: 1, padding: 5 }}
                  />

                  <Button variant="danger" size="sm" onClick={() => removeOption(zone.name, option.id)}>
                    ✕
                  </Button>
                </div>
              ))}

              <Button variant="primary" size="sm" onClick={() => addOption(zone.name)} style={{ marginTop: 5 }}>
                + Добавить вариант
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
      </div>
    </RoleGuard>
  );
}
