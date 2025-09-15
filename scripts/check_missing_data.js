const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkMissingData() {
  console.log('=== 누락된 데이터 확인 ===\n');
  
  // 시 파트 누락된 타입들
  const missingPoetryTypes = [
    '즉흥시',
    '한 문장 시', 
    '감각 분리 시',
    '주제 변주',
    '시어 변형',
    '즉흥시 (입시)',
    '한 문장 시 (입시)',
    '감각 분리 시 (입시)',
    '주제 변주 (입시)'
  ];
  
  // 소설 파트 누락된 타입들
  const missingNovelTypes = [
    '필사 연습',
    '5감각 묘사 연습'
  ];
  
  console.log('📊 시 파트 누락된 타입별 현재 데이터 수:');
  for (const type of missingPoetryTypes) {
    const { count, error } = await supabase
      .from('practice_problems')
      .select('*', { count: 'exact', head: true })
      .eq('category', '시')
      .eq('type', type);
    
    if (error) {
      console.error(`${type} 조회 오류:`, error);
      continue;
    }
    
    console.log(`  ${type}: ${count}개`);
  }
  
  console.log('\n📊 소설 파트 누락된 타입별 현재 데이터 수:');
  for (const type of missingNovelTypes) {
    const { count, error } = await supabase
      .from('practice_problems')
      .select('*', { count: 'exact', head: true })
      .eq('category', '소설')
      .eq('type', type);
    
    if (error) {
      console.error(`${type} 조회 오류:`, error);
      continue;
    }
    
    console.log(`  ${type}: ${count}개`);
  }
  
  console.log('\n=== 누락된 데이터 확인 완료 ===');
}

checkMissingData().catch(console.error); 