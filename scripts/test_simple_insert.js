const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function testSimpleInsert() {
  console.log('=== 간단한 테스트 데이터 삽입 ===');
  
  // 1. 기존 데이터 확인
  console.log('\n1. 기존 데이터 확인...');
  const { data: existingData, error: existingError } = await supabase.from('practice_problems').select('*');
  
  if (existingError) {
    console.error('기존 데이터 확인 오류:', existingError);
    return;
  }
  
  console.log(`기존 데이터: ${existingData.length}개`);
  
  // 2. 간단한 테스트 데이터 삽입
  console.log('\n2. 테스트 데이터 삽입...');
  const testData = [
    {
      category: '소설',
      type: '필사 연습',
      prompt: '테스트 데이터: 밤하늘을 보며 주인공은 처음으로 자신의 꿈을 직면했다.'
    }
  ];
  
  const { data: insertData, error: insertError } = await supabase.from('practice_problems').insert(testData);
  
  if (insertError) {
    console.error('삽입 오류:', insertError);
    console.error('오류 상세:', JSON.stringify(insertError, null, 2));
    return;
  }
  
  console.log('테스트 데이터 삽입 성공');
  console.log('삽입된 데이터:', insertData);
  
  // 3. 삽입 후 데이터 확인
  console.log('\n3. 삽입 후 데이터 확인...');
  const { data: afterData, error: afterError } = await supabase.from('practice_problems').select('*');
  
  if (afterError) {
    console.error('삽입 후 확인 오류:', afterError);
    return;
  }
  
  console.log(`삽입 후 데이터: ${afterData.length}개`);
  
  if (afterData.length > 0) {
    console.log('샘플 데이터:');
    afterData.slice(0, 3).forEach((item, idx) => {
      console.log(`${idx + 1}. ${JSON.stringify(item, null, 2)}`);
    });
  }
  
  // 4. 특정 타입으로 조회 테스트
  console.log('\n4. 타입별 조회 테스트...');
  const { data: typeData, error: typeError } = await supabase
    .from('practice_problems')
    .select('*')
    .eq('type', '필사 연습');
  
  if (typeError) {
    console.error('타입 조회 오류:', typeError);
  } else {
    console.log(`'필사 연습' 타입 데이터: ${typeData.length}개`);
  }
}

testSimpleInsert(); 