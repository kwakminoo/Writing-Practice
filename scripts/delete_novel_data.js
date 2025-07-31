const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function deleteNovelData() {
  console.log('=== 소설 카테고리 데이터 삭제 시작 ===\n');
  
  // 먼저 소설 데이터 개수 확인
  const { data: novelData, error: countError } = await supabase
    .from('practice_problems')
    .select('id')
    .eq('category', '소설');
  
  if (countError) {
    console.error('데이터 조회 오류:', countError);
    return;
  }
  
  console.log(`📊 삭제할 소설 데이터 수: ${novelData.length}개`);
  
  if (novelData.length === 0) {
    console.log('⚠️ 삭제할 소설 데이터가 없습니다.');
    return;
  }
  
  // 소설 카테고리 데이터 삭제
  const { error: deleteError } = await supabase
    .from('practice_problems')
    .delete()
    .eq('category', '소설');
  
  if (deleteError) {
    console.error('❌ 삭제 오류:', deleteError);
    return;
  }
  
  console.log('✅ 소설 카테고리 데이터 삭제 완료!');
  console.log(`📊 삭제된 데이터 수: ${novelData.length}개`);
  
  // 삭제 후 확인
  const { data: remainingData, error: checkError } = await supabase
    .from('practice_problems')
    .select('id')
    .eq('category', '소설');
  
  if (checkError) {
    console.error('확인 오류:', checkError);
    return;
  }
  
  console.log(`📊 삭제 후 남은 소설 데이터 수: ${remainingData.length}개`);
  
  if (remainingData.length === 0) {
    console.log('✅ 모든 소설 데이터가 성공적으로 삭제되었습니다!');
  } else {
    console.log('⚠️ 일부 소설 데이터가 남아있습니다.');
  }
  
  console.log('\n=== 소설 카테고리 데이터 삭제 완료 ===');
}

deleteNovelData().catch(console.error); 