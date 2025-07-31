const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function deleteSpecificType() {
  console.log('=== 시나리오 카테고리의 "결말 재구성" 타입 데이터 삭제 ===');
  
  // 1. 삭제 전 확인
  console.log('\n1. 삭제 전 "결말 재구성" 데이터 확인...');
  const { data: beforeData, error: beforeError } = await supabase
    .from('practice_problems')
    .select('*')
    .eq('type', '결말 재구성')
    .eq('category', '시나리오');
  
  if (beforeError) {
    console.error('데이터 조회 오류:', beforeError);
    return;
  }
  
  console.log(`삭제할 데이터: ${beforeData.length}개`);
  
  if (beforeData.length === 0) {
    console.log('삭제할 "결말 재구성" 데이터가 없습니다.');
    return;
  }
  
  // 샘플 데이터 출력
  console.log('\n=== 삭제할 데이터 샘플 ===');
  beforeData.slice(0, 3).forEach((item, idx) => {
    console.log(`${idx + 1}. ID: ${item.id}, Type: ${item.type}, Category: ${item.category}`);
    console.log(`   Prompt: ${item.prompt.substring(0, 100)}...`);
  });
  
  // 2. 삭제 실행
  console.log('\n2. "결말 재구성" 데이터 삭제 중...');
  const { error: deleteError } = await supabase
    .from('practice_problems')
    .delete()
    .eq('type', '결말 재구성')
    .eq('category', '시나리오');
  
  if (deleteError) {
    console.error('삭제 오류:', deleteError);
    return;
  }
  
  console.log(`✅ ${beforeData.length}개의 "결말 재구성" 데이터 삭제 완료`);
  
  // 3. 삭제 후 확인
  console.log('\n3. 삭제 후 확인...');
  const { data: afterData, error: afterError } = await supabase
    .from('practice_problems')
    .select('*')
    .eq('type', '결말 재구성')
    .eq('category', '시나리오');
  
  if (afterError) {
    console.error('삭제 후 확인 오류:', afterError);
    return;
  }
  
  console.log(`삭제 후 남은 "결말 재구성" 데이터: ${afterData.length}개`);
  
  if (afterData.length === 0) {
    console.log('✅ 모든 "결말 재구성" 데이터가 성공적으로 삭제되었습니다.');
  } else {
    console.log('⚠️ 일부 데이터가 남아있습니다.');
  }
  
  // 4. 전체 데이터 확인
  console.log('\n4. 전체 데이터 확인...');
  const { data: allData, error: allError } = await supabase.from('practice_problems').select('*');
  
  if (allError) {
    console.error('전체 데이터 확인 오류:', allError);
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
  
  console.log('\n=== 삭제 작업 완료 ===');
}

deleteSpecificType(); 