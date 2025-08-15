import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드용 Supabase 클라이언트 (service_role 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { packageId, coins } = await request.json();

    if (!packageId || !coins || coins <= 0) {
      return NextResponse.json(
        { error: '유효하지 않은 충전 정보입니다.' },
        { status: 400 }
      );
    }

    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 현재 코인 잔액 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('사용자 코인 잔액 조회 오류:', userError);
      return NextResponse.json({ error: 'Failed to fetch user coin balance' }, { status: 500 });
    }

    const currentCoins = userData?.coins || 0;
    const newCoins = currentCoins + coins;

    // 코인 충전 (users 테이블 업데이트)
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: newCoins })
      .eq('id', user.id);

    if (updateError) {
      console.error('코인 충전 오류:', updateError);
      return NextResponse.json({ error: 'Failed to charge coins' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      coinsCharged: coins,
      newBalance: newCoins,
      message: `${coins}코인이 성공적으로 충전되었습니다.`
    });

  } catch (error) {
    console.error('코인 충전 중 오류:', error);
    return NextResponse.json(
      { error: '코인 충전 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 