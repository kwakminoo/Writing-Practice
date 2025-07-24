"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { name: "홈", href: "/" },
  { name: "연습 모드", href: "/practice-modes" },
  { name: "AI 피드백", href: "/ai-feedback" },
  { name: "소개", href: "/about" },
  { name: "로그인", href: "/login" },
];

function DarkModeToggleInline() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark");
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  };

  return (
    <button
      aria-label="다크모드 토글"
      onClick={toggleDarkMode}
      className="ml-2 text-lg px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? "라이트 모드" : "다크 모드"}
      type="button"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 shadow-sm sticky top-0 z-30 backdrop-blur">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-xl font-bold text-blue-700 dark:text-blue-300">글쓰기 훈련소</Link>
        <DarkModeToggleInline />
      </div>
      <ul className="flex gap-4 text-base font-medium">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
} 