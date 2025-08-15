"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Phase B1 - DarkModeToggle 리팩터링
// Zod + React Hook Form 검증 추가, 에러/로딩/빈 상태 명시

// 다크모드 설정 스키마
const DarkModeSettingsSchema = z.object({
  isDark: z.boolean(),
  autoDetect: z.boolean().optional(),
});

type DarkModeSettings = z.infer<typeof DarkModeSettingsSchema>;

interface DarkModeToggleProps {
  className?: string;
  onToggle?: (isDark: boolean) => void;
}

export default function DarkModeToggle({ className = "", onToggle }: DarkModeToggleProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<DarkModeSettings>({
    resolver: zodResolver(DarkModeSettingsSchema),
    defaultValues: {
      isDark: false,
      autoDetect: true,
    },
  });

  // 초기 다크모드 상태 로드
  useEffect(() => {
    const loadDarkModeState = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (typeof window !== "undefined") {
          const isDarkMode = document.documentElement.classList.contains("dark");
          setIsDark(isDarkMode);
        }
      } catch (err) {
        setError("다크모드 상태를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDarkModeState();
  }, []);

  const toggleDarkMode = handleSubmit((data) => {
    try {
      setError(null);
      
      if (typeof window !== "undefined") {
        const newDarkMode = !isDark;
        document.documentElement.classList.toggle("dark");
        setIsDark(newDarkMode);
        
        // 콜백 호출
        onToggle?.(newDarkMode);
        
        // 로컬 스토리지에 설정 저장
        localStorage.setItem("darkMode", newDarkMode.toString());
      }
    } catch (err) {
      setError("다크모드 전환 중 오류가 발생했습니다.");
    }
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <button
        aria-label="다크모드 로딩 중"
        disabled
        className={`fixed bottom-6 right-6 z-50 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-3 shadow-lg opacity-50 cursor-not-allowed ${className}`}
      >
        ⏳
      </button>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <button
        aria-label="다크모드 오류"
        onClick={() => setError(null)}
        className={`fixed bottom-6 right-6 z-50 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full p-3 shadow-lg hover:bg-red-300 dark:hover:bg-red-700 transition-colors ${className}`}
      >
        ⚠️
      </button>
    );
  }

  // 폼 에러 표시
  if (errors.isDark) {
    return (
      <button
        aria-label="다크모드 설정 오류"
        disabled
        className={`fixed bottom-6 right-6 z-50 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full p-3 shadow-lg opacity-50 cursor-not-allowed ${className}`}
      >
        ❌
      </button>
    );
  }

  return (
    <button
      aria-label="다크모드 토글"
      onClick={toggleDarkMode}
      className={`fixed bottom-6 right-6 z-50 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full p-3 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${className}`}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
} 