"use client";

import { useRouter } from "next/navigation";
import { TreeDoodle, CloudDoodle, SparkleDoodle, SunDoodle, PaintedDots } from "./Decorations";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="footer" style={{ position: "relative", overflow: "hidden" }}>
      <PaintedDots style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.12, filter: "invert(1)" }} />
      <CloudDoodle className="animate-float-slow" style={{ position: "absolute", top: "5%", right: "8%", width: "80px", opacity: 0.08 }} />
      <TreeDoodle className="animate-bounceSoft" style={{ position: "absolute", bottom: "10%", left: "2%", width: "50px", opacity: 0.08, animationDelay: "-1s" }} />
      <SunDoodle className="animate-slowSpin" style={{ position: "absolute", bottom: "15%", right: "5%", width: "40px", opacity: 0.08 }} />
      <SparkleDoodle className="animate-sparkle" style={{ position: "absolute", top: "20%", left: "15%", width: "16px", opacity: 0.1 }} />
      <div className="container-section" style={{ position: "relative", zIndex: 1 }}>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#96CEB4" />
                <ellipse cx="70" cy="80" rx="18" ry="22" fill="white" />
                <ellipse cx="130" cy="80" rx="18" ry="22" fill="white" />
                <ellipse cx="70" cy="80" rx="10" ry="14" fill="#2D3436" />
                <ellipse cx="130" cy="80" rx="10" ry="14" fill="#2D3436" />
                <ellipse cx="74" cy="76" rx="4" ry="5" fill="white" />
                <ellipse cx="134" cy="76" rx="4" ry="5" fill="white" />
                <path d="M75 115 C85 130, 115 130, 125 115" stroke="#2D3436" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="100" cy="45" r="6" fill="#FF6B35" />
              </svg>
              <span className="footer-logo-text">Quest Platform</span>
            </div>
            <p className="footer-desc">
              Интерактивная образовательная платформа для школьников и студентов. Готовься к экзаменам в игровом формате.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Платформа</h4>
            <ul className="footer-list">
              <li><button onClick={() => router.push("/Quests")} className="footer-link">Квесты</button></li>
              <li><button onClick={() => router.push("/Templates")} className="footer-link">Шаблоны</button></li>
              <li><button onClick={() => router.push("/Auth")} className="footer-link">Войти</button></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Помощь</h4>
            <ul className="footer-list">
              <li><button onClick={() => router.push("/Auth")} className="footer-link">FAQ</button></li>
              <li><button onClick={() => router.push("/Auth")} className="footer-link">Соглашение</button></li>
              <li><button onClick={() => router.push("/Auth")} className="footer-link">Поддержка</button></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Мы в соцсетях</h4>
            <div className="footer-social">
              {[
                { name: "VK", emoji: "📘" },
                { name: "TG", emoji: "✈️" },
                { name: "Discord", emoji: "🎮" },
              ].map((s) => (
                <span key={s.name} className="footer-social-btn" title={s.name}>
                  {s.emoji}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Quest Platform. Все права защищены.</p>
          <div className="footer-stores">
            <span className="footer-store-badge link-doodle-ghost">App Store</span>
            <span className="footer-store-badge link-doodle-ghost">Google Play</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
