"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from '../lib/index';
import { UserSubscription } from "../types/subscription";

export default function Navbar() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [userCoins, setUserCoins] = useState<number>(0);
  
  const navItems = [
    { name: "홈", href: "/" },
    { name: "연습 모드", href: "/practice-modes" },
    { name: "책갈피", href: "/bookmarks" },
    { name: "구독", href: "/subscription" },
    { name: "소개", href: "/about" },
  ];

  // 구독 정보 및 코인 정보 조회
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

  const { data: coinBalance } = useQuery<number>({
    queryKey: ["coin-balance", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnMount: true,
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 조회 비활성화
    refetchInterval: false, // 자동 반복 조회 비활성화
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return 0;
      const res = await fetch('/api/coins/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        console.log('코인 잔액 조회 성공:', json.balance);
        return json.balance ?? 0;
      } else {
        console.error('코인 잔액 조회 실패:', json.error);
        return 0;
      }
    },
  });

  // coinBalance가 변경될 때 userCoins 상태 업데이트
  useEffect(() => {
    if (coinBalance !== undefined) {
      setUserCoins(coinBalance);
    }
  }, [coinBalance]);

  // 코인 잔액을 수동으로 새로고침하는 함수
  const refreshCoinBalance = () => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["coin-balance", user.id] });
    }
  };

  // 전역에서 사용할 수 있도록 window 객체에 함수 등록
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshCoinBalance = refreshCoinBalance;
    }
  }, [user?.id, queryClient]);

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
      'coin': '코인',
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
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs font-medium">
              <span className="text-yellow-800 dark:text-yellow-200">{userCoins}코인</span>
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