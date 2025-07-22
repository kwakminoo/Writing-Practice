"use client";

import Link from "next/link";

const categories = [
  { name: "소설", slug: "fiction" },
  { name: "시나리오", slug: "screenplay" },
  { name: "시", slug: "poetry" },
  { name: "에세이", slug: "essay" },
];

export default function PracticeModes() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">연습 모드 선택</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/practice-modes/${cat.slug}`}
            className="block rounded-2xl border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 p-12 text-center shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 text-2xl font-bold text-blue-800 dark:text-blue-200 min-h-[120px] flex items-center justify-center"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
} 