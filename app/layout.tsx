import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Звон Чёрной Луны — DnD-приключение на 60 минут",
  description: "Готовое часовое фэнтези-приключение о древнем колоколе, горном городе и цене нарушенного договора — с картами, карточками, инициативой и d20.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/dark-fantasy-dnd/favicon.svg",
    shortcut: "/dark-fantasy-dnd/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
