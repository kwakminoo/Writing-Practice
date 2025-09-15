const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkNovelWithPagination() {
  console.log('=== 소설 데이터 페이지네이션 확인 ===\n');
  
  let allNovelData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('practice_problems')
      .select('type, category')
      .eq('category', '소설')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error(`페이지 ${page} 조회 오류:`, error);
      break;
    }

    if (data.length === 0) {
      hasMore = false;
    } else {
      allNovelData = allNovelData.concat(data);
      console.log(`  페이지 ${page + 1}: ${data.length}개 데이터 수집`);
      page++;
    }
  }

  console.log(`\n📊 총 소설 데이터 수: ${allNovelData.length}개`);
  
  // 타입별 개수 계산
  const typeCounts = {};
  allNovelData.forEach(item => {
    const type = item.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  
  console.log('\n📋 타입별 데이터 수:');
  console.log('─'.repeat(50));
  
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  
  for (const [type, count] of sortedTypes) {
    const status = count >= 1000 ? '✅' : '⚠️';
    const missing = count >= 1000 ? '' : ` (${1000 - count}개 부족)`;
    
    console.log(`${status} ${type}: ${count}개${missing}`);
  }
  
  console.log('─'.repeat(50));
  console.log(`📈 총 타입 수: ${sortedTypes.length}개`);
  
  console.log('\n=== 확인 완료 ===');
}

checkNovelWithPagination().catch(console.error); 