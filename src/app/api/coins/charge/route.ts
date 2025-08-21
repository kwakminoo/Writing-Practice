import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserCoinBalance } from '../../../lib/auth';
import { supabaseServer } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { packageId, coins } = await request.json();

    if (!packageId || !coins || coins <= 0) {
      return NextResponse.json(
        { error: '유효하지 않은 충전 정보입니다.' },
        { status: 400 }
      );
    }

    // 사용자 인증
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user;

    // 현재 코인 잔액 조회
    const balanceResult = await getUserCoinBalance(user.id);
    if (!balanceResult.success) {
      return NextResponse.json({ error: balanceResult.error }, { status: 500 });
    }

    const currentCoins = balanceResult.balance!;
    const newCoins = currentCoins + coins;

    // 코인 충전 (users 테이블 업데이트)
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ coins: newCoins })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: '코인 충전에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      addedCoins: coins,
      newBalance: newCoins,
      packageId
    });

  } catch (error) {
    return NextResponse.json({ 
      error: '코인 충전 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 