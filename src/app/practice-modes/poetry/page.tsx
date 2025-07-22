"use client";
import { useState, useEffect, useRef } from "react";
import WritingArea from "../../../components/WritingArea";
import Link from "next/link";

const practiceTypes = [
  { key: "image", label: "이미지화", desc: "사물/감정/상황을 시적 이미지로 표현" },
  { key: "rhythm", label: "운율 맞추기", desc: "정해진 운율, 음수율, 각운 등 맞춰 쓰기" },
  { key: "wordplay", label: "시어 변형", desc: "평범한 문장을 시어로 바꿔보기" },
  { key: "copy", label: "필사 연습", desc: "유명 시인의 시를 따라 쓰며 감각 익히기" },
  { key: "improv", label: "즉흥시", desc: "랜덤 단어/주제로 즉석에서 시 쓰기" },
  { key: "mimic", label: "모방시", desc: "특정 시인의 스타일을 모방해 창작" },
  { key: "variation", label: "주제 변주", desc: "같은 주제로 다양한 시적 접근 시도" },
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
  const [problems, setProblems] = useState<typeof practiceTypes>([]);
  const [selectedProblemIdx, setSelectedProblemIdx] = useState<number | null>(null);

  const handleTypeToggle = (key: string) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGetProblems = () => {
    const filtered = practiceTypes.filter(t => selectedTypes.includes(t.key));
    setProblems(filtered.length > 0 ? filtered : practiceTypes.slice(0, 3));
    setSelectedProblemIdx(null);
  };

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
          {/* 오토 리사이즈 textarea */}
          <AutoResizeWritingArea />
        </div>
      )}
    </div>
  );
}

// 자유 글쓰기용 오토 리사이즈 컴포넌트
function AutoResizeWritingArea() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <textarea
        ref={textareaRef}
        className="w-full max-w-6xl min-h-[200px] rounded-lg border border-gray-300 dark:border-gray-700 p-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y"
        style={{ overflow: "hidden" }}
        placeholder="자유롭게 글을 써보세요..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        rows={8}
      />
      <button
        type="submit"
        className="self-end bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2 transition-colors shadow"
      >
        제출
      </button>
      {submitted && (
        <div className="mt-2 text-blue-700 dark:text-blue-300">
          AI 피드백 기능은 곧 제공될 예정입니다. 작성하신 글이 안전하게 저장되었습니다.
        </div>
      )}
    </form>
  );
} 