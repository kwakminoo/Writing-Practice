'use client'

import { useEffect } from 'react'

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
      <p className="text-gray-600 mb-4">예상치 못한 오류가 발생했습니다.</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={() => reset()}
      >
        다시 시도
      </button>
    </div>
  )
} 