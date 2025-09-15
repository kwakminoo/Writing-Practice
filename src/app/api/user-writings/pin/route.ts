import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';

export async function PATCH(req: Request) {
  try {
    const { user_id, writing_id, is_pinned } = await req.json();
    
    if (!user_id || !writing_id) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }
    
    // 사용자 구독 정보 확인
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_type, subscription_status')
      .eq('user_id', user_id)
      .eq('subscription_status', 'active')
      .single();
    
    // 구독 플랜에 따른 고정 제한 확인
    const subscriptionType = subscription?.subscription_type || 'free';
    const plan = SUBSCRIPTION_PLANS.find(p => p.storageTier === subscriptionType);
    
    if (!plan) {
      return NextResponse.json({ error: '구독 정보를 찾을 수 없습니다.' }, { status: 400 });
    }
    
    // 고정하려는 경우 제한 확인
    if (is_pinned && plan.maxPinned !== -1) {
      const { data: pinnedWritings } = await supabase
        .from('user_writings')
        .select('id')
        .eq('user_id', user_id)
        .eq('is_pinned', true);
      
      if (pinnedWritings && pinnedWritings.length >= plan.maxPinned) {
        return NextResponse.json({ 
          error: `${plan.name} 플랜에서는 최대 ${plan.maxPinned}개까지 고정할 수 있습니다.` 
        }, { status: 400 });
      }
    }
    
    // 고정 상태 업데이트
    const { data, error } = await supabase
      .from('user_writings')
      .update({ is_pinned })
      .eq('id', writing_id)
      .eq('user_id', user_id)
      .select()
      .single();
    
    if (error) {
      console.error('고정 상태 변경 오류:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 