import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('=== 글 저장 API 시작 ===');
    
    // 인증 확인
    const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader ? '있음' : '없음');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('인증 헤더 오류');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('토큰 길이:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('인증 오류:', authError);
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }
    
    console.log('인증 성공, 사용자 ID:', user.id);

    const { user_id, problem_id, content, title, type, is_pinned = false } = await req.json();
    console.log('받은 데이터:', { user_id, problem_id, content: content?.length, title, type, is_pinned });
    
    // 사용자 구독 상태 확인 (오류 무시)
    let subscription = null;
    try {
      const { data: subData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('subscription_type, subscription_status')
        .eq('user_id', user_id)
        .eq('subscription_status', 'active')
        .single();
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.log('구독 정보 조회 오류:', subscriptionError);
      } else {
        subscription = subData;
      }
    } catch (err) {
      console.log('구독 정보 조회 중 예외:', err);
    }
    
    // 기본값은 'free'로 설정
    let storage_tier = 'free';
    if (subscription?.subscription_type === 'premium') {
      storage_tier = 'premium';
    } else if (subscription?.subscription_type === 'basic') {
      storage_tier = 'basic';
    }
    
    // 글 저장 (모든 필드 포함)
    console.log('저장할 데이터:', { 
      user_id, 
      content: content?.length, 
      title: title || '글쓰기',
      storage_tier,
      type: type || 'free_writing',
      problem_id: problem_id || null,
      is_pinned: is_pinned || false
    });
    
    const { data, error } = await supabase
      .from('user_writings')
      .insert([{ 
        user_id, 
        content, 
        title: title || '글쓰기',
        storage_tier,
        type: type || 'free_writing',
        problem_id: problem_id || null,
        is_pinned: is_pinned || false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('글 저장 오류:', error);
      console.error('오류 코드:', error.code);
      console.error('오류 메시지:', error.message);
      console.error('오류 세부사항:', error.details);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('글 저장 성공:', data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
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
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_type, subscription_status')
      .eq('user_id', user_id)
      .eq('subscription_status', 'active')
      .single();
    
    const isPremium = subscription?.subscription_type === 'premium';
    
    // 모든 글 조회 (단순화)
    const { data, error } = await supabase
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