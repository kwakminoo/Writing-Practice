const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkAllTypes() {
  console.log('=== 모든 타입 정확히 확인 (페이지네이션 사용) ===');
  
  try {
    // 페이지네이션을 사용하여 모든 데이터 조회
    console.log('\n1. 모든 데이터 조회 중...');
    let allData = [];
    let from = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data: pageData, error: pageError } = await supabase
        .from('practice_problems')
        .select('type')
        .range(from, from + pageSize - 1);
      
      if (pageError) {
        console.error('페이지 조회 오류:', pageError);
        break;
      }
      
      if (!pageData || pageData.length === 0) {
        break;
      }
      
      allData = allData.concat(pageData);
      from += pageSize;
      
      console.log(`${from}개까지 조회 완료...`);
      
      // 마지막 페이지인지 확인
      if (pageData.length < pageSize) {
        break;
      }
    }
    
    console.log(`총 ${allData.length}개의 데이터를 조회했습니다.`);
    
    // 타입별로 그룹화
    const typeStats = {};
    allData.forEach(item => {
      const type = item.type || 'unknown';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });
    
    console.log('\n=== 타입별 데이터 개수 ===');
    Object.keys(typeStats).forEach(type => {
      console.log(`- ${type}: ${typeStats[type]}개`);
    });
    
    // 각 타입별 샘플 데이터
    console.log('\n=== 각 타입별 샘플 데이터 ===');
    const types = Object.keys(typeStats);
    
    for (const type of types) {
      const { data: sampleData, error: sampleError } = await supabase
        .from('practice_problems')
        .select('*')
        .eq('type', type)
        .limit(1);
      
      if (sampleError) {
        console.error(`${type} 샘플 조회 오류:`, sampleError);
      } else if (sampleData.length > 0) {
        console.log(`\n[${type}]`);
        console.log(`Category: ${sampleData[0].category}`);
        console.log(`Prompt: ${sampleData[0].prompt.substring(0, 80)}...`);
      }
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

checkAllTypes(); 