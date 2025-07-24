const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function deleteAllData() {
  console.log('=== 테이블의 모든 데이터 삭제 ===\n');

  // 1. 현재 데이터 개수 확인
  console.log('1. 현재 데이터 개수 확인 중...');
  let totalCount = 0;
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .range(from, from + limit - 1);

    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }

    if (!data || data.length === 0) break;
    
    totalCount += data.length;
    from += limit;
  }

  console.log(`총 ${totalCount}개 데이터 발견\n`);

  if (totalCount === 0) {
    console.log('✅ 테이블이 이미 비어있습니다.');
    return;
  }

  // 2. 모든 데이터 삭제
  console.log('2. 모든 데이터 삭제 중...');
  const { data: deleteResult, error: deleteError } = await supabase
    .from('practice_problems')
    .delete()
    .neq('id', 0); // 모든 데이터 삭제 (id가 0이 아닌 모든 행)

  if (deleteError) {
    console.error('삭제 오류:', deleteError);
    return;
  }

  console.log(`✅ ${totalCount}개 데이터 삭제 완료!`);

  // 3. 최종 확인
  console.log('\n3. 최종 확인 중...');
  const { data: finalCheck, error: finalError } = await supabase
    .from('practice_problems')
    .select('*')
    .limit(1);

  if (finalError) {
    console.error('최종 확인 오류:', finalError);
  } else {
    if (!finalCheck || finalCheck.length === 0) {
      console.log('✅ 테이블이 완전히 비워졌습니다.');
    } else {
      console.log('⚠️ 일부 데이터가 남아있을 수 있습니다.');
    }
  }
}

deleteAllData(); 