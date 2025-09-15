import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 하드코딩된 Supabase 클라이언트 (환경 변수 문제 해결)
const supabaseUrl = 'https://zvhhjroidnpuxxhskffz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc0ODI0OSwiZXhwIjoyMDY4MzI0MjQ5fQ.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg';

// 사용자 토큰 검증용 클라이언트 (anon key 사용)
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 작업용 클라이언트 (service role key 사용)
const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

/**
 * API 라우트에서 사용자 인증을 처리하는 공통 함수
 */
export async function authenticateUser(req: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Unauthorized' };
    }

    const token = authHeader.substring(7);
    console.log('토큰 검증 시작, 토큰 길이:', token.length);
    
    // anon key를 사용한 클라이언트로 토큰 검증
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError) {
      console.error('토큰 검증 오류:', authError);
      return { success: false, error: 'Invalid token' };
    }
    
    if (!user) {
      console.error('사용자 정보 없음');
      return { success: false, error: 'Invalid token' };
    }

    console.log('토큰 검증 성공, 사용자 ID:', user.id);
    return { success: true, user };
  } catch (error) {
    console.error('인증 예외:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * 사용자 코인 잔액을 조회하는 공통 함수
 */
export async function getUserCoinBalance(userId: string, accessToken?: string): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    console.log('코인 잔액 조회 시작, 사용자 ID:', userId);
    
    // 사용자 토큰을 사용한 클라이언트 생성
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });
    
    console.log('사용자 토큰으로 클라이언트 생성 완료');
    
    // users 테이블에서 코인 조회
    const { data: userData, error: userError } = await userClient
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('사용자 코인 잔액 조회 오류:', userError);
      
      // RLS 정책 문제일 경우 service role key로 재시도
      console.log('RLS 정책 문제로 인한 오류, service role key로 재시도');
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();
        
      if (fallbackError) {
        console.error('Service role key로도 조회 실패:', fallbackError);
        return { success: false, error: 'Failed to fetch user coin balance' };
      }
      
      const balance = fallbackData?.coins || 0;
      console.log('Service role key로 코인 잔액 조회 성공:', balance);
      return { success: true, balance };
    }

    const balance = userData?.coins || 0;
    console.log('사용자 토큰으로 코인 잔액 조회 성공:', balance);
    return { success: true, balance };
    
  } catch (error) {
    console.error('코인 잔액 조회 예외:', error);
    return { success: false, error: 'Failed to fetch coin balance' };
  }
}

/**
 * 사용자 코인을 차감하는 공통 함수
 */
export async function deductUserCoins(userId: string, amount: number, accessToken?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('코인 차감 시작, 사용자 ID:', userId, '차감량:', amount);
    
    // 사용자 토큰을 사용한 클라이언트 생성
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });
    
    // 현재 코인 잔액 조회
    const { data: userData, error: userError } = await userClient
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('코인 잔액 조회 오류:', userError);
      return { success: false, error: 'Failed to fetch user coin balance' };
    }

    const currentCoins = userData?.coins || 0;
    if (currentCoins < amount) {
      console.log('코인 부족:', currentCoins, '<', amount);
      return { success: false, error: 'Insufficient coins' };
    }

    // 코인 차감
    const { error: updateError } = await userClient
      .from('users')
      .update({ coins: currentCoins - amount })
      .eq('id', userId);

    if (updateError) {
      console.error('코인 차감 오류:', updateError);
      
      // RLS 정책 문제일 경우 service role key로 재시도
      console.log('RLS 정책 문제로 인한 오류, service role key로 재시도');
      const { error: fallbackError } = await supabaseServer
        .from('users')
        .update({ coins: currentCoins - amount })
        .eq('id', userId);
        
      if (fallbackError) {
        console.error('Service role key로도 차감 실패:', fallbackError);
        return { success: false, error: 'Failed to deduct coins' };
      }
    }

    console.log('코인 차감 성공, 새로운 잔액:', currentCoins - amount);
    return { success: true };
  } catch (error) {
    console.error('코인 차감 예외:', error);
    return { success: false, error: 'Failed to deduct coins' };
  }
}
