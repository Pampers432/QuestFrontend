"use client";

import { useState, useEffect } from "react";
import SectionTitle from "./SectionTitle";
import { CloudDoodle, SparkleDoodle, PaintedDots } from "./Decorations";

const testimonials = [
  {
    text: "Готовился к ЕГЭ по математике через квизы — результат 92 балла! Очень удобно, что можно решать задачи прямо на сайте и сразу видеть ошибки. Серии заданий реально помогают не забывать пройденное.",
    author: "Дмитрий", from: "Казань", tag: "11 класс, сдал ЕГЭ на 92", rating: 5,
  },
  {
    text: "Мы с одноклассниками устроили челлендж — кто быстрее пройдёт тему по физике. Очень затягивает! Не ожидала, что учёба может быть такой увлекательной.",
    author: "Алина", from: "Москва", tag: "9 класс", rating: 5,
  },
  {
    text: "На первом курсе универа информатика шла тяжело, пока не нашёл этот сервис. Задания по программированию с автоматической проверкой — просто спасение.",
    author: "Илья", from: "Новосибирск", tag: "1 курс НГТУ", rating: 5,
  },
  {
    text: "Использую на своих уроках английского. Ребята в восторге, особенно от соревновательного режима. Успеваемость выросла на 35% за полугодие!",
    author: "Екатерина Андреевна", from: "Санкт-Петербург", tag: "Учитель английского", rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goTo = (i: number) => setCurrent(i);

  return (
    <section className="section-default section-bg-white overflow-hidden" style={{ position: "relative" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.25 }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "5%", left: "3%", width: "90px", opacity: 0.2 }} />
      <CloudDoodle className="animate-float" style={{ position: "absolute", bottom: "8%", right: "5%", width: "60px", opacity: 0.15, animationDelay: "-2s" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "30%", left: "8%", width: "20px", opacity: 0.5 }} />
      <div className="container-medium" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Больше 1 400 000 студентов и школьников уже используют платформу">
          👨‍🎓 Вы в хорошей компании
        </SectionTitle>

        {/* Carousel */}
        <div style={{ position: "relative", maxWidth: "500px", margin: "0 auto", minHeight: "280px" }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card"
              style={{
                position: "absolute", width: "100%",
                opacity: current === i ? 1 : 0,
                transform: current === i ? "translateX(0) scale(1)" : i < current ? "translateX(-100%) scale(0.9)" : "translateX(100%) scale(0.9)",
                transition: "all 0.5s ease",
                pointerEvents: current === i ? "auto" : "none",
                zIndex: current === i ? 1 : 0,
              }}
            >
              <div className="testimonial-rating">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} style={{
                    display: "inline-block",
                    background: "linear-gradient(90deg, #FFD700, #FFA500)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% 100%",
                    animation: "gradientShift 2s ease infinite",
                  }}>★</span>
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div>
                <p className="testimonial-author">{t.author}</p>
                <p className="testimonial-meta">{t.from}</p>
                <p className="testimonial-meta tag-teal">{t.tag}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: "10px", height: "10px", borderRadius: "50%",
                border: "none", cursor: "pointer", padding: 0,
                background: current === i ? "var(--color-orange)" : "rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                transform: current === i ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
