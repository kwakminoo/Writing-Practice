"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 사이드에서 접근 가능한 환경 변수 확인
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음',
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">환경 변수 테스트</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">환경 변수 상태:</h2>
        <pre className="text-sm">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">기본 기능 테스트:</h2>
        <p>이 페이지가 정상적으로 로드되었다면 기본적인 Next.js 기능은 작동합니다.</p>
      </div>

      <Link href="/" className="text-blue-600 hover:underline">
        메인 페이지로 돌아가기
      </Link>
    </div>
  );
} 