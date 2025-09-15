"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>문제를 불러오는 중 오류가 발생했습니다.</h2>
      <pre style={{ color: 'red', margin: 16 }}>{error.message}</pre>
      <button onClick={() => reset()} style={{ marginTop: 20, padding: 10 }}>
        다시 시도
      </button>
    </div>
  );
} 