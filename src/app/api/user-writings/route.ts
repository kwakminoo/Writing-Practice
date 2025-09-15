import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../lib/auth';
import { supabaseServer } from '../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { user_id, problem_id, content, title, type, is_pinned } = await req.json();
    
    if (!user_id || !content || !title || !type) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user;
    
    // 인증된 사용자와 요청한 사용자가 일치하는지 확인
    if (user.id !== user_id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 구독 정보 확인 (저장 용량 제한)
    let hasActiveSubscription = false;
    try {
      const { data: subscriptionData, error: subscriptionError } = await supabaseServer
        .from('user_subscriptions')
        .select('subscription_status, subscription_type')
        .eq('user_id', user.id)
        .eq('subscription_status', 'active')
        .single();

      if (!subscriptionError && subscriptionData) {
        hasActiveSubscription = true;
      }
    } catch (err) {
      // 구독 정보 조회 실패는 무시하고 계속 진행
    }

    // 저장할 데이터 준비
    const writingData = {
      user_id,
      problem_id: problem_id || null,
      content,
      title,
      type,
      is_pinned: is_pinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 글 저장
    const { data, error } = await supabaseServer
      .from('user_writings')
      .insert(writingData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '글 저장에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      writing: data,
      hasActiveSubscription 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }
    
    // 사용자 구독 상태 확인
    const { data: subscription } = await supabaseServer
      .from('user_subscriptions')
      .select('subscription_type, subscription_status')
      .eq('user_id', user_id)
      .eq('subscription_status', 'active')
      .single();
    
    const isPremium = subscription?.subscription_type === 'premium';
    
    // 모든 글 조회 (단순화)
    const { data, error } = await supabaseServer
      .from('user_writings')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('글 목록 조회 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 