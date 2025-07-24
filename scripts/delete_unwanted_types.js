const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

// 유지할 타입들
const KEEP_TYPES = ['문제 풀이', '테마별 글쓰기', '필사 연습'];

async function deleteUnwantedTypes() {
  console.log('=== 원하지 않는 타입의 데이터만 삭제 ===');
  
  // 1. 현재 테이블의 모든 타입 확인
  console.log('\n1. 현재 테이블의 타입별 데이터 확인...');
  const { data: allData, error: allError } = await supabase.from('practice_problems').select('*');
  
  if (allError) {
    console.error('데이터 조회 오류:', allError);
    return;
  }
  
  console.log(`전체 데이터: ${allData.length}개`);
  
  // 타입별 통계
  const typeStats = {};
  allData.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
  });
  
  console.log('\n=== 현재 타입별 통계 ===');
  Object.keys(typeStats).forEach(type => {
    console.log(`${type}: ${typeStats[type]}개`);
  });
  
  // 2. 삭제할 타입들 찾기
  const typesToDelete = Object.keys(typeStats).filter(type => !KEEP_TYPES.includes(type));
  
  if (typesToDelete.length === 0) {
    console.log('\n삭제할 타입이 없습니다. 모든 타입이 유지 대상입니다.');
    return;
  }
  
  console.log('\n=== 삭제할 타입들 ===');
  typesToDelete.forEach(type => {
    console.log(`- ${type}: ${typeStats[type]}개`);
  });
  
  // 3. 삭제 실행
  console.log('\n2. 원하지 않는 타입 데이터 삭제 중...');
  
  for (const type of typesToDelete) {
    console.log(`\n${type} 타입 삭제 중...`);
    const { error: deleteError } = await supabase
      .from('practice_problems')
      .delete()
      .eq('type', type);
    
    if (deleteError) {
      console.error(`${type} 삭제 오류:`, deleteError);
    } else {
      console.log(`${type} 타입 ${typeStats[type]}개 삭제 완료`);
    }
  }
  
  // 4. 삭제 후 확인
  console.log('\n3. 삭제 후 데이터 확인...');
  const { data: afterData, error: afterError } = await supabase.from('practice_problems').select('*');
  
  if (afterError) {
    console.error('삭제 후 확인 오류:', afterError);
    return;
  }
  
  console.log(`삭제 후 전체 데이터: ${afterData.length}개`);
  
  // 삭제 후 타입별 통계
  const afterTypeStats = {};
  afterData.forEach(item => {
    afterTypeStats[item.type] = (afterTypeStats[item.type] || 0) + 1;
  });
  
  console.log('\n=== 삭제 후 타입별 통계 ===');
  Object.keys(afterTypeStats).forEach(type => {
    console.log(`${type}: ${afterTypeStats[type]}개`);
  });
  
  // 5. 샘플 데이터 출력
  if (afterData.length > 0) {
    console.log('\n=== 남은 데이터 샘플 ===');
    afterData.slice(0, 3).forEach((item, idx) => {
      console.log(`${idx + 1}. Type: ${item.type}, Category: ${item.category}`);
      console.log(`   Prompt: ${item.prompt.substring(0, 50)}...`);
    });
  }
  
  console.log('\n=== 삭제 작업 완료 ===');
}

deleteUnwantedTypes(); 