"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

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
        className="w-full max-w-3xl min-h-[400px] rounded-lg border border-gray-300 dark:border-gray-700 p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y"
        style={{ overflow: "hidden" }}
        placeholder={`${category} 글을 입력하세요...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={10}
      />
    );
  }

  // AI 피드백 결과를 프롬프트 기반 카드형 리포트 스타일로 렌더링
  function renderAIFeedbackStyled(feedback: string) {
    // 별점 표 파싱: | 항목 | 별점 | 한 줄 평가 | 형식의 마크다운 표
    const starTableRegex = /\|\s*항목\s*\|\s*별점\s*\|\s*한 줄 평가\s*\|[\r\n]+\|[\s\S]*?\|[\r\n]+((\|[\s\S]*?\|[\r\n]+)+)/;
    const starRows: { item: string; star: string; comment: string }[] = [];
    const tableMatch = feedback.match(starTableRegex);
    if (tableMatch) {
      const lines = tableMatch[1].split(/\n|\r/).filter(l => l.trim().startsWith('|'));
      for (const line of lines) {
        const cells = line.split('|').map(cell => cell.trim());
        if (cells.length >= 4 && cells[1] && cells[2] && cells[3]) {
          starRows.push({ item: cells[1], star: cells[2], comment: cells[3] });
        }
      }
    }
    
    // 새로운 프롬프트 구조에 맞춰 섹션 파싱
    const sections: { [key: string]: string } = {};
    const patterns: { [key: string]: RegExp } = {
      '별점 평가': /## 1\. 별점 평가[\s\S]*?(?=## 2\. 감상 요약|$)/,
      '감상 요약': /## 2\. 감상 요약[\s\S]*?(?=## 3\. 좋았던 점|$)/,
      '좋았던 점': /## 3\. 좋았던 점[\s\S]*?(?=## 4\. 개선이 가능한 부분|$)/,
      '개선이 가능한 부분': /## 4\. 개선이 가능한 부분[\s\S]*?(?=## 5\. 추천 포인트\/다음 제안|$)/,
      '추천 포인트/다음 제안': /## 5\. 추천 포인트\/다음 제안[\s\S]*?(?=## 6\. 기술적 피드백|$)/,
      '기술적 피드백': /## 6\. 기술적 피드백[\s\S]*?(?=$)/,
    };
    
    // 각 섹션 추출
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = feedback.match(pattern);
      if (match && match[0]) {
        // ## 제목 제거하고 내용만 추출
        const content = match[0].replace(/^## \d+\.\s*[^#\n]*\n?/, '').trim();
        if (content) {
          sections[key] = content;
        }
      }
    }
    // 렌더링
    return (
      <div className="flex flex-col gap-4 max-w-3xl w-full mx-auto">
        {/* 별점 표가 있으면 가장 위에 표시 */}
        {starRows.length > 0 && (
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-700">항목</th>
                  <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-700">별점</th>
                  <th className="px-3 py-2 border-b border-gray-300 dark:border-gray-700">한 줄 평가</th>
                </tr>
              </thead>
              <tbody>
                {starRows.map((row, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold">{row.item}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-yellow-500 font-bold">{row.star}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">{row.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* 새로운 프롬프트 구조에 맞춰 섹션 렌더링 */}
        {sections['감상 요약'] && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="font-bold text-base mb-1 text-blue-700 dark:text-blue-300">감상 요약</div>
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">{sections['감상 요약']}</div>
          </div>
        )}
        {sections['좋았던 점'] && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="font-bold text-base mb-1 text-blue-700 dark:text-blue-300">좋았던 점</div>
            <ul className="list-disc pl-5 text-gray-900 dark:text-gray-100">
              {sections['좋았던 점']
                .split(/\n|\r/)
                .filter((line: string) => line.trim() && line.replace(/^[-•\s]+/, '').trim() !== '**' && line.replace(/^[-•\s]+/, '').trim() !== ':')
                .map((line: string, idx: number) => {
                  const clean = line.replace(/^[-•\s]+/, '').replace(/^\*\*:?$/, '').replace(/^:?$/, '').trim();
                  if (!clean || clean === ':' || clean === '**:') return null;
                  return <li key={idx} className="mb-0">- {clean}</li>;
                })}
            </ul>
          </div>
        )}
        {sections['개선이 가능한 부분'] && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="font-bold text-base mb-1 text-blue-700 dark:text-blue-300">개선이 가능한 부분</div>
            <ul className="list-disc pl-5 text-gray-900 dark:text-gray-100">
              {sections['개선이 가능한 부분']
                .split(/\n|\r/)
                .filter((line: string) => line.trim() && line.replace(/^[-•\s]+/, '').trim() !== '**' && line.replace(/^[-•\s]+/, '').trim() !== ':')
                .map((line: string, idx: number) => {
                  const clean = line.replace(/^[-•\s]+/, '').replace(/^\*\*:?$/, '').replace(/^:?$/, '').trim();
                  if (!clean || clean === ':' || clean === '**:') return null;
                  return <li key={idx} className="mb-0">- {clean}</li>;
                })}
            </ul>
          </div>
        )}
        {sections['추천 포인트/다음 제안'] && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="font-bold text-base mb-1 text-blue-700 dark:text-blue-300">추천 포인트/다음 제안</div>
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">{sections['추천 포인트/다음 제안']}</div>
          </div>
        )}
        {sections['기술적 피드백'] && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="font-bold text-base mb-1 text-blue-700 dark:text-blue-300">기술적 피드백</div>
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">{sections['기술적 피드백']}</div>
          </div>
        )}
      </div>
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
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white"
            required
          />
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        className="w-full max-w-3xl min-h-[400px] rounded-lg border border-gray-300 dark:border-gray-700 p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y"
        style={{ overflow: "hidden" }}
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
      {submitted && (
        <div className="mt-2 text-blue-700 dark:text-blue-300 max-w-3xl mx-auto w-full">
          {error && (
            <div className="text-red-500">
              {typeof error === 'string' ? error : error}
            </div>
          )}
          {loading && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-base text-gray-900 dark:text-gray-100 text-center">
                AI 피드백 생성 중{loadingDots}
              </div>
            </div>
          )}
          {aiFeedback && !loading && (
            <div className="flex flex-col gap-2 mt-2 max-w-3xl mx-auto w-full">
              {renderAIFeedbackStyled(aiFeedback)}
              
              {/* 맞춤법 검사 버튼 */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleSpellCheck}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-2 transition-colors shadow"
                  disabled={spellCheckLoading}
                >
                  {spellCheckLoading ? '맞춤법 검사 중...' : '맞춤법 검사하기'}
                </button>
              </div>
              
              {/* 맞춤법 검사 결과 */}
              {showSpellCheck && (
                <div className="mt-4">
                  {spellCheckLoading && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-base text-gray-900 dark:text-gray-100">
                      맞춤법 검사 중...
                    </div>
                  )}
                  {spellCheckResult && !spellCheckLoading && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-base text-gray-900 dark:text-gray-100">
                      <h3 className="font-bold text-lg mb-3">📝 맞춤법 검사 결과</h3>
                      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-3 text-sm" dangerouslySetInnerHTML={{ __html: spellCheckResult }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* 기본 피드백 결과 */}
          {basicFeedback && !loading && (
            <div className="flex flex-col gap-4 mt-2 max-w-3xl mx-auto w-full">
              {/* 전체 점수 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">
                  📊 글쓰기 분석 결과
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {basicFeedback.overallScore}점
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {basicFeedback.overallScore >= 80 ? '매우 좋음' : 
                     basicFeedback.overallScore >= 60 ? '좋음' : 
                     basicFeedback.overallScore >= 40 ? '보통' : '개선 필요'}
                  </div>
                </div>
              </div>
              
              {/* 통계 분석 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">📈 통계 분석</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">글자 수</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.characterCount}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">단어 수</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.wordCount}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">문장 수</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.sentenceCount}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">평균 문장 길이</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.averageSentenceLength}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">고유 단어 수</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.uniqueWords}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">어휘 다양성</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.vocabularyDiversity}%</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">단락 수</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.paragraphCount}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">평균 단락 길이</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{basicFeedback.analysis.averageParagraphLength}</div>
                  </div>
                </div>
              </div>
              
              {/* 스타일 분석 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">🎨 스타일 분석</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">격식성</div>
                    <div className="text-sm">
                      {basicFeedback.style.formality === 'formal' ? '격식적' : 
                       basicFeedback.style.formality === 'casual' ? '친근함' : '혼재'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">복잡성</div>
                    <div className="text-sm">
                      {basicFeedback.style.complexity === 'simple' ? '단순함' : 
                       basicFeedback.style.complexity === 'moderate' ? '보통' : '복잡함'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300">톤</div>
                    <div className="text-sm">
                      {basicFeedback.style.tone === 'neutral' ? '중립적' : 
                       basicFeedback.style.tone === 'emotional' ? '감정적' : 
                       basicFeedback.style.tone === 'descriptive' ? '묘사적' : '서술적'}
                    </div>
                  </div>
                </div>
                
                {basicFeedback.style.strengths.length > 0 && (
                  <div className="mb-3">
                    <div className="font-semibold text-green-700 dark:text-green-300 mb-2">✅ 강점</div>
                    <ul className="list-disc pl-6 text-sm text-green-600 dark:text-green-400">
                      {basicFeedback.style.strengths.map((strength: any, idx: number) => (
                        <li key={idx}>
                          <div className="font-medium">{strength.point}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{strength.evidence}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {basicFeedback.style.weaknesses.length > 0 && (
                  <div>
                    <div className="font-semibold text-orange-700 dark:text-orange-300 mb-2">⚠️ 개선점</div>
                    <ul className="list-disc pl-6 text-sm text-orange-600 dark:text-orange-400">
                      {basicFeedback.style.weaknesses.map((weakness: any, idx: number) => (
                        <li key={idx}>
                          <div className="font-medium">{weakness.point}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{weakness.evidence}</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">💡 {weakness.suggestion}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* 문법 체크 */}
              {basicFeedback.grammar.issues.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">
                    🔍 문법 체크 (점수: {basicFeedback.grammar.score}점)
                  </h4>
                  <ul className="space-y-3">
                    {basicFeedback.grammar.issues.map((issue: any, idx: number) => (
                      <li key={idx} className="text-sm border-l-4 border-yellow-300 pl-3">
                        <div className="font-semibold text-yellow-700 dark:text-yellow-300">
                          {issue.type}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 mb-1">
                          {issue.description}
                        </div>
                        {issue.example && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            📝 예시: {issue.example}
                          </div>
                        )}
                        <div className="text-green-600 dark:text-green-400">
                          💡 {issue.suggestion}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 개선 제안 */}
              {basicFeedback.suggestions.length > 0 && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-3 text-blue-700 dark:text-blue-300">💡 개선 제안</h4>
                  <ul className="list-disc pl-6 space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
                    {basicFeedback.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* 맞춤법 검사 버튼 */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleSpellCheck}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-2 transition-colors shadow"
                  disabled={spellCheckLoading}
                >
                  {spellCheckLoading ? '맞춤법 검사 중...' : '맞춤법 검사하기'}
                </button>
              </div>
              
              {/* 맞춤법 검사 결과 */}
              {showSpellCheck && (
                <div className="mt-4">
                  {spellCheckLoading && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-base text-gray-900 dark:text-gray-100">
                      맞춤법 검사 중...
                    </div>
                  )}
                  {spellCheckResult && !spellCheckLoading && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 text-base text-gray-900 dark:text-gray-100">
                      <h3 className="font-bold text-lg mb-3">📝 맞춤법 검사 결과</h3>
                      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded p-3 text-sm" dangerouslySetInnerHTML={{ __html: spellCheckResult }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
} 