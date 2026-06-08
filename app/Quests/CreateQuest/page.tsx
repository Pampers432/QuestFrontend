"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { CreateQuestRequest, CreateQuestRoomRequest, CreateQuestionRequest, CreateAnswerOptionRequest } from "@/Entities/Dto";
import { Question } from "@/Entities/Question";
import { AnswerOption } from "@/Entities/AnswerOption";
import RoleGuard from "@/components/RoleGuard";
import Button from "@/components/Button";
import CategorySearch from "@/components/CategorySearch";
import { fetchCategories } from "@/services/categoriesService";
import { fetchTemplateRenames } from "@/services/templatesService";
import { useTemplateRenames } from "@/hooks/useTemplateRenames";
import { uploadImage } from "@/services/imagesService";

type LocalQuestionState = {
  text: string;
  type: string;
  points: number;
  hint: string;
  attachment?: string;
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

export default function CreateQuest() {
  const router = useRouter();
  const [rooms, setRooms] = useState<LocalRoomData[]>([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const [draggedRoomIndex, setDraggedRoomIndex] = useState<number | null>(null);
  const [step, setStep] = useState(1);

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

   // Calculate effective template ID safely even when rooms is empty
   const currentRoom = rooms[currentRoomIndex];
   const effectiveTemplateId = currentRoom?.template?.id || "";
   const renameMap = useTemplateRenames(effectiveTemplateId);

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

  // Функция удаления комнаты
  const removeRoom = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события, чтобы не сработал переход на комнату
    
    if (rooms.length <= 1) {
      alert("Нельзя удалить последнюю комнату. Добавьте новую комнату или очистите квест полностью.");
      return;
    }

    setRooms(prev => {
      const newRooms = prev.filter((_, index) => index !== indexToRemove);
      
      // Если удаляем текущую комнату, переключаемся на первую
      if (indexToRemove === currentRoomIndex) {
        setCurrentRoomIndex(0);
      } else if (indexToRemove < currentRoomIndex) {
        // Если удаляем комнату до текущей, индекс текущей уменьшается
        setCurrentRoomIndex(prev => prev - 1);
      }
      
      return newRooms;
    });
  };

  // Функции для drag and drop
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
    
    if (draggedRoomIndex === null || draggedRoomIndex === targetIndex) {
      return;
    }

    setRooms(prev => {
      const newRooms = [...prev];
      const draggedRoom = newRooms[draggedRoomIndex];
      
      // Удаляем перетаскиваемый элемент
      newRooms.splice(draggedRoomIndex, 1);
      // Вставляем его на новую позицию
      newRooms.splice(targetIndex, 0, draggedRoom);
      
      return newRooms;
    });

    // Обновляем текущий индекс если нужно
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

  // Функция для выбора комнаты (клик)
  const selectRoom = (index: number) => {
    setCurrentRoomIndex(index);
  };

  // Функция полной очистки квеста
  const clearQuest = () => {
    if (confirm("Вы уверены, что хотите очистить квест? Все комнаты и выбранные шаблоны будут удалены.")) {
      // Очищаем все состояния
      setRooms([]);
      setQuestData({
        title: "",
        description: "",
        subject: "",
        difficulty: "Easy",
        status: "Draft",
        categoryId: undefined,
        visibility: "Public"
      });
      setCurrentRoomIndex(0);

      // Удаляем из localStorage
      localStorage.removeItem("selectedTemplates");
      localStorage.removeItem("createQuestRooms");

      // Перенаправляем на страницу квестов
      router.push('/Quests');
    }
  };

  const questionTypes = [
    { value: "single_choice", label: "Один вариант ответа" },
    { value: "multiple_choice", label: "Несколько вариантов ответа" },
    { value: "text_input", label: "Текстовый ответ" },
    { value: "number_input", label: "Числовой ответ" }
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setQuestData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const savedRooms = localStorage.getItem("createQuestRooms");
    const newTemplates = localStorage.getItem("selectedTemplates");
    localStorage.removeItem("selectedTemplates");
    localStorage.removeItem("createQuestRooms");

    let existing: LocalRoomData[] = [];
    if (savedRooms) {
      try { existing = JSON.parse(savedRooms); } catch {}
    }

    if (!newTemplates) {
      if (savedRooms) setRooms(existing);
      if (!savedRooms && existing.length === 0) router.push('/Templates?select=true');
      return;
    }

    const parsed = JSON.parse(newTemplates) as RoomTemplate[];
    const existingIds = new Set(existing.map(r => r.template.id));

    const makeRoom = (template: RoomTemplate): LocalRoomData => {
      if (typeof template.sceneData === "string") template.sceneData = JSON.parse(template.sceneData as string);
      const initialQuestions: any = {};
      template.sceneData.forEach((z: any) => {
        if (z.name.trim().toLowerCase() === "door" || z.name.trim().toLowerCase() === "дверь") return;
        initialQuestions[z.name] = {
          text: "", type: "single_choice", points: 10, hint: "",
          answerOptions: [
            { id: crypto.randomUUID(), questionId: "", text: "", isCorrect: false, matchPair: null, sequenceOrder: null, orderIndex: 0 },
            { id: crypto.randomUUID(), questionId: "", text: "", isCorrect: false, matchPair: null, sequenceOrder: null, orderIndex: 1 }
          ]
        };
      });
      return { template, title: template.name, questions: initialQuestions };
    };

    const merged: LocalRoomData[] = [
      ...existing,
      ...parsed.filter(t => !existingIds.has(t.id)).map(makeRoom)
    ];

    setRooms(merged);
  }, []);

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

  const addNewRoom = () => {
    localStorage.setItem("createQuestRooms", JSON.stringify(rooms));
    router.push('/Templates?select=true');
  };

  // Валидация перед созданием квеста
  const validateQuest = (): boolean => {
    if (!questData.title.trim()) {
      alert("Введите название квеста");
      return false;
    }

    if (!questData.subject.trim()) {
      alert("Введите предмет");
      return false;
    }

    // Проверка каждой комнаты
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      const room = rooms[roomIndex];
      const zoneEntries = Object.entries(room.questions);

      for (const [zoneName, question] of zoneEntries) {
        if (zoneName.trim().toLowerCase() === "door" || zoneName.trim().toLowerCase() === "дверь") {
          continue;
        }

        if (!question.text.trim()) {
          alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не введен текст вопроса`);
          return false;
        }

        // Проверка вариантов ответа для типов с вариантами
        if (["single_choice", "multiple_choice"].includes(question.type)) {
          const options = question.answerOptions || [];
          if (options.length < 2) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" должно быть минимум 2 варианта ответа`);
            return false;
          }

          // Проверка что все варианты заполнены
          const emptyOptions = options.filter(opt => !opt.text?.trim());
          if (emptyOptions.length > 0) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" есть пустые варианты ответа`);
            return false;
          }

          // Проверка что есть хотя бы один правильный ответ
          const hasCorrect = options.some(opt => opt.isCorrect);
          if (!hasCorrect) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не выбран правильный ответ`);
            return false;
          }
        }

        // Проверка правильного ответа для text_input и number_input
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

  const createQuest = async () => {
    if (!validateQuest()) {
      return;
    }

    // Формируем DTO для отправки на сервер
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
          .filter(([zoneName]) => zoneName.trim().toLowerCase() !== "door" && zoneName.trim().toLowerCase() !== "дверь")
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
       // Получаем токен авторизации
       const token = localStorage.getItem("auth_token");
       if (!token) {
         alert("Необходимо авторизоваться");
         router.push("/login");
         return;
       }

       // Отправляем запрос на сервер
       const response = await fetch(`${API_BASE}/api/Quests/CreateQuest`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(questRequest),
       });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
      }

      const createdQuest = await response.json();
      
      // Очищаем временные данные
      localStorage.removeItem("selectedTemplates");
      localStorage.removeItem("createQuestRooms");
      
      alert("Квест успешно создан!");
      router.push('/Quests');
      
    } catch (error) {
      console.error("Ошибка при создании квеста:", error);
      alert("Произошла ошибка при создании квеста. Пожалуйста, попробуйте снова.");
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

  const displayWidth = 600;

  if (rooms.length === 0) {
    return (
      <RoleGuard
        allowedRoles={["Teacher", "Admin"]}
        fallbackMessage="Создание квестов доступно только преподавателю и администратору."
      >
        <div style={{ padding: 20 }}>
          <h2>Загрузка...</h2>
    </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      allowedRoles={["Teacher", "Admin"]}
      fallbackMessage="Создание квестов доступно только преподавателю и администратору."
    >
      <div className="page-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 className="page-title">Создание квеста</h1>
          
          <Button variant="danger" onClick={clearQuest}>
            Очистить квест
          </Button>
        </div>

        {/* Step indicator */}
        <div style={{
          display: "flex", gap: 12, marginBottom: 24, alignItems: "center",
          justifyContent: "center",
        }}>
          <div onClick={() => setStep(1)} style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "10px 20px", borderRadius: 12,
            background: step === 1 ? "var(--color-orange)" : "rgba(0,0,0,0.05)",
            color: step === 1 ? "#fff" : "var(--color-text-secondary)",
            fontWeight: 700, fontSize: 14, border: "none",
            transition: "all 0.3s ease",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 24, height: 24, borderRadius: "50%",
              background: step === 1 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
              fontSize: 12, fontWeight: 800,
            }}>1</span>
            Вопросы и комнаты
          </div>

          <div style={{ fontSize: 18, color: "rgba(0,0,0,0.15)" }}>→</div>

          <div onClick={() => setStep(2)} style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            padding: "10px 20px", borderRadius: 12,
            background: step === 2 ? "var(--color-orange)" : "rgba(0,0,0,0.05)",
            color: step === 2 ? "#fff" : "var(--color-text-secondary)",
            fontWeight: 700, fontSize: 14, border: "none",
            transition: "all 0.3s ease",
          }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 24, height: 24, borderRadius: "50%",
              background: step === 2 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
              fontSize: 12, fontWeight: 800,
            }}>2</span>
            Настройки и публикация
          </div>
        </div>

      {step === 1 && (<>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Вертикальная панель с комнатами */}
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
              <div
                style={{
                  width: "100%",
                  height: 80,
                  backgroundImage: `url(${STATIC_BASE}${room.template.previewImageUrl})`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  borderRadius: 4,
                  pointerEvents: "none"
                }}
              />
              <div style={{ fontSize: 12, textAlign: "center", marginTop: 5, paddingRight: 20 }}>
                {room.template.name}
              </div>
              
              <button
                onClick={(e) => removeRoom(index, e)}
                title="Удалить комнату"
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: "bold",
                  zIndex: 10
                }}
              >
                ✕
              </button>
              
              <div style={{
                position: "absolute",
                top: 2,
                left: 2,
                background: "rgba(0,0,0,0.5)",
                color: "white",
                width: 20,
                height: 20,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                zIndex: 10
              }}>
                {index + 1}
              </div>
            </div>
          ))}

          <div
            onClick={addNewRoom}
            className="add-room-button"
            style={{
              border: "2px dashed #aaa",
              borderRadius: 4,
              padding: 5,
              height: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "#f9f9f9"
            }}
          >
            <div style={{ fontSize: 32, color: "#aaa" }}>+</div>
            <div style={{ fontSize: 12, color: "#666", textAlign: "center" }}>
              Добавить комнату
            </div>
          </div>
        </div>

        {/* Превью текущей комнаты */}
        <div className="room-preview-wrapper" style={{ position: "relative", flex: 1, height: "calc(100vh - 150px)", overflow: "hidden" }}>
          <img
            ref={imageRef}
            src={`${STATIC_BASE}${currentRoom.template.previewImageUrl}`}
            alt="preview"
            className="room-preview"
            onLoad={handleImageLoad}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />

           {imageSize.width > 0 && currentRoom.template.sceneData.map((zone) => {
             const scaleX = imageSize.width / imageNaturalSize.width;
             const scaleY = imageSize.height / imageNaturalSize.height;

              const x = zone.x * scaleX;
              const y = zone.y * scaleY;
              const w = zone.w * scaleX;
              const h = zone.h * scaleY;

              const displayName = renameMap[zone.name] || zone.name;

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
                  {displayName}
                </div>
              );
            })}
        </div>

        {/* Форма */}
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

          <CategorySearch
            categories={categories}
            value={questData.categoryId}
            onChange={(id) => setQuestData(prev => ({ ...prev, categoryId: id }))}
          />

          <h3 style={{ marginBottom: 15 }}>Текущая комната</h3>
          
          <input
            placeholder="Название комнаты (необязательно)"
            value={currentRoom.title || ""}
            onChange={(e) => updateRoomTitle(e.target.value)}
            className="quest-input"
            style={{ width: "100%", marginBottom: 20, padding: 8 }}
          />

          <Button variant="primary" onClick={() => setStep(2)} style={{ width: "100%", marginTop: 10 }}>
            Далее: настройки →
          </Button>
        </div>
      </div>

      <h3 style={{ marginTop: 40, marginBottom: 20 }}>
        Вопросы по зонам (Комната: {currentRoom.template.name})
      </h3>

      {currentRoom.template.sceneData
        .filter((zone) => zone.name.trim().toLowerCase() !== "door" && zone.name.trim().toLowerCase() !== "дверь")
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
            Зона: {renameMap[zone.name] || zone.name}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
            <select
              value={currentRoom.questions[zone.name]?.type}
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
                                { 
                                  id: crypto.randomUUID(), 
                                  questionId: "",
                                  text: "", 
                                  isCorrect: false,
                                  matchPair: null,
                                  sequenceOrder: null,
                                  orderIndex: 0 
                                },
                                { 
                                  id: crypto.randomUUID(), 
                                  questionId: "",
                                  text: "", 
                                  isCorrect: false,
                                  matchPair: null,
                                  sequenceOrder: null,
                                  orderIndex: 1 
                                }
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

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <label style={{
              padding: "6px 12px",
              background: "rgba(255,107,53,0.1)",
              color: "var(--color-orange)",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}>
              🖼️ Прикрепить изображение
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadImage(file);
                    setRooms(prev => {
                      const newRooms = [...prev];
                      newRooms[currentRoomIndex] = {
                        ...newRooms[currentRoomIndex],
                        questions: {
                          ...newRooms[currentRoomIndex].questions,
                          [zone.name]: {
                            ...newRooms[currentRoomIndex].questions[zone.name],
                            attachment: url
                          }
                        }
                      };
                      return newRooms;
                    });
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
              />
            </label>
            {currentRoom.questions[zone.name]?.attachment && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={currentRoom.questions[zone.name].attachment!}
                  alt="attachment"
                  style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
                />
                <button
                  onClick={() => {
                    setRooms(prev => {
                      const newRooms = [...prev];
                      newRooms[currentRoomIndex] = {
                        ...newRooms[currentRoomIndex],
                        questions: {
                          ...newRooms[currentRoomIndex].questions,
                          [zone.name]: {
                            ...newRooms[currentRoomIndex].questions[zone.name],
                            attachment: undefined
                          }
                        }
                      };
                      return newRooms;
                    });
                  }}
                  style={{
                    background: "none", border: "none", color: "#dc3545",
                    cursor: "pointer", fontSize: 16, padding: 4,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

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

          {/* Для типов text_input и number_input - поле ввода правильного ответа */}
          {currentRoom.questions[zone.name] && ["text_input", "number_input"].includes(
            currentRoom.questions[zone.name]?.type
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
                      : [{ 
                          id: crypto.randomUUID(), 
                          questionId: "",
                          text: e.target.value, 
                          isCorrect: true,
                          matchPair: null,
                          sequenceOrder: null,
                          orderIndex: 0 
                        }];
                    
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

          {/* Варианты ответа */}
          {currentRoom.questions[zone.name] && ["single_choice", "multiple_choice"].includes(
            currentRoom.questions[zone.name]?.type
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
                    type={
                      currentRoom.questions[zone.name]?.type === "single_choice"
                        ? "radio"
                        : "checkbox"
                    }
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
                                o.id === option.id
                                  ? { ...o, text: e.target.value }
                                  : o
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

                  <label style={{
                    padding: "4px 8px",
                    background: "rgba(69,183,209,0.1)",
                    color: "var(--color-sky)",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    🖼️
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImage(file);
                          setRooms(prev => {
                            const newRooms = [...prev];
                            newRooms[currentRoomIndex] = {
                              ...newRooms[currentRoomIndex],
                              questions: {
                                ...newRooms[currentRoomIndex].questions,
                                [zone.name]: {
                                  ...newRooms[currentRoomIndex].questions[zone.name],
                                  answerOptions: (newRooms[currentRoomIndex].questions[zone.name].answerOptions || []).map(o =>
                                    o.id === option.id ? { ...o, attachment: url } : o
                                  )
                                }
                              }
                            };
                            return newRooms;
                          });
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                    />
                  </label>
                  {option.attachment && (
                    <img src={option.attachment} alt="opt" style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
                  )}

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
      </>)}
      {step === 2 && (
        <div style={{
          maxWidth: 500, margin: "0 auto",
          display: "flex", flexDirection: "column", gap: 20,
          padding: 32, borderRadius: 20,
          border: "2px solid rgba(255,107,53,0.1)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(255,107,53,0.08)",
        }}>
          <h2 style={{ margin: 0, textAlign: "center", color: "var(--color-orange)", fontSize: 24 }}>
            ⚙️ Настройки квеста
          </h2>
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14, margin: 0 }}>
            Выбери сложность, видимость и статус перед публикацией
          </p>

          {/* Difficulty */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              🎯 Сложность
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "Easy", label: "🟢 Лёгкий", desc: "Базовые вопросы" },
                { value: "Medium", label: "🟡 Средний", desc: "Стандартный уровень" },
                { value: "Hard", label: "🔴 Сложный", desc: "Повышенная сложность" },
              ].map((opt) => (
                <div key={opt.value} onClick={() => setQuestData(prev => ({ ...prev, difficulty: opt.value }))}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s",
                    border: questData.difficulty === opt.value ? "2px solid var(--color-orange)" : "2px solid var(--color-border)",
                    background: questData.difficulty === opt.value ? "rgba(255,107,53,0.08)" : "transparent",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              📋 Статус
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "Draft", label: "📝 Черновик", desc: "Сохранить без публикации" },
                { value: "Published", label: "🌍 Опубликован", desc: "Сразу доступен всем" },
              ].map((opt) => (
                <div key={opt.value} onClick={() => setQuestData(prev => ({ ...prev, status: opt.value }))}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s",
                    border: questData.status === opt.value ? "2px solid var(--color-orange)" : "2px solid var(--color-border)",
                    background: questData.status === opt.value ? "rgba(255,107,53,0.08)" : "transparent",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>
              👁️ Видимость
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "Public" as const, label: "🌍 Публичный", desc: "Видно всем пользователям" },
                { value: "Private" as const, label: "🔒 Приватный", desc: "Только вам и по ссылке" },
              ].map((opt) => (
                <div key={opt.value} onClick={() => setQuestData(prev => ({ ...prev, visibility: opt.value }))}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
                    textAlign: "center", transition: "all 0.2s",
                    border: questData.visibility === opt.value ? "2px solid var(--color-orange)" : "2px solid var(--color-border)",
                    background: questData.visibility === opt.value ? "rgba(255,107,53,0.08)" : "transparent",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{
            padding: 16, borderRadius: 12,
            background: "rgba(255,107,53,0.05)",
            border: "1px solid rgba(255,107,53,0.1)",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>
              📊 Сводка
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
              <div>📚 Предмет: <strong>{questData.subject || "не указан"}</strong></div>
              <div>🏠 Комнат: <strong>{rooms.length}</strong></div>
              <div>❓ Всего вопросов: <strong>{rooms.reduce((sum, r) => sum + Object.keys(r.questions).length, 0)}</strong></div>
              <div>🎯 Сложность: <strong>{questData.difficulty === "Easy" ? "Лёгкая" : questData.difficulty === "Medium" ? "Средняя" : "Сложная"}</strong></div>
              <div>📋 Статус: <strong>{questData.status === "Draft" ? "Черновик" : "Опубликован"}</strong></div>
              <div>👁️ Видимость: <strong>{questData.visibility === "Public" ? "Публичный" : "Приватный"}</strong></div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
              ← Назад
            </Button>
            <Button variant="primary" onClick={createQuest} style={{ flex: 2, fontSize: 16, padding: "14px 0" }}>
              🚀 Создать квест
            </Button>
          </div>
        </div>
      )}

    </div>
      </RoleGuard>
    );
  }

