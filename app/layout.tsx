import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Quest Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: "var(--font-inter)" }}>
        <ToastProvider>
          <NavbarWrapper />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

