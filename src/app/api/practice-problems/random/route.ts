import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    if (!type) {
      return NextResponse.json({ 
        error: 'Type parameter is required' 
      }, { status: 400 });
    }
    
    let query = supabase.from('practice_problems').select('*');
    
    // type 필드로 조회
    query = query.eq('type', type);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Database query failed',
        details: error.message 
      }, { status: 500 });
    }
    
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
    
    console.log(`Found ${data.length} records for type: ${type}, returning 1 random record`);
    
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