import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { user_id, problem_id, content, title, type, is_pinned = false } = await req.json();
    
    // 사용자 구독 상태 확인
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_type, subscription_status')
      .eq('user_id', user_id)
      .eq('subscription_status', 'active')
      .single();
    
    // 기본값은 'free'로 설정
    let storage_tier = 'free';
    if (subscription?.subscription_type === 'premium') {
      storage_tier = 'premium';
    } else if (subscription?.subscription_type === 'basic') {
      storage_tier = 'basic';
    }
    
    // 글 저장 (구독 정보 포함)
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
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