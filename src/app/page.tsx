"use client";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 px-4 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-center text-gray-900 dark:text-white">글쓰기 훈련소</h1>
      {user ? (
        <>
          <p className="text-lg sm:text-xl text-center text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
            안녕하세요, {user.name || user.email}님!<br />
            오늘도 멋진 글을 써보세요.
          </p>
          <div className="flex gap-4 mb-8">
            <Link href="/practice-modes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
              연습 시작하기
            </Link>
            <Link href="/profile" className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
              프로필 보기
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-lg sm:text-xl text-center text-gray-700 dark:text-gray-300 mb-8 max-w-xl">
            다양한 장르의 글쓰기를 연습하고, AI 피드백을 받아보세요.<br />
            소설, 시나리오, 시, 에세이 등 원하는 방식으로 자유롭게 글을 써보세요.
          </p>
          <div className="flex gap-4 mb-8">
            <Link href="/practice-modes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
              연습 시작하기
            </Link>
            <Link href="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-8 py-3 transition-colors shadow-lg">
              로그인/회원가입
            </Link>
          </div>
        </>
      )}
      <div className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>AI 피드백, 다크모드, 모바일 지원</span>
      </div>
    </div>
  );
}