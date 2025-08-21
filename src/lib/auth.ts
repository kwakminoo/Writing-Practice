import { NextRequest } from 'next/server';
import { supabaseServer } from './supabaseClient';

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
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    
    if (authError || !user) {
      return { success: false, error: 'Invalid token' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * 사용자 코인 잔액을 조회하는 공통 함수
 */
export async function getUserCoinBalance(userId: string): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError) {
      return { success: false, error: 'Failed to fetch user coin balance' };
    }

    return { success: true, balance: userData?.coins || 0 };
  } catch (error) {
    return { success: false, error: 'Failed to fetch coin balance' };
  }
}

/**
 * 사용자 코인을 차감하는 공통 함수
 */
export async function deductUserCoins(userId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();

    if (userError) {
      return { success: false, error: 'Failed to fetch user coin balance' };
    }

    const currentCoins = userData?.coins || 0;
    if (currentCoins < amount) {
      return { success: false, error: 'Insufficient coins' };
    }

    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ coins: currentCoins - amount })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: 'Failed to deduct coins' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to deduct coins' };
  }
}
