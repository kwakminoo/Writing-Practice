import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('subscription_status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('구독 정보 조회 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, subscription_type, subscription_status = 'active' } = await req.json();
    
    if (!user_id || !subscription_type) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }
    
    // 기존 구독을 비활성화
    await supabase
      .from('user_subscriptions')
      .update({ subscription_status: 'cancelled' })
      .eq('user_id', user_id)
      .eq('subscription_status', 'active');
    
    // 새 구독 생성
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert([{
        user_id,
        subscription_type,
        subscription_status,
        start_date: new Date().toISOString(),
        end_date: null
      }])
      .select()
      .single();
    
    if (error) {
      console.error('구독 생성 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 