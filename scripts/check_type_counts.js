const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkTypeCounts() {
  console.log('=== 각 파트 타입별 데이터 수 조사 ===\n');
  
  const categories = ['에세이', '시나리오', '시', '소설'];
  
  for (const category of categories) {
    console.log(`📊 ${category} 파트 타입별 데이터 수:`);
    
    // 해당 카테고리의 모든 타입 조회
    const { data: typeData, error: typeError } = await supabase
      .from('practice_problems')
      .select('type')
      .eq('category', category);
    
    if (typeError) {
      console.error(`${category} 타입 데이터 조회 오류:`, typeError);
      continue;
    }
    
    // 타입별 개수 계산
    const typeCounts = {};
    typeData.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });
    
    // 개수별로 정렬하여 출력
    Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}개`);
      });
    
    // 카테고리별 총 개수
    const totalCount = typeData.length;
    console.log(`  ──────────────────────`);
    console.log(`  총 ${totalCount}개\n`);
  }
  
  // 전체 통계
  console.log('📈 전체 타입별 데이터 수 (상위 50개):');
  const { data: allTypeData, error: allTypeError } = await supabase
    .from('practice_problems')
    .select('type, category');
  
  if (allTypeError) {
    console.error('전체 타입별 데이터 조회 오류:', allTypeError);
    return;
  }
  
  const allTypeCounts = {};
  allTypeData.forEach(item => {
    allTypeCounts[item.type] = (allTypeCounts[item.type] || 0) + 1;
  });
  
  Object.entries(allTypeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 50)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}개`);
    });
  
  console.log('\n=== 타입별 데이터 수 조사 완료 ===');
}

checkTypeCounts().catch(console.error); 