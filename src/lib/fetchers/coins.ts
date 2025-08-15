import { supabase } from '@/lib/supabaseClient';

// Phase B2 - Coins 비즈니스 로직 분리
// API route에서 사용할 코인 관련 fetcher 함수들

export interface CoinBalanceResult {
  success: boolean;
  data?: {
    balance: number;
    message: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function getCoinBalance(userId: string): Promise<CoinBalanceResult> {
  try {
    // ANON_KEY 사용 (RLS 정책에 의존)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('사용자 코인 잔액 조회 오류:', userError);
      return {
        success: false,
        error: {
          code: 'BALANCE_FETCH_ERROR',
          message: 'Failed to fetch coin balance'
        }
      };
    }

    const balance = userData?.coins || 0;

    return {
      success: true,
      data: {
        balance,
        message: '코인 잔액이 성공적으로 조회되었습니다.'
      }
    };

  } catch (error) {
    console.error('코인 잔액 조회 중 오류:', error);
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: '코인 잔액 조회 중 오류가 발생했습니다.'
      }
    };
  }
}
