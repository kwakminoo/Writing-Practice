"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";

export default function BasicFeedback() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      setError("분석할 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 기본 피드백 API 호출
      const feedbackResponse = await fetch('/api/basic-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content
        })
      });

      const feedbackResult = await feedbackResponse.json();

      if (feedbackResult.success) {
        setFeedback(feedbackResult.feedback);
        setSuccess("기본 피드백이 생성되었습니다!");
      } else {
        setError(feedbackResult.error || '피드백 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('기본 피드백 오류:', err);
      setError('기본 피드백 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            📝 기본 피드백
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            맞춤법, 문법, 문장 구조에 대한 기본적인 피드백을 제공합니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              분석할 글 입력
            </h2>
            
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  기본 피드백을 받으려면 로그인이 필요합니다.
                </p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  로그인하기
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    글 내용
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="분석받고 싶은 글을 입력해주세요..."
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300">
                    {success}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !content.trim()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading || !content.trim()
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? '분석 중...' : '기본 피드백 받기'}
                </button>
              </form>
            )}
          </div>

          {/* 피드백 결과 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              기본 피드백 결과
            </h2>
            
            {feedback ? (
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📝</div>
                <p>왼쪽에 글을 입력하고 기본 피드백을 받아보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 