"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { SUBSCRIPTION_PLANS } from "../../types/subscription";

interface Writing {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  created_at: string;
  is_pinned: boolean;
  problem_id?: string;
  practice_problems?: {
    category: string;
    type: string;
    prompt: string;
  };
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchWritings();
      fetchSubscription();
    }
  }, [user]);

  const fetchWritings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_writings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('글 목록 조회 오류:', error);
        setError('글 목록을 불러오는데 실패했습니다.');
        return;
      }

      setWritings(data || []);
    } catch (err) {
      console.error('API 오류:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('subscription_status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('구독 정보 조회 오류:', error);
        return;
      }

      setSubscription(data);
    } catch (err) {
      console.error('구독 정보 조회 중 오류:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWritingTitle = (writing: Writing) => {
    // 현재는 모든 글을 자유 글쓰기로 처리
    return writing.title || '제목 없음';
  };

  const handleWritingClick = (writing: Writing) => {
    setSelectedWriting(writing);
  };

  const handleCloseDetail = () => {
    setSelectedWriting(null);
  };

  const handleTogglePin = async (writing: Writing) => {
    try {
      const newPinStatus = !writing.is_pinned;
      
      const { error } = await supabase
        .from('user_writings')
        .update({ is_pinned: newPinStatus })
        .eq('id', writing.id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('고정 상태 변경 오류:', error);
        alert('고정 상태를 변경하는 중 오류가 발생했습니다.');
        return;
      }

      // 로컬 상태 업데이트
      setWritings(prevWritings => 
        prevWritings.map(w => 
          w.id === writing.id 
            ? { ...w, is_pinned: newPinStatus }
            : w
        )
      );

      // 선택된 글 상태도 업데이트
      setSelectedWriting(prev => 
        prev && prev.id === writing.id 
          ? { ...prev, is_pinned: newPinStatus }
          : prev
      );

      alert(newPinStatus ? '글이 영구 저장되었습니다!' : '고정이 해제되었습니다.');
    } catch (err) {
      console.error('고정 상태 변경 중 오류:', err);
      alert('고정 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              책갈피를 보려면 로그인해주세요.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📚 내 글 목록
          </h1>
          {subscription && (
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {SUBSCRIPTION_PLANS.find(p => p.storageTier === subscription.subscription_type)?.name || '무료'} 플랜
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                고정된 글: {writings.filter(w => w.is_pinned).length}개
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              글 목록을 불러오는 중...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </div>
        ) : writings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              아직 저장된 글이 없습니다.
            </div>
            <p className="text-gray-500 dark:text-gray-500">
              연습 모드에서 글을 작성하고 피드백을 받으면 여기에 저장됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {writings.map((writing) => (
              <div
                key={writing.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleWritingClick(writing)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                    {getWritingTitle(writing)}
                  </h3>
                  {writing.is_pinned && (
                    <span className="text-yellow-500 text-sm">📌</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  {writing.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{writing.type}</span>
                  <span>{formatDate(writing.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

                 {/* 글 상세 보기 모달 */}
         {selectedWriting && (
           <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
             <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
               {/* 고정 헤더 */}
               <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                   {getWritingTitle(selectedWriting)}
                 </h2>
                 <button
                   onClick={handleCloseDetail}
                   className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold"
                 >
                   ✕
                 </button>
               </div>
               
               {/* 스크롤 가능한 내용 */}
               <div className="flex-1 overflow-y-auto p-6">
                
                {selectedWriting.problem_id && selectedWriting.practice_problems && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      연습문제
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      {selectedWriting.practice_problems.prompt}
                    </p>
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    작성 내용
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 text-sm">
                      {selectedWriting.content}
                    </pre>
                  </div>
                </div>
                
                                 <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                   <span>작성일: {formatDate(selectedWriting.created_at)}</span>
                   <div className="flex items-center gap-4">
                     <span>글자 수: {selectedWriting.content.length}자</span>
                     <button
                       onClick={() => handleTogglePin(selectedWriting)}
                       className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                         selectedWriting.is_pinned
                           ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                           : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                       }`}
                     >
                       {selectedWriting.is_pinned ? '📌 고정 해제' : '📌 영구 저장'}
                     </button>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 