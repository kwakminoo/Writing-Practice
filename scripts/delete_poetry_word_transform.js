const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function deletePoetryWordTransform() {
  console.log('=== 시어변형 타입 데이터 삭제 ===');
  
  try {
    // 먼저 삭제할 데이터 개수 확인
    const { data: checkData, error: checkError } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '시어 변형');
    
    if (checkError) {
      console.error('데이터 확인 오류:', checkError);
      return;
    }
    
    console.log(`삭제할 시어변형 데이터: ${checkData.length}개`);
    
    if (checkData.length === 0) {
      console.log('삭제할 시어변형 데이터가 없습니다.');
      return;
    }
    
    // 시어변형 타입 데이터 삭제
    const { data, error } = await supabase
      .from('practice_problems')
      .delete()
      .eq('type', '시어 변형');
    
    if (error) {
      console.error('삭제 오류:', error);
      return;
    }
    
    console.log(`✅ ${checkData.length}개의 시어변형 데이터 삭제 완료!`);
    
    // 삭제 후 확인
    const { data: finalCheck, error: finalError } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '시어 변형');
    
    if (finalError) {
      console.error('최종 확인 오류:', finalError);
    } else {
      if (finalCheck.length === 0) {
        console.log('✅ 시어변형 데이터가 완전히 삭제되었습니다.');
      } else {
        console.log(`⚠️ ${finalCheck.length}개의 시어변형 데이터가 남아있습니다.`);
      }
    }
    
    // 전체 데이터 개수 확인
    const { data: totalData, error: totalError } = await supabase
      .from('practice_problems')
      .select('count');
    
    if (totalError) {
      console.error('전체 데이터 확인 오류:', totalError);
    } else {
      console.log(`현재 테이블 전체 데이터 수: ${totalData?.length || 0}개`);
    }
    
  } catch (err) {
    console.error(`삭제 중 오류:`, err.message);
  }
}

deletePoetryWordTransform(); 