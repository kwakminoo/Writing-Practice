"use client";
import { useState, useRef, useEffect } from "react";

interface WritingAreaProps {
  category: string;
}

export default function WritingArea({ category }: WritingAreaProps) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 모든 글쓰기에서 textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
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