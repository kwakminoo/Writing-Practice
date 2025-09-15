'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">심각한 오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">애플리케이션에서 예상치 못한 오류가 발생했습니다.</p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={() => reset()}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
} 