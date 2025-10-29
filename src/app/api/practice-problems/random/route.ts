import { supabase } from '@/lib/index';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    console.log('=== API 시작 ===');
    console.log('환경 변수 확인:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '설정 안됨');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정 안됨');
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    console.log(`API 호출: type=${type}`);
    
    if (!type) {
      return NextResponse.json({ 
        error: 'Type parameter is required' 
      }, { status: 400 });
    }
    
    console.log('Supabase 클라이언트 사용 중...');
    
    let query = supabase.from('practice_problems').select('*');
    
    // type 필드로 조회
    query = query.eq('type', type);
    
    console.log(`데이터베이스 쿼리 실행: type="${type}"`);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message 
      }, { status: 500 });
    }
    
    console.log(`쿼리 결과: ${data?.length || 0}개 데이터 발견`);
    
    // 데이터가 없으면 빈 배열 반환
    if (!data || data.length === 0) {
      console.log(`No data found for type: ${type}`);
      return NextResponse.json({ 
        data: [],
        message: `No problems found for type: ${type}`
      });
    }
    
    // 랜덤하게 하나 선택
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomData = [data[randomIndex]];
    
    console.log(`Found ${data.length} records for type: ${type}, returning 1 random record (index: ${randomIndex})`);
    console.log(`선택된 데이터:`, randomData[0]);
    
    return NextResponse.json({ 
      data: randomData,
      total: data.length,
      selected: randomIndex + 1
    });
    
  } catch (error) {
    console.error('Unexpected error in practice-problems API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 