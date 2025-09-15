const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkAllNovelTypes() {
  console.log('=== 소설 파트 전체 타입 확인 ===\n');
  
  // 소설 카테고리의 모든 데이터 조회
  const { data: novelData, error } = await supabase
    .from('practice_problems')
    .select('type, prompt')
    .eq('category', '소설');
  
  if (error) {
    console.error('데이터 조회 오류:', error);
    return;
  }
  
  console.log(`📊 총 소설 데이터 수: ${novelData.length}개\n`);
  
  // 타입별 개수 계산
  const typeCounts = {};
  novelData.forEach(item => {
    const type = item.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  console.log('📋 타입별 데이터 수:');
  console.log('─'.repeat(50));
  
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  
  for (const [type, count] of sortedTypes) {
    const status = count >= 1000 ? '✅' : '⚠️';
    const missing = count >= 1000 ? '' : ` (${1000 - count}개 부족)`;
    
    console.log(`${status} ${type}: ${count}개${missing}`);
  }
  
  console.log('─'.repeat(50));
  console.log(`📈 총 타입 수: ${sortedTypes.length}개`);
  
  // 샘플 데이터 확인
  console.log('\n📝 각 타입별 샘플 데이터:');
  for (const [type, count] of sortedTypes) {
    const sample = novelData.find(item => item.type === type);
    if (sample) {
      console.log(`\n• ${type} (${count}개):`);
      console.log(`  "${sample.prompt.substring(0, 100)}..."`);
    }
  }
  
  console.log('\n=== 확인 완료 ===');
}

checkAllNovelTypes().catch(console.error); 