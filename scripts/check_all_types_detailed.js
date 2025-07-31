const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkAllTypesDetailed() {
  console.log('=== 모든 타입별 데이터 수 상세 조사 ===\n');
  
  // 전체 데이터 조회 (모든 타입)
  const { data: allData, error: allError } = await supabase
    .from('practice_problems')
    .select('type, category');
  
  if (allError) {
    console.error('전체 데이터 조회 오류:', allError);
    return;
  }
  
  console.log(`📊 전체 데이터 수: ${allData.length}개\n`);
  
  // 타입별 개수 계산
  const typeCounts = {};
  const categoryTypeCounts = {};
  
  allData.forEach(item => {
    // 전체 타입별 개수
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    
    // 카테고리별 타입 개수
    if (!categoryTypeCounts[item.category]) {
      categoryTypeCounts[item.category] = {};
    }
    categoryTypeCounts[item.category][item.type] = (categoryTypeCounts[item.category][item.type] || 0) + 1;
  });
  
  // 카테고리별 상세 분석
  const categories = ['에세이', '시나리오', '시', '소설'];
  
  for (const category of categories) {
    console.log(`📊 ${category} 파트 타입별 데이터 수:`);
    
    if (categoryTypeCounts[category]) {
      Object.entries(categoryTypeCounts[category])
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count}개`);
        });
      
      const categoryTotal = Object.values(categoryTypeCounts[category]).reduce((sum, count) => sum + count, 0);
      console.log(`  ──────────────────────`);
      console.log(`  총 ${categoryTotal}개\n`);
    } else {
      console.log(`  ❌ ${category} 데이터가 없습니다.\n`);
    }
  }
  
  // 전체 타입별 순위 (상위 50개)
  console.log('📈 전체 타입별 데이터 수 순위 (상위 50개):');
  Object.entries(typeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 50)
    .forEach(([type, count], index) => {
      console.log(`  ${index + 1}. ${type}: ${count}개`);
    });
  
  console.log('\n=== 상세 조사 완료 ===');
}

checkAllTypesDetailed().catch(console.error); 