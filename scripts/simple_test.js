const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function simpleTest() {
  console.log('=== 간단한 데이터 조회 테스트 ===');
  
  try {
    // 1. 가장 최근 데이터 5개 조회
    console.log('\n1. 최근 데이터 5개 조회...');
    const { data: recentData, error: recentError } = await supabase
      .from('practice_problems')
      .select('*')
      .order('id', { ascending: false })
      .limit(5);
    
    if (recentError) {
      console.error('최근 데이터 조회 오류:', recentError);
    } else {
      console.log('최근 데이터:');
      recentData.forEach((item, idx) => {
        console.log(`${idx + 1}. ID: ${item.id}, Type: "${item.type}", Category: "${item.category}"`);
      });
    }
    
    // 2. ID 범위로 조회 (처음 10개)
    console.log('\n2. 처음 10개 데이터 조회...');
    const { data: firstData, error: firstError } = await supabase
      .from('practice_problems')
      .select('*')
      .order('id', { ascending: true })
      .limit(10);
    
    if (firstError) {
      console.error('처음 데이터 조회 오류:', firstError);
    } else {
      console.log('처음 데이터:');
      firstData.forEach((item, idx) => {
        console.log(`${idx + 1}. ID: ${item.id}, Type: "${item.type}", Category: "${item.category}"`);
      });
    }
    
    // 3. 중간 범위 조회 (ID 1000-1010)
    console.log('\n3. 중간 범위 데이터 조회 (ID 1000-1010)...');
    const { data: middleData, error: middleError } = await supabase
      .from('practice_problems')
      .select('*')
      .gte('id', 1000)
      .lte('id', 1010);
    
    if (middleError) {
      console.error('중간 데이터 조회 오류:', middleError);
    } else {
      console.log('중간 데이터:');
      middleData.forEach((item, idx) => {
        console.log(`${idx + 1}. ID: ${item.id}, Type: "${item.type}", Category: "${item.category}"`);
      });
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

simpleTest(); 