const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkWithSQL() {
  console.log('=== SQL 쿼리로 타입별 데이터 확인 ===');
  
  try {
    // 1. 전체 개수 확인
    console.log('\n1. 전체 데이터 개수 확인...');
    const { count, error: countError } = await supabase
      .from('practice_problems')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('개수 조회 오류:', countError);
    } else {
      console.log(`전체 데이터 개수: ${count}개`);
    }
    
    // 2. 모든 데이터를 가져와서 타입별로 그룹화
    console.log('\n2. 타입별 개수 확인...');
    const { data: allData, error: allError } = await supabase
      .from('practice_problems')
      .select('type');
    
    if (allError) {
      console.error('전체 데이터 조회 오류:', allError);
    } else {
      const typeStats = {};
      allData.forEach(item => {
        const type = item.type || 'unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;
      });
      
      console.log('타입별 데이터 개수:');
      Object.keys(typeStats).forEach(type => {
        console.log(`- ${type}: ${typeStats[type]}개`);
      });
    }
    
    // 3. 각 타입별 샘플 데이터 확인
    console.log('\n3. 각 타입별 샘플 데이터 확인...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('practice_problems')
      .select('*')
      .limit(10);
    
    if (sampleError) {
      console.error('샘플 데이터 조회 오류:', sampleError);
    } else {
      console.log('샘플 데이터:');
      sampleData.forEach((item, idx) => {
        console.log(`${idx + 1}. Type: ${item.type}, Category: ${item.category}`);
        console.log(`   Prompt: ${item.prompt.substring(0, 50)}...`);
      });
    }
    
    // 4. 특정 타입으로 조회 테스트
    console.log('\n4. 특정 타입 조회 테스트...');
    const testTypes = ['필사 연습', '제작성 훈련', '5감각 묘사 연습', '문제 풀이'];
    
    for (const type of testTypes) {
      const { data: testData, error: testError } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('type', type)
        .limit(1);
      
      if (testError) {
        console.error(`${type} 조회 오류:`, testError);
      } else {
        console.log(`${type}: ${testData.length}개 발견`);
      }
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

checkWithSQL(); 