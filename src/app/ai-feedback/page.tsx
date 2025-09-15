"use client";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import AIFeedbackRenderer from "../../components/AIFeedbackRenderer";

export default function AiFeedback() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userCoins, setUserCoins] = useState<number | null>(null);
  const [loadingCoins, setLoadingCoins] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserCoins();
    }
  }, [user]);

  const fetchUserCoins = async () => {
    try {
      setLoadingCoins(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/coins/balance', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserCoins(data.balance);
      } else {
        console.error('코인 잔액 조회 오류:', data.error);
        setUserCoins(0);
      }
    } catch (err) {
      console.error('코인 잔액 조회 중 오류:', err);
      setUserCoins(0);
    } finally {
      setLoadingCoins(false);
    }
  };

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
    setLoadingProgress(0);
    setError("");
    setSuccess("");
    setFeedback("");

    // 로딩 진행 상황 시뮬레이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          content: content,
          category: 'general',
          practiceType: 'free'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setFeedback(data.feedback || '');
        setSuccess('AI 피드백이 생성되었습니다!');
        // 동기화
        await queryClient.invalidateQueries({ queryKey: ["coin-balance", user.id] });
        await fetchUserCoins();
      } else {
        setError(data.error || 'AI 피드백 생성 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('AI 피드백 오류:', err);
      setError('AI 피드백 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 AI 피드백
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI가 여러분의 글을 분석하고 맞춤형 피드백을 제공합니다 (10코인 소모)
          </p>
          {user && (
            <div className="mt-4">
              {loadingCoins ? (
                <p className="text-sm text-gray-500">코인 잔액 확인 중...</p>
              ) : (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  현재 보유 코인: {userCoins}코인
                </p>
              )}
            </div>
          )}
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
                  AI 피드백을 받으려면 로그인이 필요합니다.
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
                  disabled={loading || !content.trim() || (userCoins !== null && userCoins < 10)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading || !content.trim() || (userCoins !== null && userCoins < 10)
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      분석 중... ({Math.round(loadingProgress)}%)
                    </div>
                  ) : (
                    'AI 피드백 받기 (10코인)'
                  )}
                </button>
                
                {loading && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>AI가 글을 분석하고 있습니다. 보통 10-15초 정도 소요됩니다.</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {userCoins !== null && userCoins < 10 && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    코인이 부족합니다. 코인을 충전해주세요.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* 피드백 결과 */}
          {feedback && (
            <div className="space-y-6">
              <AIFeedbackRenderer feedback={feedback} />
            </div>
          )}

          {/* 피드백이 없을 때 */}
          {!feedback && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI 피드백을 받아보세요
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  왼쪽에 글을 입력하고 AI 피드백을 받아보세요!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 