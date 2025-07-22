import WritingArea from "../../../components/WritingArea";

export default function PeriodDramaPractice() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4">사극 연습</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">자유롭게 사극 스타일로 글을 작성해보세요. 제출하면 AI 피드백을 받을 수 있습니다. (초기 버전에서는 피드백이 제공되지 않습니다)</p>
      <WritingArea category="사극" />
    </div>
  );
} 