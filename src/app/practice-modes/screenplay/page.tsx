"use client";
import { useState, useEffect, useRef } from "react";
import WritingArea from "../../../components/WritingArea";
import Link from "next/link";

// 연습 방식 및 문제 프롬프트 정의
const practiceTypes = [
  { key: "roleplay", label: "상황극/역할극", desc: "특정 상황/캐릭터로 대화문 작성", prompts: ["아래 상황에서 두 인물의 대화를 써보세요. ex) '면접장, 지원자와 면접관'", "역할을 정해 대화문을 창작해보세요. ex) '의사와 환자'",] },
  { key: "scene", label: "장면 전환", desc: "주어진 상황에서 장면을 전환해 이어쓰기", prompts: ["아래 상황에서 장면이 전환되는 부분을 써보세요. ex) '카페에서 집으로'", "장면 전환을 활용해 이야기를 이어가보세요. ex) '밤에서 아침으로'",] },
  { key: "dialogue", label: "대사 작성", desc: "캐릭터별로 자연스러운 대사 만들기", prompts: ["아래 상황에 어울리는 대사를 써보세요. ex) '이별하는 연인'", "두 인물의 감정이 드러나는 대사를 창작해보세요. ex) '오랜만에 만난 친구'",] },
  { key: "structure", label: "시나리오 구조화", desc: "기승전결, 3막 구조 등 시나리오 플롯 설계", prompts: ["아래 주제로 3막 구조의 시나리오 개요를 써보세요. ex) '복수'", "기승전결이 뚜렷한 시나리오 플롯을 설계해보세요. ex) '우정'",] },
  { key: "desc", label: "장면 묘사", desc: "배경, 분위기, 동작 등 시각적으로 묘사", prompts: ["아래 장면을 시각적으로 묘사해보세요. ex) '비 내리는 거리'", "배경과 인물의 동작을 묘사해보세요. ex) '도서관에서 책을 읽는 소녀'",] },
  { key: "improv", label: "즉흥 시나리오", desc: "랜덤 프롬프트로 즉석에서 장면 만들기", prompts: ["아래 프롬프트로 즉흥 시나리오를 써보세요. ex) '정전된 도시'", "랜덤 상황으로 장면을 창작해보세요. ex) '길을 잃은 아이'",] },
  { key: "genre", label: "장르 변환", desc: "같은 상황을 코미디/스릴러/멜로 등으로 변환", prompts: ["아래 상황을 코미디, 스릴러, 멜로 등 다양한 장르로 바꿔 써보세요. ex) '첫 만남'", "같은 장면을 여러 장르로 변환해보세요. ex) '이별'",] },
  { key: "onesentence", label: "한 문장 시나리오", desc: "주제를 바탕으로 한 문장으로 시나리오 완성", prompts: ["아래 주제로 한 문장 시나리오를 써보세요. ex) '희생'", "키워드로 한 문장 시나리오를 완성해보세요. ex) '기회', '운명', '선택'"] },
];
const dummyPracticeTypes = [
  { key: "roleplay", label: "상황극/역할극" },
  { key: "scene", label: "장면 전환" },
  { key: "dialogue", label: "대사 작성" },
  { key: "structure", label: "시나리오 구조화" },
  { key: "desc", label: "장면 묘사" },
  { key: "improv", label: "즉흥 시나리오" },
  { key: "genre", label: "장르 변환" },
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

export default function ScreenplayPractice() {
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
      <PracticeCategoryNav current="screenplay" />
      <h2 className="text-2xl font-bold mb-4">시나리오 연습</h2>
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