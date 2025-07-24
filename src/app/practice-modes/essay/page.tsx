"use client";
import { useState, useEffect, useRef } from "react";
import WritingArea from "../../../components/WritingArea";
import Link from "next/link";

// 연습 방식 및 문제 프롬프트 정의
const practiceTypes = [
  { key: "topic", label: "주제 에세이", desc: "주어진 주제에 대해 자유롭게 에세이 작성", prompts: ["아래 주제로 에세이를 써보세요. ex) '성장', '도전'", "아래 키워드로 자유롭게 글을 써보세요. ex) '여행', '우정'"] },
  { key: "experience", label: "경험담", desc: "자신의 경험/일화 중심으로 글쓰기", prompts: ["최근 경험한 인상 깊은 일을 에세이로 써보세요.", "어린 시절의 추억을 중심으로 글을 써보세요."] },
  { key: "logic", label: "논증/설득", desc: "주장, 근거, 반론 등 논리적으로 전개", prompts: ["아래 주장에 대해 논리적으로 글을 써보세요. ex) '독서는 인생을 바꾼다.'", "아래 주제에 대해 찬반 논거를 들어 설득해보세요. ex) '온라인 수업의 장단점'"] },
  { key: "expand", label: "요약/확장", desc: "짧은 글을 길게, 긴 글을 요약", prompts: ["아래 짧은 글을 길게 확장해보세요. ex) '나는 오늘 행복했다.'", "아래 긴 글을 3문장으로 요약해보세요."] },
  { key: "quote", label: "인용문 활용", desc: "명언/책 구절 등 인용해 글 전개", prompts: ["아래 명언을 인용해 글을 써보세요. ex) '행복은 습관이다.'", "책 구절을 활용해 자신의 생각을 전개해보세요."] },
  { key: "review", label: "감상문", desc: "책, 영화, 음악 등 감상문 작성", prompts: ["최근 읽은 책의 감상문을 써보세요.", "인상 깊게 본 영화에 대해 감상문을 작성해보세요."] },
  { key: "metaphor", label: "비유/은유", desc: "비유적 표현을 활용한 에세이", prompts: ["아래 주제를 비유적으로 풀어 에세이를 써보세요. ex) '인생은 여행이다.'", "은유를 활용해 자신의 감정을 표현해보세요."] },
  { key: "timer", label: "30분 타이머 글쓰기", desc: "타이머 30분 설정 후 주제로 글쓰기", prompts: ["타이머를 30분 설정한 후, 아래 주제로 1~2페이지 분량의 글을 써보세요. ex) '잃어버린 기억'", "30분 동안 아래 주제로 자유롭게 글을 써보세요. ex) '새로운 시작'"
    ] },
];
const dummyPracticeTypes = [
  { key: "topic", label: "주제 에세이" },
  { key: "experience", label: "경험담" },
  { key: "logic", label: "논증/설득" },
  { key: "expand", label: "요약/확장" },
  { key: "quote", label: "인용문 활용" },
  { key: "review", label: "감상문" },
  { key: "metaphor", label: "비유/은유" },
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

export default function EssayPractice() {
  const [mode, setMode] = useState<'practice' | 'free'>('practice');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [problems, setProblems] = useState<typeof practiceTypes>([]);
  const [selectedProblemIdx, setSelectedProblemIdx] = useState<number | null>(null);

  const handleTypeToggle = (key: string) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGetProblems = () => {
    const filtered = practiceTypes.filter(t => selectedTypes.includes(t.key));
    if (filtered.length > 0) {
      setProblems(filtered.map(type => ({ ...type, prompt: type.prompts[Math.floor(Math.random() * type.prompts.length)] })));
    } else {
      // 선택 없으면 8개 중 3개 랜덤
      const shuffled = [...practiceTypes].sort(() => Math.random() - 0.5);
      setProblems(shuffled.slice(0, 3).map(type => ({ ...type, prompt: type.prompts[Math.floor(Math.random() * type.prompts.length)] })));
    }
    setSelectedProblemIdx(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <PracticeCategoryNav current="essay" />
      <h2 className="text-2xl font-bold mb-4">에세이 연습</h2>
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
          >
            새 문제 받기
          </button>
          <div className="space-y-4 mb-8">
            {problems.map((type, idx) => (
              <div
                key={type.key}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedProblemIdx === idx ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} shadow`}
                onClick={() => setSelectedProblemIdx(idx)}
              >
                <div className="font-bold text-blue-700 dark:text-blue-300">{idx + 1}. {type.label}</div>
                <div className="text-gray-700 dark:text-gray-200 text-sm mt-1">{type.desc}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm mt-2 whitespace-pre-line">{String('prompt' in type ? type.prompt : type.prompts[0])}</div>
                {selectedProblemIdx === idx && (
                  <div className="mt-2">
                    <WritingArea category={type.label} />
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
          <WritingArea category="에세이" practiceType="자유" />
        </div>
      )}
    </div>
  );
} 