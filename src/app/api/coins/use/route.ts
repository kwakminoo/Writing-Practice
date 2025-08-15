import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드용 Supabase 클라이언트 (service_role 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// service_role 키가 없으면 일반 클라이언트 사용
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { serviceType, amount } = await req.json();
    
    if (!serviceType || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 사용자 인증 확인
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 현재 코인 잔액 확인 (users 테이블의 coins 컬럼 사용)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('사용자 코인 잔액 조회 오류:', userError);
      return NextResponse.json({ error: 'Failed to fetch coin balance' }, { status: 500 });
    }

    const currentCoins = userData?.coins || 0;
    
    // 코인 부족 확인
    if (currentCoins < amount) {
      return NextResponse.json({ 
        error: 'Insufficient coins',
        currentBalance: currentCoins,
        requiredAmount: amount
      }, { status: 400 });
    }

    // 코인 차감 (users 테이블의 coins 컬럼 업데이트)
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: currentCoins - amount })
      .eq('id', user.id);

    if (updateError) {
      console.error('코인 차감 오류:', updateError);
      return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
    }

    const newBalance = currentCoins - amount;

    return NextResponse.json({ 
      success: true,
      usedAmount: amount,
      newBalance: newBalance,
      serviceType
    });

  } catch (error) {
    console.error('코인 사용 중 오류:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 