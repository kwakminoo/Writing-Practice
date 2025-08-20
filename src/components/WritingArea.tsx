"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import { Nanum_Myeongjo } from 'next/font/google';

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

function parseAIFeedback(feedback: string) {
  // 1. 감상 요약, 2. 좋았던 점, 3. 개선점, 4. 추천/제안, 5. 기술적 피드백
  const matches = feedback.match(/\d+\.\s[\s\S]*?(?=(\n\d+\.\s|$))/g);
  if (matches) {
    return matches.map(s => s.replace(/^\d+\.\s/, '').trim());
  }
  // fallback: 번호별 split
  const items = feedback.split(/\n?\s*\d+\.\s/).filter(Boolean);
  if (items.length && !feedback.trim().startsWith('1.')) {
    items[0] = '1. ' + items[0];
  }
  return items;
}

function renderList(text: string) {
  // '-'로 시작하는 리스트를 ul/li로 변환, 나머지는 그대로
  const lines = text.split(/\n|\r/);
  const items: string[] = [];
  let buffer: string[] = [];
  lines.forEach((line) => {
    if (line.trim().startsWith('-')) {
      if (buffer.length) items.push(buffer.join('\n'));
      buffer = [line.replace(/^\-\s*/, '')];
    } else if (buffer.length) {
      buffer.push(line);
    }
  });
  if (buffer.length) items.push(buffer.join('\n'));
  if (items.length > 0) {
    return (
      <ul className="list-disc pl-6">
        {items.map((item, idx) => (
          <li key={idx} style={{ whiteSpace: 'pre-line' }}>{item}</li>
        ))}
      </ul>
    );
  }
  // 리스트가 아니면 그냥 출력
  return <div style={{ whiteSpace: 'pre-line', overflowX: 'auto' }}>{text}</div>;
}

const FEEDBACK_LABELS = [
  '감상 요약',
  '좋았던 점',
  '개선이 가능한 부분',
  '추천 포인트/다음 제안',
  '기술적 피드백(선택)' // 5번째 항목은 선택적
];

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
        ? { content: text, category, practiceType }
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
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI 피드백 결과</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">전문가의 상세한 분석</p>
                  </div>
                </div>
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 별점 평가 테이블 스타일링
                      table: ({children, ...props}) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" {...props}>
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({children, ...props}) => (
                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" {...props}>
                          {children}
                        </thead>
                      ),
                      th: ({children, ...props}) => (
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700" {...props}>
                          {children}
                        </th>
                      ),
                      td: ({children, ...props}) => (
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800" {...props}>
                          {children}
                        </td>
                      ),
                      // 헤더 스타일링
                      h2: ({children, ...props}) => {
                        const text = children?.toString() || '';
                        if (text.includes('별점 평가')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 dark:text-yellow-400 text-sm"></span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('감상')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-sm"></span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('좋았던 점')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-sm"></span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('개선이 가능한 부분')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 dark:text-orange-400 text-sm"></span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('글 스타일 분석')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-400 text-sm"></span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('코멘트')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                                <span className="text-pink-600 dark:text-pink-400 text-sm"></span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        }
                        return (
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8" {...props}>
                            {children}
                          </h2>
                        );
                      },
                      // 리스트 스타일링
                      ul: ({children, ...props}) => (
                        <ul className="space-y-3 my-4" {...props}>
                          {children}
                        </ul>
                      ),
                      li: ({children, ...props}) => (
                        <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300" {...props}>
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{children}</span>
                        </li>
                      ),
                      // 단락 스타일링
                      p: ({children, ...props}) => (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" {...props}>
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {aiFeedback}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
    </form>
  );
} 