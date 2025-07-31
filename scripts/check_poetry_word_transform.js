const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkPoetryWordTransform() {
  console.log('=== 시어변형 타입 데이터 확인 ===');
  
  try {
    // 시어변형 타입 데이터 조회
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '시어 변형');
    
    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }
    
    console.log(`총 ${data.length}개의 시어변형 데이터가 있습니다.`);
    
    if (data.length > 0) {
      console.log('\n=== 샘플 데이터 ===');
      data.slice(0, 3).forEach((item, idx) => {
        console.log(`${idx + 1}. ID: ${item.id}, Category: ${item.category}, Type: ${item.type}`);
        console.log(`   Prompt: ${item.prompt.substring(0, 100)}...`);
      });
      
      // 타입별로 그룹화
      const typeGroups = {};
      data.forEach(item => {
        const type = item.type || 'unknown';
        if (!typeGroups[type]) {
          typeGroups[type] = [];
        }
        typeGroups[type].push(item);
      });
      
      console.log('\n=== 타입별 개수 ===');
      Object.keys(typeGroups).forEach(type => {
        console.log(`${type}: ${typeGroups[type].length}개`);
      });
    } else {
      console.log('시어변형 타입의 데이터가 없습니다.');
    }
  } catch (err) {
    console.error(`테이블 접근 오류:`, err.message);
  }
}

checkPoetryWordTransform(); 