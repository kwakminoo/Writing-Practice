"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import { supabase } from '../lib/index';
import { Nanum_Myeongjo } from 'next/font/google';
import AIFeedbackRenderer from './AIFeedbackRenderer';

// 소설용 폰트는 모듈 스코프에서 로드해야 함 (Next.js 규칙)
const novelFont = Nanum_Myeongjo({ subsets: ['latin'], weight: ['400', '700', '800'] });

interface WritingAreaProps {
  category: string; // 예: 소설, 시 등
  practiceType?: string; // 예: daily, theme, copy 등
  isFreeWriting?: boolean; // 자유 글쓰기 모드인지 여부
  problemId?: string; // 연습문제 ID (연습문제 모드일 때)
  problemPrompt?: string; // 연습문제 프롬프트 (연습문제 모드일 때)
}

function isCopyType(category: string) {
  // '필사', 'copy' 등 필사 유형 감지
  return category === '필사' || category.toLowerCase().includes('copy');
}

export default function WritingArea({ category, practiceType, isFreeWriting = false, problemId, problemPrompt }: WritingAreaProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [title, setTitle] = useState(""); // 제목 상태 추가
  const [lastFeedbackText, setLastFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [basicFeedback, setBasicFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loadingDots, setLoadingDots] = useState<string>("");
  // 피드백 타입 초기값을 'basic'으로 변경
  const [feedbackType, setFeedbackType] = useState<'ai' | 'basic'>('basic');
  
  // 맞춤법 검사 관련 상태 복구
  const [spellCheckResult, setSpellCheckResult] = useState<string | null>(null);
  const [spellCheckLoading, setSpellCheckLoading] = useState(false);
  const [showSpellCheck, setShowSpellCheck] = useState(false);

  // 피드백 요청 중 상태 추가
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text, category]);

  // 글이 바뀌거나 피드백 타입이 바뀌면 피드백 버튼 다시 활성화
  useEffect(() => {
    const currentFeedbackKey = `${text}_${feedbackType}`;
    if (currentFeedbackKey !== lastFeedbackText) {
      setSubmitted(false);
      setAiFeedback(null);
      setBasicFeedback(null);
      setError(null);
    }
  }, [text, lastFeedbackText, feedbackType]);

  useEffect(() => {
    if (!loading) {
      setLoadingDots("");
      return;
    }
    let i = 0;
    const seq = [".", " ..", " ...", " .", " ..", " ..."];
    const interval = setInterval(() => {
      setLoadingDots(seq[i % seq.length]);
      i++;
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setAiFeedback(null);
    setBasicFeedback(null);
    setError(null);
    setLoading(true);
    
    try {
      // 사용자 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 1. 피드백 요청
      const endpoint = feedbackType === 'ai' ? "/api/ai-feedback" : "/api/basic-feedback";
      const body = feedbackType === 'ai' 
        ? { content: text, category, practiceType, problemPrompt: isFreeWriting ? title : problemPrompt }
        : { content: text, category };
        
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      
      if (data.error === 'Insufficient coins') {
        setError(
          <div className="text-red-600 dark:text-red-400">
            {data.message || '코인이 부족합니다.'}
            <br />
            <Link href="/coins" className="text-blue-600 hover:text-blue-700 underline">
              코인 충전하기 →
            </Link>
          </div>
        );
        setLoading(false);
        return;
      }
      
      if (data.feedback || data.result) {
        if (feedbackType === 'ai') {
          setAiFeedback(data.feedback || data.result);
          // AI 피드백을 받은 후 코인 잔액 새로고침
          if (typeof window !== 'undefined' && (window as any).refreshCoinBalance) {
            (window as any).refreshCoinBalance();
          }
        } else {
          setBasicFeedback(data.result);
        }
        
        // 2. 글 저장 (피드백이 성공적으로 받아진 경우에만)
        if (user) {
          try {
            const saveRes = await fetch("/api/user-writings", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                user_id: user.id,
                content: problemPrompt ? `문제: ${problemPrompt}\n\n작성글: ${text}` : text,
                title: isFreeWriting ? title : category, // 연습 방식 이름을 제목으로 사용
                type: practiceType || category,
                problem_id: problemId, // 연습문제 ID가 있으면 저장
              }),
            });
            
            if (!saveRes.ok) {
              const errorData = await saveRes.json();
              console.error('글 저장 실패:', saveRes.status, errorData);
            }
          } catch (saveErr) {
            console.error('글 저장 중 오류:', saveErr);
          }
        }
        
        // 피드백 타입과 함께 저장하여 타입 변경 시 감지
        setLastFeedbackText(`${text}_${feedbackType}`);
      } else {
        setError(data.error || `${feedbackType === 'ai' ? 'AI' : '기본'} 피드백을 받아오지 못했습니다.`);
      }
    } catch (err) {
      setError(`${feedbackType === 'ai' ? 'AI' : '기본'} 서버 요청 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSpellCheck = async () => {
    setSpellCheckLoading(true);
    setSpellCheckResult(null);
    setShowSpellCheck(true);
    try {
      const res = await fetch("/api/spell-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.result) {
        setSpellCheckResult(data.result);
      } else {
        setSpellCheckResult("맞춤법 검사에 실패했습니다.");
      }
    } catch (err) {
      setSpellCheckResult("맞춤법 검사 중 오류가 발생했습니다.");
    } finally {
      setSpellCheckLoading(false);
    }
  };

  // 필사 유형이면 제출/피드백 버튼 숨김
  if (isCopyType(category)) {
    return (
      <textarea
        ref={textareaRef}
        className={`${novelFont.className} w-full max-w-3xl min-h-[400px] rounded-lg border border-gray-300 dark:border-gray-700 p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y`}
        style={{ overflow: "hidden" }}
        placeholder={`${category} 글을 입력하세요...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={10}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-3xl mx-auto">
      {/* 자유 글쓰기일 때만 제목 입력 필드 표시 */}
      {isFreeWriting && (
        <div className="w-full max-w-3xl mx-auto">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="글의 제목을 입력하세요..."
            className={`${novelFont.className} antialiased w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white`}
            style={{ textRendering: "optimizeLegibility" }}
            required
          />
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        className={`${novelFont.className} antialiased w-full max-w-3xl min-h-[400px] rounded-lg border border-gray-300 dark:border-gray-700 p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y`}
        style={{ overflow: "hidden", textRendering: "optimizeLegibility" }}
        placeholder={`${category} 글을 입력하세요...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={10}
      />
      
      {/* 피드백 타입 선택 UI 순서 변경 및 비활성화 처리 */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={`px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 font-semibold transition-colors ${feedbackType === 'basic' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'} ${feedbackLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={feedbackLoading ? undefined : () => setFeedbackType('basic')}
          disabled={feedbackLoading}
        >
          기본분석
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 font-semibold transition-colors ${feedbackType === 'ai' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'} ${feedbackLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={feedbackLoading ? undefined : () => setFeedbackType('ai')}
          disabled={feedbackLoading}
        >
          AI 피드백
        </button>
      </div>
      
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="self-end bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2 transition-colors shadow"
          disabled={loading || submitted || text.trim() === '' || `${text}_${feedbackType}` === lastFeedbackText}
        >
          {loading ? `${feedbackType === 'ai' ? 'AI' : '기본'} 피드백 생성 중${loadingDots}` : '피드백 받기'}
        </button>
      </div>

      {aiFeedback && !loading && (
        <div className="mt-6 max-w-4xl mx-auto w-full">
          <AIFeedbackRenderer feedback={aiFeedback} />
        </div>
      )}
    </form>
  );
} 