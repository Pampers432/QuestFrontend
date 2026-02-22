"use client";

import { useEffect, useState, useRef } from "react";
import { RoomTemplate } from "@/Entities/RoomTemplate";

type AnswerOptionType = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuestionState = {
  text: string;
  type: string;
  answerOptions: AnswerOptionType[];
};

export default function CreateQuest() {
  const [template, setTemplate] = useState<RoomTemplate | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const [questions, setQuestions] = useState<{
    [key: string]: QuestionState;
  }>({});

  const [questData, setQuestData] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "Easy",
    status: "Draft"
  });

  const addOption = (zoneName: string) => {
    setQuestions(prev => ({
      ...prev,
      [zoneName]: {
        ...prev[zoneName],
        answerOptions: [
          ...prev[zoneName].answerOptions,
          { id: crypto.randomUUID(), text: "", isCorrect: false }
        ]
      }
    }));
  };

  const removeOption = (zoneName: string, optionId: string) => {
    setQuestions(prev => ({
      ...prev,
      [zoneName]: {
        ...prev[zoneName],
        answerOptions: prev[zoneName].answerOptions.filter(o => o.id !== optionId)
      }
    }));
  };

  const toggleCorrect = (zoneName: string, optionId: string) => {
    setQuestions(prev => {
      const question = prev[zoneName];

      if (question.type === "single_choice") {
        return {
          ...prev,
          [zoneName]: {
            ...question,
            answerOptions: question.answerOptions.map(o => ({
              ...o,
              isCorrect: o.id === optionId
            }))
          }
        };
      }

      return {
        ...prev,
        [zoneName]: {
          ...question,
          answerOptions: question.answerOptions.map(o =>
            o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
          )
        }
      };
    });
  };

  const questionTypes = [
    { value: "single_choice", label: "Один вариант ответа" },
    { value: "multiple_choice", label: "Несколько вариантов ответа" },
    { value: "text_input", label: "Текстовый ответ" },
    { value: "number_input", label: "Числовой ответ" },
    { value: "matching", label: "Сопоставление" },
    { value: "sequence", label: "Последовательность" }
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
    const saved = localStorage.getItem("selectedTemplate");

    if (saved) {
      const parsed = JSON.parse(saved) as RoomTemplate;
      setTemplate(parsed);

      const initial: any = {};

      parsed.sceneData.forEach((z) => {
        // Показываем все зоны, включая door
        initial[z.name] = {
          text: "",
          type: "single_choice",
          answerOptions: [
            { id: crypto.randomUUID(), text: "", isCorrect: false },
            { id: crypto.randomUUID(), text: "", isCorrect: false }
          ]
        };
      });

      setQuestions(initial);
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

  if (!template) {
    return <div className="page-container">Шаблон не найден</div>;
  }

  // Масштабирование зон
  const displayWidth = 600;

  return (
    <div className="page-container">
      <h1 className="page-title">Создание квеста</h1>
      <h2 className="page-subtitle">Шаблон: {template.name}</h2>

      <div style={{ display: "flex", gap: 40 }}>
        {/* Превью комнаты */}
        <div className="room-preview-wrapper" style={{ position: "relative", width: displayWidth }}>
          <img
            ref={imageRef}
            src={`https://localhost:7240${template.previewImageUrl}`}
            alt="preview"
            className="room-preview"
            onLoad={handleImageLoad}
            style={{ width: "100%", height: "auto" }}
          />

          {/* Зоны */}
          {imageSize.width > 0 && template.sceneData.map((zone) => {
            // Вычисляем масштаб от натурального размера к отображаемому
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
        <div className="quest-form">
          <input
            name="title"
            placeholder="Название квеста"
            value={questData.title}
            onChange={handleChange}
            className="quest-input"
          />

          <textarea
            name="description"
            placeholder="Описание"
            value={questData.description}
            onChange={handleChange}
            className="quest-textarea"
          />

          <input
            name="subject"
            placeholder="Предмет"
            value={questData.subject}
            onChange={handleChange}
            className="quest-input"
          />

          <select
            name="difficulty"
            value={questData.difficulty}
            onChange={handleChange}
            className="quest-select"
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
          >
            <option value="Draft">Черновик</option>
            <option value="Published">Опубликован</option>
            <option value="Archived">Архив</option>
          </select>

          <button className="btn">Создать квест</button>
        </div>
      </div>

      <h3 style={{ marginTop: 40 }}>Вопросы по зонам</h3>

      {template.sceneData
        .map(zone => (
          <div key={zone.name} className="question-card">
            <div className="question-card-title">Зона: {zone.name}</div>

            <select
              value={questions[zone.name]?.type}
              onChange={(e) =>
                setQuestions(prev => ({
                  ...prev,
                  [zone.name]: {
                    ...prev[zone.name],
                    type: e.target.value,
                    answerOptions: e.target.value === "single_choice" || e.target.value === "multiple_choice"
                      ? [
                          { id: crypto.randomUUID(), text: "", isCorrect: false },
                          { id: crypto.randomUUID(), text: "", isCorrect: false }
                        ]
                      : []
                  }
                }))
              }
              className="quest-select"
            >
              {questionTypes.map(qt => (
                <option key={qt.value} value={qt.value}>
                  {qt.label}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Введите текст вопроса"
              value={questions[zone.name]?.text || ""}
              onChange={(e) =>
                setQuestions(prev => ({
                  ...prev,
                  [zone.name]: {
                    ...prev[zone.name],
                    text: e.target.value
                  }
                }))
              }
              className="quest-textarea"
            />

            {/* Варианты ответа */}
            {questions[zone.name] && ["single_choice", "multiple_choice"].includes(
              questions[zone.name]?.type
            ) && (
              <div style={{ marginTop: 15 }}>
                {questions[zone.name]?.answerOptions.map(option => (
                  <div key={option.id} className="answer-row">
                    <input
                      type={
                        questions[zone.name]?.type === "single_choice"
                          ? "radio"
                          : "checkbox"
                      }
                      checked={option.isCorrect}
                      onChange={() => toggleCorrect(zone.name, option.id)}
                    />

                    <input
                      value={option.text}
                      placeholder="Текст варианта"
                      onChange={(e) =>
                        setQuestions(prev => ({
                          ...prev,
                          [zone.name]: {
                            ...prev[zone.name],
                            answerOptions: prev[zone.name].answerOptions.map(o =>
                              o.id === option.id
                                ? { ...o, text: e.target.value }
                                : o
                            )
                          }
                        }))
                      }
                      className="answer-input"
                    />

                    <button
                      onClick={() => removeOption(zone.name, option.id)}
                      className="btn-small"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addOption(zone.name)}
                  className="btn-small"
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