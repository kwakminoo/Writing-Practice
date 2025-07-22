"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
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
      className="fixed bottom-6 right-6 z-50 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
} 