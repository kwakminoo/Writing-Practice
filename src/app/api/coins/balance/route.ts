import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserCoinBalance } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('=== 코인 조회 API 시작 ===');
    
    // 사용자 인증
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      console.log('인증 실패:', authResult.error);
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user;
    console.log('인증된 사용자 ID:', user.id);

    // 사용자 토큰 추출
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    // 코인 잔액 조회
    const balanceResult = await getUserCoinBalance(user.id, accessToken);
    if (!balanceResult.success) {
      console.error('코인 잔액 조회 실패:', balanceResult.error);
      return NextResponse.json({ error: balanceResult.error }, { status: 500 });
    }

    const balance = balanceResult.balance || 0;
    console.log('사용자 코인 잔액:', balance);

    return NextResponse.json({ balance }, { status: 200 });

  } catch (error) {
    console.error('코인 잔액 조회 중 오류:', error);
    return NextResponse.json({ 
      error: '코인 잔액 조회 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 