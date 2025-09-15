"use client";
import { useState, useEffect, useRef } from "react";
import WritingArea from "../../../components/WritingArea";
import Link from "next/link";
import { PracticeType, ProblemWithType } from '../../../types/practice';

// 연습 방식 및 문제 프롬프트 정의
const practiceTypes = [
  { key: "이미지화", label: "이미지화", desc: "사물/감정/상황을 시적 이미지로 표현", prompts: ["아래 단어를 시적 이미지로 표현해보세요. ex) '바람', '고독', '빛'", "아래 상황을 시로 이미지화해보세요. ex) '비 내리는 오후'",] },
  { key: "운율 맞추기", label: "운율 맞추기", desc: "정해진 운율, 음수율, 각운 등 맞춰 쓰기", prompts: ["아래 문장에 운율을 맞춰 시를 써보세요. ex) '봄이 오면'", "정해진 음수율로 시를 완성해보세요. ex) 3-5-3-5 음수율"] },
  { key: "시어 변형", label: "시어 변형", desc: "평범한 문장을 시어로 바꿔보기", prompts: ["아래 문장을 시어로 바꿔보세요. ex) '나는 너를 사랑해.'", "일상 문장을 시적으로 변형해보세요. ex) '햇살이 창문을 두드린다.'"] },
  { key: "감각 분리 시", label: "감각 분리 시", desc: "하나의 사물이나 상황을 오직 한 가지 감각(시각, 청각, 촉각, 후각, 미각 중 하나)만으로 묘사하는 시 쓰기. 다른 감각을 쓰지 않고 한 감각만으로 시를 완성해야 하는 독특한 제약.", prompts: ["아래 주제를 한 가지 감각(시각, 청각, 촉각, 후각, 미각 중 하나)만으로 시로 표현해보세요. 예: '불 꺼진 도서관'을 청각으로만 묘사하기. 예시: '종이 쓸리는 소리만이 숨을 잇는다.'"] },
  { key: "즉흥시", label: "즉흥시", desc: "랜덤 단어/주제로 즉석에서 시 쓰기", prompts: ["아래 단어로 즉흥시를 써보세요. ex) '별', '강', '꿈'", "랜덤 주제로 시를 창작해보세요. ex) '이별', '만남'"] },
  { key: "시 구조 변형 연습", label: "시 구조 변형 연습", desc: "한 문장 또는 짧은 단락을 주고, 자유시 → 3행시(세로 글자) → 하이쿠(5-7-5) → 산문시 등 서로 다른 시 형식으로 바꿔 쓰는 연습입니다.", prompts: ["아래 문장 또는 단락을 다양한 시 형식(자유시, 3행시, 하이쿠, 산문시 등)으로 바꿔 써보세요. 예: '비 내린 골목' → 자유시: '비 내린 골목에 / 발자국이 지워지고 / 숨소리만 남는다.' 하이쿠: '비 젖은 골목 / 발자국이 사라져 / 밤이 걸어온다.'"] },
  { key: "주제 변주", label: "주제 변주", desc: "같은 주제로 다양한 시적 접근 시도", prompts: ["아래 주제로 여러 스타일의 시를 써보세요. ex) '고독'", "같은 주제로 2가지 이상의 시를 써보세요. ex) '봄'",] },
  { key: "한 문장 시", label: "한 문장 시", desc: "주제를 바탕으로 한 문장으로 시 완성", prompts: ["아래 주제로 한 문장 시를 써보세요. ex) '그리움'", "키워드로 한 문장 시를 완성해보세요. ex) '밤', '별', '창문'"] },
];
const dummyPracticeTypes = [
  { key: "image", label: "이미지화" },
  { key: "rhythm", label: "운율 맞추기" },
  { key: "wordplay", label: "시어 변형" },
  { key: "copy", label: "필사 연습" },
  { key: "improv", label: "즉흥시" },
  { key: "mimic", label: "모방시" },
  { key: "variation", label: "주제 변주" },
];

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

export default function PoetryPractice() {
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

  // DB에서 type별로 랜덤 문제 받아오기 (소설과 동일)
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
          // 빈 문제 대신 기본 구조 제공
          const practiceType = practiceTypes.find(t => t.key === type);
          if (practiceType) {
            results.push({
              ...practiceType,
              prompt: `${type} 문제를 불러오지 못했습니다. 다시 시도해주세요.`,
              category: '시',
              type: type,
            });
          }
        }
      } catch (e) {
        // 실패 시 기본 문제 제공
        const practiceType = practiceTypes.find(t => t.key === type);
        if (practiceType) {
          results.push({
            ...practiceType,
            prompt: `${type} 문제를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.`,
            category: '시',
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
      <PracticeCategoryNav current="poetry" />
      <h2 className="text-2xl font-bold mb-4">시 연습</h2>
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
            className="mb-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
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
          {!problems.length && <div>연습 방식을 선택하고 새 문제 받기를 눌러주세요.</div>}
        </>
      )}
      {mode === 'free' && (
        <div className="mb-8 w-full max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold mb-2">자유 글쓰기</h3>
          {/* 가상 버튼: 연습문제와 동일한 갯수/크기, 클릭 불가, 투명 */}
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
          {/* 공통 WritingArea 컴포넌트로 교체 (AI 피드백 활성화) */}
          <WritingArea category="시" practiceType="시 자유" isFreeWriting={true} />
        </div>
      )}
    </div>
  );
} 