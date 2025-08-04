"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { SUBSCRIPTION_PLANS, UserSubscription } from "../../types/subscription";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('subscription_status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116는 결과가 없을 때
        console.error('구독 정보 조회 오류:', error);
        setError('구독 정보를 불러오는데 실패했습니다.');
        return;
      }

      setCurrentSubscription(data);
    } catch (err) {
      console.error('API 오류:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 실제 결제 시스템 연동 전까지는 시뮬레이션
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) return;

      if (plan.price === 0) {
        // 무료 플랜은 바로 적용
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            subscription_type: plan.storageTier,
            subscription_status: 'active',
            start_date: new Date().toISOString(),
            end_date: null
          });

        if (error) {
          console.error('구독 업데이트 오류:', error);
          alert('구독 변경 중 오류가 발생했습니다.');
          return;
        }

        alert('무료 플랜으로 변경되었습니다!');
        fetchCurrentSubscription();
      } else {
        // 유료 플랜은 결제 페이지로 이동 (현재는 시뮬레이션)
        alert(`${plan.name} 플랜 (${plan.price.toLocaleString()}원/월)을 선택하셨습니다.\n\n실제 결제 시스템 연동이 필요합니다.`);
      }
    } catch (err) {
      console.error('구독 처리 중 오류:', err);
      alert('구독 처리 중 오류가 발생했습니다.');
    }
  };

  const getCurrentPlan = () => {
    if (!currentSubscription) return SUBSCRIPTION_PLANS[0]; // 무료 플랜
    return SUBSCRIPTION_PLANS.find(p => p.storageTier === currentSubscription.subscription_type) || SUBSCRIPTION_PLANS[0];
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
              구독 관리를 위해 로그인해주세요.
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          💎 구독 플랜
        </h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              구독 정보를 불러오는 중...
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400">{error}</div>
          </div>
        ) : (
          <>
            {/* 현재 구독 정보 */}
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  현재 구독 정보
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {getCurrentPlan().name} 플랜
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getCurrentPlan().price === 0 ? '무료' : `${getCurrentPlan().price.toLocaleString()}원/월`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentSubscription?.subscription_status === 'active' ? '활성' : '비활성'}
                    </p>
                    {currentSubscription?.end_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        만료: {new Date(currentSubscription.end_date).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 구독 플랜 선택 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const isCurrentPlan = getCurrentPlan().id === plan.id;
                const isFreePlan = plan.price === 0;
                
                return (
                  <div
                    key={plan.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 transition-all ${
                      isCurrentPlan 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {plan.price === 0 ? '무료' : `${plan.price.toLocaleString()}원`}
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          /{plan.interval}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                          : isFreePlan
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isCurrentPlan ? '현재 플랜' : isFreePlan ? '무료로 시작' : '구독하기'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 구독 안내 */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                💡 구독 안내
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• 무료 플랜: 30일간 글 저장, 5개 글 고정 가능</li>
                <li>• 베이직 플랜: 90일간 글 저장, 20개 글 고정 가능</li>
                <li>• 프리미엄 플랜: 1년간 글 저장, 무제한 글 고정</li>
                <li>• 구독 변경 시 즉시 적용됩니다</li>
                <li>• 언제든지 구독을 취소할 수 있습니다</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 