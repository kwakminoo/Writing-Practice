"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { UserSubscription } from "../types/subscription";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  
  const navItems = [
    { name: "홈", href: "/" },
    { name: "연습 모드", href: "/practice-modes" },
    { name: "책갈피", href: "/bookmarks" },
    { name: "구독", href: "/subscription" },
    { name: "소개", href: "/about" },
  ];

  // 구독 정보 조회
  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo();
    }
  }, [user]);

  const fetchSubscriptionInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('subscription_status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('구독 정보 조회 오류:', error);
        return;
      }

      setCurrentSubscription(data);
    } catch (err) {
      console.error('구독 정보 조회 중 오류:', err);
    }
  };

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

  const getSubscriptionDisplay = () => {
    if (!currentSubscription) return '무료';
    const planNames = {
      'free': '무료',
      'basic': '베이직',
      'premium': '프리미엄'
    };
    return planNames[currentSubscription.subscription_type] || '무료';
  };

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
        {user ? (
          <li className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              안녕하세요, {user.name || user.email}님
            </span>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium">
              <span className="text-blue-800 dark:text-blue-200">💎</span>
              <span className="text-blue-800 dark:text-blue-200">{getSubscriptionDisplay()}</span>
            </div>
            <Link
              href="/profile"
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              프로필
            </Link>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          </li>
        ) : (
          <li>
            <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              로그인
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
} 