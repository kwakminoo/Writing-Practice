"use client";

import WritingArea from "../../../components/WritingArea";
import { useState } from "react";

const practiceTypes = [
  { key: "daily", label: "문제 풀이", desc: "사극 대사/장면을 다양한 방식으로 바꿔쓰기", prompts: ["다음 사극 대사를 현대적으로 바꿔 써보세요. ex) '전하, 소신이 죽을 죄를 지었습니다.'", "아래 장면을 묘사와 대화로 재구성해보세요. ex) '궁궐의 밤'",] },
  { key: "theme", label: "테마별 글쓰기", desc: "시대/계층/신분 등 테마에 맞춰 글쓰기", prompts: ["아래 신분(양반, 상민 등)에 맞는 대사를 써보세요. ex) '상궁과 궁녀의 대화'", "특정 시대 배경으로 장면을 창작해보세요. ex) '조선 후기 시장'",] },
  { key: "copy", label: "필사 연습", desc: "유명 사극 대사/장면을 따라 쓰기", prompts: ["유명 사극의 명대사를 필사해보세요. ex) '이순신 장군의 명언'", "사극 드라마의 한 장면을 똑같이 써보세요. ex) '대장금'의 요리 장면"] },
  { key: "rewrite", label: "재작성 훈련", desc: "사극 문장/대사 변형, 요약, 확장", prompts: ["아래 사극 문장을 현대어로 바꿔 써보세요. ex) '소인은 감히...'", "사극 대사를 더 길게, 짧게 바꿔 써보세요."] },
  { key: "sense", label: "5감각 묘사 연습", desc: "사극 장면을 오감으로 묘사", prompts: ["아래 장면을 오감으로 묘사해보세요. ex) '궁궐의 새벽'", "사극 속 음식을 다섯 감각으로 표현해보세요. ex) '수라상'",] },
  { key: "onesentence", label: "한 문장 사극", desc: "주제를 바탕으로 한 문장으로 사극 완성", prompts: ["아래 주제로 한 문장 사극을 써보세요. ex) '충성'", "키워드로 한 문장 사극을 완성해보세요. ex) '의리', '가문', '명예'"] },
  { key: "continue", label: "이어쓰기", desc: "사극 도입부만 주고 이어쓰기", prompts: ["아래 첫 문장으로 사극을 이어 써보세요. ex) '새벽 종이 울렸다.'", "아래 문장으로 시작하는 사극을 창작해보세요. ex) '나는 오늘...'"
    ] },
  { key: "perspective", label: "시점 변화 연습", desc: "사극 문장을 다양한 시점으로 바꿔쓰기", prompts: ["아래 문장을 1인칭, 3인칭 등 다양한 시점으로 바꿔 써보세요. ex) '그는 칼을 들었다.'", "사극 장면을 여러 시점으로 바꿔 써보세요."] },
];

export default function PeriodDramaPractice() {
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
      <h2 className="text-2xl font-bold mb-4">사극 연습</h2>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
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
    </div>
  );
} 