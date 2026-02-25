"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RoomTemplate } from "@/Entities/RoomTemplate";
import { CreateQuestRequest, CreateQuestRoomRequest, CreateQuestionRequest, CreateAnswerOptionRequest } from "@/Entities/Dto";
import { Question } from "@/Entities/Question";
import { AnswerOption } from "@/Entities/AnswerOption";

type LocalQuestionState = {
  text: string;
  type: string;
  points: number;
  hint: string;
  answerOptions: (AnswerOption & { id: string })[];
};

type LocalRoomData = {
  template: RoomTemplate;
  title?: string;
  questions: {
    [key: string]: LocalQuestionState;
  };
};

export default function CreateQuest() {
  const router = useRouter();
  const [rooms, setRooms] = useState<LocalRoomData[]>([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "Easy",
    status: "Draft"
  });

  const addOption = (zoneName: string) => {
    setRooms(prev => {
      const newRooms = [...prev];
      const currentRoom = newRooms[currentRoomIndex];
      const currentOptions = currentRoom.questions[zoneName]?.answerOptions || [];
      
      const newOption: AnswerOption & { id: string } = {
        id: crypto.randomUUID(),
        questionId: "", // будет заполнено при создании
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
            answerOptions: currentRoom.questions[zoneName].answerOptions
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
              answerOptions: question.answerOptions.map(o => ({
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
              answerOptions: question.answerOptions.map(o =>
                o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
              )
            }
          }
        };
      }
      
      return newRooms;
    });
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
    const saved = localStorage.getItem("selectedTemplates");

    if (saved) {
      const parsed = JSON.parse(saved) as RoomTemplate[];
      
      const initialRooms: LocalRoomData[] = parsed.map(template => {
        const initialQuestions: any = {};
        
        template.sceneData.forEach((z, index) => {
          initialQuestions[z.name] = {
            text: "",
            type: "single_choice",
            points: 10,
            hint: "",
            answerOptions: [
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
          };
        });
        
        return {
          template,
          title: template.name,
          questions: initialQuestions
        };
      });

      setRooms(initialRooms);
    }
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
    router.push('/Templates');
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
        if (!question.text.trim()) {
          alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не введен текст вопроса`);
          return false;
        }

        // Проверка вариантов ответа для типов с вариантами
        if (["single_choice", "multiple_choice"].includes(question.type)) {
          if (question.answerOptions.length < 2) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" должно быть минимум 2 варианта ответа`);
            return false;
          }

          // Проверка что все варианты заполнены
          const emptyOptions = question.answerOptions.filter(opt => !opt.text?.trim());
          if (emptyOptions.length > 0) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" есть пустые варианты ответа`);
            return false;
          }

          // Проверка что есть хотя бы один правильный ответ
          const hasCorrect = question.answerOptions.some(opt => opt.isCorrect);
          if (!hasCorrect) {
            alert(`В зоне "${zoneName}" комнаты "${room.template.name}" не выбран правильный ответ`);
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
      rooms: rooms.map((room, roomIndex): CreateQuestRoomRequest => ({
        roomTemplateId: room.template.id!,
        title: room.title,
        orderIndex: roomIndex,
        questions: Object.entries(room.questions).map(([zoneName, question], qIndex): CreateQuestionRequest => ({
          text: question.text,
          type: question.type,
          points: question.points,
          hint: question.hint || undefined,
          orderIndex: qIndex,
          answerOptions: question.answerOptions.map((opt, optIndex): CreateAnswerOptionRequest => ({
            text: opt.text || undefined,
            isCorrect: opt.isCorrect || false,
            orderIndex: optIndex
          }))
        }))
      }))
    };

    try {
      // Отправляем запрос на сервер
      const response = await fetch("https://localhost:7240/api/Quests/CreateQuest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  if (rooms.length === 0) {
    return <div className="page-container">Шаблоны не найдены</div>;
  }

  const currentRoom = rooms[currentRoomIndex];
  const displayWidth = 600;

  return (
    <div className="page-container">
      <h1 className="page-title">Создание квеста</h1>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Вертикальная панель с комнатами */}
        <div className="rooms-sidebar" style={{
          width: 120,
          height: 500,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10
        }}>
          {rooms.map((room, index) => (
            <div
              key={room.template.id}
              onClick={() => setCurrentRoomIndex(index)}
              className="room-thumbnail"
              style={{
                marginBottom: 10,
                cursor: "pointer",
                border: index === currentRoomIndex ? "2px solid #007bff" : "1px solid #ddd",
                borderRadius: 4,
                padding: 5,
                background: index === currentRoomIndex ? "#f0f7ff" : "white"
              }}
            >
              <img
                src={`https://localhost:7240${room.template.previewImageUrl}`}
                alt={room.template.name}
                style={{
                  width: "100%",
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 4
                }}
              />
              <div style={{ fontSize: 12, textAlign: "center", marginTop: 5 }}>
                {room.template.name}
              </div>
            </div>
          ))}

          {/* Кнопка добавления новой комнаты */}
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
        <div className="room-preview-wrapper" style={{ position: "relative", width: displayWidth }}>
          <img
            ref={imageRef}
            src={`https://localhost:7240${currentRoom.template.previewImageUrl}`}
            alt="preview"
            className="room-preview"
            onLoad={handleImageLoad}
            style={{ width: "100%", height: "auto" }}
          />

          {/* Зоны */}
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

          <input
            name="subject"
            placeholder="Предмет *"
            value={questData.subject}
            onChange={handleChange}
            className="quest-input"
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
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
            <option value="Archived">Архив</option>
          </select>

          <h3 style={{ marginBottom: 15 }}>Текущая комната</h3>
          
          <input
            placeholder="Название комнаты (необязательно)"
            value={currentRoom.title || ""}
            onChange={(e) => updateRoomTitle(e.target.value)}
            className="quest-input"
            style={{ width: "100%", marginBottom: 20, padding: 8 }}
          />

          <button 
            onClick={createQuest}
            className="btn"
            style={{ 
              width: "100%", 
              padding: 12, 
              background: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: 4, 
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold"
            }}
          >
            Создать квест
          </button>
        </div>
      </div>

      <h3 style={{ marginTop: 40, marginBottom: 20 }}>
        Вопросы по зонам (Комната: {currentRoom.template.name})
      </h3>

      {currentRoom.template.sceneData.map((zone, zoneIndex) => (
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
              value={currentRoom.questions[zone.name]?.type}
              onChange={(e) => {
                setRooms(prev => {
                  const newRooms = [...prev];
                  newRooms[currentRoomIndex] = {
                    ...newRooms[currentRoomIndex],
                    questions: {
                      ...newRooms[currentRoomIndex].questions,
                      [zone.name]: {
                        ...newRooms[currentRoomIndex].questions[zone.name],
                        type: e.target.value,
                        answerOptions: e.target.value === "single_choice" || e.target.value === "multiple_choice"
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

          {/* Варианты ответа */}
          {currentRoom.questions[zone.name] && ["single_choice", "multiple_choice"].includes(
            currentRoom.questions[zone.name]?.type
          ) && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: "bold", marginBottom: 10 }}>Варианты ответа:</div>
              
              {currentRoom.questions[zone.name]?.answerOptions.map(option => (
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
                              answerOptions: newRooms[currentRoomIndex].questions[zone.name].answerOptions.map(o =>
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

                  <button
                    onClick={() => removeOption(zone.name, option.id)}
                    className="btn-small"
                    style={{ 
                      padding: "5px 10px", 
                      background: "#dc3545", 
                      color: "white", 
                      border: "none", 
                      borderRadius: 4, 
                      cursor: "pointer" 
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => addOption(zone.name)}
                className="btn-small"
                style={{ 
                  padding: "8px 15px", 
                  background: "#28a745", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 4, 
                  cursor: "pointer",
                  marginTop: 5
                }}
              >
                + Добавить вариант
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}