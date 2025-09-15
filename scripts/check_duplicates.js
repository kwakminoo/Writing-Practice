const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkData() {
  console.log('=== practice_problems 테이블 확인 ===');
  
  try {
    // 테이블 존재 여부 확인
    console.log('테이블 존재 여부 확인 중...');
    const { data: testData, error: testError } = await supabase
      .from('practice_problems')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('테이블 접근 오류:', testError);
      console.error('오류 코드:', testError.code);
      console.error('오류 메시지:', testError.message);
      return;
    }
    
    console.log('테이블 접근 성공');
    
    // 전체 데이터 조회
    const { data, error } = await supabase.from('practice_problems').select('*');
    
    if (error) {
      console.error(`데이터 조회 오류: ${error.message}`);
      console.error('오류 상세:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log(`총 ${data.length}개의 문제가 있습니다.`);
    
    if (data.length > 0) {
      console.log('\n=== 샘플 데이터 ===');
      data.slice(0, 3).forEach((item, idx) => {
        console.log(`${idx + 1}. ${JSON.stringify(item, null, 2)}`);
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
      
      console.log('\n=== 타입별 문제 개수 ===');
      Object.keys(typeGroups).forEach(type => {
        console.log(`${type}: ${typeGroups[type].length}개`);
      });
    } else {
      console.log('데이터가 없습니다. 업로드가 실패했을 수 있습니다.');
      
      // 테이블 구조 확인
      console.log('\n=== 테이블 구조 확인 ===');
      const { data: structure, error: structureError } = await supabase
        .from('practice_problems')
        .select('*')
        .limit(1);
      
      if (structureError) {
        console.error('구조 확인 오류:', structureError);
      } else {
        console.log('테이블 구조:', structure.length > 0 ? Object.keys(structure[0]) : '빈 테이블');
      }
    }
  } catch (err) {
    console.error(`테이블 접근 오류:`, err.message);
  }
}

checkData(); 