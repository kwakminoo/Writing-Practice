const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkCurrentTypes() {
  console.log('=== 현재 테이블의 타입별 데이터 확인 ===');
  
  try {
    // 전체 데이터 조회
    const { data, error } = await supabase.from('practice_problems').select('*');
    
    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }
    
    console.log(`총 ${data.length}개의 데이터가 있습니다.`);
    
    // 타입별로 그룹화
    const typeStats = {};
    data.forEach(item => {
      const type = item.type || 'unknown';
      if (!typeStats[type]) {
        typeStats[type] = 0;
      }
      typeStats[type]++;
    });
    
    console.log('\n=== 타입별 데이터 개수 ===');
    Object.keys(typeStats).forEach(type => {
      console.log(`${type}: ${typeStats[type]}개`);
    });
    
    // 샘플 데이터 출력
    console.log('\n=== 타입별 샘플 데이터 ===');
    Object.keys(typeStats).forEach(type => {
      const sampleData = data.find(item => item.type === type);
      if (sampleData) {
        console.log(`\n[${type}]`);
        console.log(`Category: ${sampleData.category}`);
        console.log(`Prompt: ${sampleData.prompt.substring(0, 100)}...`);
      }
    });
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

checkCurrentTypes(); 