const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkNovelTypes() {
  console.log('=== 소설 파트 타입별 데이터 수 확인 ===\n');
  
  // 소설 카테고리의 모든 타입 조회
  const { data: novelData, error } = await supabase
    .from('practice_problems')
    .select('type')
    .eq('category', '소설');
  
  if (error) {
    console.error('데이터 조회 오류:', error);
    return;
  }
  
  // 타입별 개수 계산
  const typeCounts = {};
  novelData.forEach(item => {
    const type = item.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  console.log('📊 소설 파트 타입별 데이터 수:');
  console.log('─'.repeat(50));
  
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  
  let totalCount = 0;
  let incompleteTypes = [];
  
  for (const [type, count] of sortedTypes) {
    const status = count >= 1000 ? '✅' : '⚠️';
    const missing = count >= 1000 ? '' : ` (${1000 - count}개 부족)`;
    
    console.log(`${status} ${type}: ${count}개${missing}`);
    
    if (count < 1000) {
      incompleteTypes.push({ type, count, missing: 1000 - count });
    }
    
    totalCount += count;
  }
  
  console.log('─'.repeat(50));
  console.log(`📈 총 데이터 수: ${totalCount}개`);
  console.log(`📋 총 타입 수: ${sortedTypes.length}개`);
  
  if (incompleteTypes.length > 0) {
    console.log('\n⚠️ 1000개 미만인 타입들:');
    incompleteTypes.forEach(({ type, count, missing }) => {
      console.log(`  • ${type}: ${count}개 (${missing}개 부족)`);
    });
  } else {
    console.log('\n✅ 모든 타입이 1000개 이상입니다!');
  }
  
  console.log('\n=== 확인 완료 ===');
}

checkNovelTypes().catch(console.error); 