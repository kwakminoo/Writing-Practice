"use client";
import { useRef, useEffect, useState } from "react";
import WritingArea from "../../../components/WritingArea";
import Link from "next/link";
import { PracticeType, ProblemWithType } from "../../../types/practice";

const categories = [
  { name: "소설", slug: "fiction" },
  { name: "시나리오", slug: "screenplay" },
  { name: "시", slug: "poetry" },
  { name: "에세이", slug: "essay" },
];

function PracticeCategoryNav({ current }: { current: string }) {
  return (
    <div className="flex gap-2 mb-6">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/practice-modes/${cat.slug}`}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            current === cat.slug
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

// 실제 데이터베이스에 있는 타입들로 수정
const practiceTypes: PracticeType[] = [
  { key: "필사 연습", label: "이야기 재구성", desc: "주어진 문장(1~2문장)으로 원래 맥락과 무관하게 새로운 이야기를 창작하는 연습. 장르, 결말, 전개 모두 자유롭게 상상하여 창작할 수 있습니다." },
  { key: "문제 풀이", label: "문제 풀이", desc: "상황·갈등 해결형 문제를 완성하는 연습" },
  { key: "테마별 글쓰기", label: "테마별 글쓰기", desc: "특정 주제·장르에 맞춰 글을 쓰는 연습" },
  { key: "제작성 훈련", label: "제작성 훈련", desc: "즉흥 창작, 키워드 조합 등 창의적 글쓰기" },
  { key: "5감각 묘사 연습", label: "5감각 묘사 연습", desc: "장면·상황을 오감으로 묘사하는 연습" },
  { key: "한 문장 소설", label: "한 문장 소설", desc: "한 문장으로 완결된 소설을 쓰는 연습" },
  { key: "이어쓰기 연습", label: "이어쓰기", desc: "도입부/중간을 이어서 완성하는 연습" },
  { key: "시점 변화 연습", label: "시점 변화 연습", desc: "같은 장면을 다양한 시점으로 써보는 연습" },
];

export default function FictionPractice() {
  const [mode, setMode] = useState<'practice' | 'free'>('practice');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [problems, setProblems] = useState<ProblemWithType[]>([]);
  const [selectedProblemIdx, setSelectedProblemIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeToggle = (key: string) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // DB에서 type별로 랜덤 문제 받아오기
  const handleGetProblems = async () => {
    setLoading(true);
    setProblems([]);
    setSelectedProblemIdx(null);
    setError(null);
    
    const types = selectedTypes.length > 0 ? selectedTypes : practiceTypes.map(t => t.key);
    // 최대 3개 랜덤(선택 없으면)
    const chosenTypes = selectedTypes.length > 0 ? types : shuffle(types).slice(0, 3);
    const results: ProblemWithType[] = [];
    
    for (const type of chosenTypes) {
      try {
        const res = await fetch(`/api/practice-problems/random?type=${encodeURIComponent(type)}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        
        if (json.error) {
          throw new Error(json.error);
        }
        
        const data = Array.isArray(json.data) ? json.data[0] : (json.data?.[0] || json.data);
        
        if (data) {
          const practiceType = practiceTypes.find(t => t.key === type);
          if (practiceType) {
            results.push({
              ...practiceType,
              ...data,
            });
          }
        } else {
          console.warn(`No data found for type: ${type}`);
          // 빈 문제 대신 기본 구조 제공
          const practiceType = practiceTypes.find(t => t.key === type);
          if (practiceType) {
            results.push({
              ...practiceType,
              prompt: `${type} 문제를 불러오지 못했습니다. 다시 시도해주세요.`,
              category: '소설',
              type: type,
            });
          }
        }
      } catch (e) {
        console.error(`Error fetching problems for type ${type}:`, e);
        // 실패 시 기본 문제 제공
        const practiceType = practiceTypes.find(t => t.key === type);
        if (practiceType) {
          results.push({
            ...practiceType,
            prompt: `${type} 문제를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.`,
            category: '소설',
            type: type,
          });
        }
      }
    }
    
    if (results.length === 0) {
      setError('문제를 불러오는데 실패했습니다. 다시 시도해주세요.');
    }
    
    setProblems(results);
    setLoading(false);
  };

  function shuffle<T>(arr: T[]): T[] {
    return arr.slice().sort(() => Math.random() - 0.5);
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <PracticeCategoryNav current="fiction" />
      <h2 className="text-2xl font-bold mb-4">소설 연습</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      <div className="flex gap-4 mb-8 justify-center">
        <button
          className={`px-6 py-2 rounded-lg font-semibold shadow transition-colors ${mode === 'practice' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setMode('practice')}
        >
          연습 문제로 글쓰기
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold shadow transition-colors ${mode === 'free' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setMode('free')}
        >
          자유 글쓰기
        </button>
      </div>
      {mode === 'practice' && (
        <>
          {/* 이야기 재구성 안내문구 제거됨 */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">연습 방식 선택/추가</h3>
            <div className="flex flex-wrap gap-2">
              {practiceTypes.map((type) => (
                <button
                  key={type.key}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${selectedTypes.includes(type.key) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600"}`}
                  onClick={() => handleTypeToggle(type.key)}
                  type="button"
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <button
            className="mb-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGetProblems}
            type="button"
            disabled={loading}
          >
            {loading ? '문제 불러오는 중...' : '새 문제 받기'}
          </button>
          <div className="space-y-4 mb-8">
            {problems.map((problem, idx) => (
              <div
                key={problem.id || problem.key || idx}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedProblemIdx === idx ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} shadow`}
                onClick={() => setSelectedProblemIdx(idx)}
              >
                <div className="font-bold text-blue-700 dark:text-blue-300">{idx + 1}. {problem.label}</div>
                <div className="text-gray-700 dark:text-gray-200 text-sm mt-1">{problem.desc}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mt-2 whitespace-pre-line">{problem.prompt}</div>
                {problem.keywords && problem.keywords.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">제시어: {Array.isArray(problem.keywords) ? problem.keywords.join(', ') : problem.keywords}</div>
                )}
                {selectedProblemIdx === idx && (
                  <div className="mt-2">
                    <WritingArea 
                      category={problem.label} 
                      practiceType={problem.type} 
                      problemId={problem.id?.toString()}
                      problemPrompt={problem.prompt}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {!problems.length && !loading && <div>연습 방식을 선택하고 새 문제 받기를 눌러주세요.</div>}
        </>
      )}
      {mode === 'free' && (
        <div className="mb-8 w-full max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold mb-2">자유 글쓰기</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {practiceTypes.map((type) => (
              <button
                key={type.key}
                className="px-3 py-1 rounded-full border text-sm transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 pointer-events-none opacity-0 select-none"
                tabIndex={-1}
                aria-hidden="true"
                type="button"
              >
                {type.label}
              </button>
            ))}
          </div>
          <WritingArea category="소설" practiceType="소설 자유" isFreeWriting={true} />
        </div>
      )}
    </div>
  );
} 