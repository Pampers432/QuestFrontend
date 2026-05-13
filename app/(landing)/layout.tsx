import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./landing.css";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-nunito",
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Alien Quest — Развитие и обучение детей в игровой форме",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${nunito.variable} font-headline`}>
      {children}
    </div>
  );
}
