const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkCurrentStatus() {
  console.log('=== 현재 데이터 상태 확인 ===\n');

  // 1. 모든 데이터 조회 (페이지네이션으로)
  console.log('1. 모든 데이터 조회 중...');
  let allData = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .range(from, from + limit - 1);

    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }

    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    from += limit;
    
    console.log(`${allData.length}개 데이터 조회 완료...`);
  }

  console.log(`\n총 ${allData.length}개 데이터 확인 완료\n`);

  // 2. 타입별 통계
  const typeStats = {};
  allData.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
  });

  console.log('=== 현재 타입별 통계 ===');
  Object.keys(typeStats).forEach(type => {
    console.log(`${type}: ${typeStats[type]}개`);
  });

  // 3. 샘플 데이터 확인
  console.log('\n=== 각 타입별 샘플 데이터 ===');
  Object.keys(typeStats).forEach(type => {
    const sampleData = allData.filter(item => item.type === type).slice(0, 2);
    console.log(`\n[${type}]`);
    sampleData.forEach((item, idx) => {
      console.log(`${idx + 1}. Category: ${item.category}`);
      console.log(`   Prompt: ${item.prompt.substring(0, 100)}...`);
    });
  });

  // 4. 부족한 데이터 분석
  console.log('\n=== 부족한 데이터 분석 ===');
  const expectedCounts = {
    '문제 풀이': 1450,
    '테마별 글쓰기': 1450,
    '필사 연습': 1292,
    '제작성 훈련': 1000,
    '5감각 묘사 연습': 1000,
    '한 문장 소설': 1000
  };

  Object.keys(expectedCounts).forEach(type => {
    const current = typeStats[type] || 0;
    const expected = expectedCounts[type];
    const diff = expected - current;
    
    if (diff > 0) {
      console.log(`${type}: ${current}개 (부족: ${diff}개)`);
    } else {
      console.log(`${type}: ${current}개 (완료)`);
    }
  });
}

checkCurrentStatus(); 