import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserCoinBalance } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user;

    // 코인 잔액 조회
    const balanceResult = await getUserCoinBalance(user.id);
    if (!balanceResult.success) {
      return NextResponse.json({ error: balanceResult.error }, { status: 500 });
    }

    return NextResponse.json({ balance: balanceResult.balance }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ 
      error: '코인 잔액 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 