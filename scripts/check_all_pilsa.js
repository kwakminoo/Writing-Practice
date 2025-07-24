const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkAllPilsa() {
  console.log('=== 필사 연습 모든 데이터 확인 ===');
  
  try {
    // 1. 전체 개수 확인
    const { count, error: countError } = await supabase
      .from('practice_problems')
      .select('*', { count: 'exact', head: true })
      .eq('type', '필사 연습');
    
    if (countError) {
      console.error('개수 확인 오류:', countError);
      return;
    }
    
    console.log(`총 ${count}개의 필사 연습 데이터가 있습니다.\n`);
    
    // 2. 모든 데이터 조회 (페이지네이션 사용)
    let allData = [];
    let from = 0;
    const limit = 1000;
    
    while (true) {
      console.log(`${from + 1}~${from + limit}번째 데이터 조회 중...`);
      
      const { data, error } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('type', '필사 연습')
        .range(from, from + limit - 1);
      
      if (error) {
        console.error('데이터 조회 오류:', error);
        break;
      }
      
      if (!data || data.length === 0) {
        break;
      }
      
      allData = allData.concat(data);
      from += limit;
      
      if (data.length < limit) {
        break;
      }
    }
    
    console.log(`\n총 ${allData.length}개의 데이터를 조회했습니다.\n`);
    
    // 3. 카테고리별 통계
    const categoryStats = {};
    allData.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });
    
    console.log('=== 카테고리별 통계 ===');
    Object.keys(categoryStats).forEach(category => {
      console.log(`${category}: ${categoryStats[category]}개`);
    });
    
    // 4. 모든 데이터 출력
    console.log('\n=== 모든 필사 연습 데이터 ===');
    allData.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Category: ${item.category}`);
      console.log(`   Prompt: ${item.prompt}`);
      console.log('');
    });
    
    console.log(`\n총 ${allData.length}개의 필사 연습 데이터 확인 완료!`);
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

checkAllPilsa(); 