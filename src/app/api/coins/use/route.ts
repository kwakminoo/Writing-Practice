import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, deductUserCoins } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { serviceType, amount } = await req.json();
    
    if (!serviceType || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user;

    // 사용자 토큰 추출
    const authHeader = req.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    // 코인 차감
    const deductResult = await deductUserCoins(user.id, amount, accessToken);
    if (!deductResult.success) {
      return NextResponse.json({ 
        error: deductResult.error,
        currentBalance: 0, // 실제 잔액은 별도 조회 필요
        requiredAmount: amount
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      usedAmount: amount,
      serviceType
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 