"use client";

import SectionTitle from "./SectionTitle";
import { CloudDoodle, SparkleDoodle, PaintedDots } from "./Decorations";

const testimonials = [
  {
    text: "Готовился к ЕГЭ по математике через квизы — результат 92 балла! Очень удобно, что можно решать задачи прямо на сайте и сразу видеть ошибки. Серии заданий реально помогают не забывать пройденное.",
    author: "Дмитрий",
    from: "Казань",
    tag: "11 класс, сдал ЕГЭ на 92",
    rating: 5,
  },
  {
    text: "Мы с одноклассниками устроили челлендж — кто быстрее пройдёт тему по физике. Очень затягивает! Не ожидала, что учёба может быть такой увлекательной. Теперь каждый день захожу поддерживать серию.",
    author: "Алина",
    from: "Москва",
    tag: "9 класс",
    rating: 5,
  },
  {
    text: "На первом курсе универа информатика шла тяжело, пока не нашёл этот сервис. Задания по программированию с автоматической проверкой — просто спасение. Понятнее, чем лекции.",
    author: "Илья",
    from: "Новосибирск",
    tag: "1 курс НГТУ",
    rating: 5,
  },
  {
    text: "Использую на своих уроках английского. Ребята в восторге, особенно от соревновательного режима. Успеваемость выросла на 35% за полугодие!",
    author: "Екатерина Андреевна",
    from: "Санкт-Петербург",
    tag: "Учитель английского",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="section-default section-bg-white overflow-hidden" style={{ position: "relative" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.25 }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "5%", left: "3%", width: "90px", opacity: 0.2 }} />
      <CloudDoodle className="animate-float" style={{ position: "absolute", bottom: "8%", right: "5%", width: "60px", opacity: 0.15, animationDelay: "-2s" }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "30%", left: "8%", width: "20px", opacity: 0.5 }} />
      <div className="container-medium" style={{ position: "relative", zIndex: 1 }}>
        <SectionTitle subtitle="Больше 1 400 000 студентов и школьников уже используют платформу">
          👨‍🎓 Вы в хорошей компании
        </SectionTitle>

        <div className="scroll-row">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card"
              style={{ animation: `fadeInUp 0.6s ease ${i * 0.15}s forwards`, opacity: 0 }}
            >
              <div className="testimonial-rating">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j}>⭐</span>
                ))}
              </div>
              <p className="testimonial-text">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="testimonial-author">{t.author}</p>
                <p className="testimonial-meta">{t.from}</p>
                <p className="testimonial-meta tag-teal">{t.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
