"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const coinPackages: CoinPackage[] = [
  { id: 'basic', coins: 100, price: 10000, bonus: 0 },
  { id: 'popular', coins: 300, price: 25000, bonus: 50, popular: true },
  { id: 'premium', coins: 500, price: 40000, bonus: 100 },
  { id: 'ultimate', coins: 1000, price: 70000, bonus: 300 },
];

export default function CoinsPage() {
  const { user } = useAuth();
  const [currentCoins, setCurrentCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [charging, setCharging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCoinBalance();
    }
  }, [user]);

  const fetchCoinBalance = async () => {
    try {
      setLoading(true);
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
        setCurrentCoins(data.balance);
      } else {
        setError(data.error || '코인 잔액을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('코인 잔액 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCharge = async (packageId: string) => {
    const selectedPackage = coinPackages.find(pkg => pkg.id === packageId);
    if (!selectedPackage) return;

    try {
      setCharging(true);
      setError(null);
      setSuccess(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/coins/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          packageId,
          coins: selectedPackage.coins + (selectedPackage.bonus || 0)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`${selectedPackage.coins + (selectedPackage.bonus || 0)}코인이 성공적으로 충전되었습니다!`);
        fetchCoinBalance(); // 잔액 새로고침
      } else {
        setError(data.error || '코인 충전에 실패했습니다.');
      }
    } catch (err) {
      setError('코인 충전 중 오류가 발생했습니다.');
    } finally {
      setCharging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">코인 잔액을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            코인 충전
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI 피드백을 받기 위해 코인을 충전하세요
          </p>
        </div>

        {/* 현재 코인 잔액 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              현재 코인 잔액
            </h2>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {currentCoins?.toLocaleString() || 0} 코인
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              AI 피드백 1회: 10코인
            </p>
          </div>
        </div>

        {/* 오류 및 성공 메시지 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <p className="text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {/* 코인 패키지 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coinPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 ${
                pkg.popular 
                  ? 'border-blue-500 dark:border-blue-400' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {pkg.popular && (
                <div className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full text-center mb-4">
                  인기
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {pkg.coins} 코인
                </h3>
                
                {pkg.bonus && pkg.bonus > 0 && (
                  <p className="text-green-600 dark:text-green-400 text-sm mb-2">
                    +{pkg.bonus} 보너스 코인
                  </p>
                )}
                
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  ₩{pkg.price.toLocaleString()}
                </p>
                
                <button
                  onClick={() => handleCharge(pkg.id)}
                  disabled={charging}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    charging
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {charging ? '충전 중...' : '충전하기'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 코인 사용 안내 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            코인 사용 안내
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>• AI 피드백: 10코인</li>
            <li>• 기본 피드백: 무료</li>
            <li>• 코인은 한 번 사용하면 환불되지 않습니다</li>
            <li>• 충전한 코인은 영구적으로 사용 가능합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 