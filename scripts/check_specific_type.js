const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkSpecificType(typeName) {
  console.log(`=== "${typeName}" 타입 데이터 확인 ===\n`);

  // 1. 특정 타입의 모든 데이터 조회 (페이지네이션으로)
  console.log(`1. "${typeName}" 타입 데이터 조회 중...`);
  let allData = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', typeName)
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

  console.log(`\n총 ${allData.length}개의 "${typeName}" 데이터 확인 완료\n`);

  if (allData.length === 0) {
    console.log(`❌ "${typeName}" 타입의 데이터가 없습니다.`);
    return;
  }

  // 2. 카테고리별 통계
  const categoryStats = {};
  allData.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });

  console.log('=== 카테고리별 통계 ===');
  Object.keys(categoryStats).forEach(category => {
    console.log(`${category}: ${categoryStats[category]}개`);
  });

  // 3. 샘플 데이터 출력
  console.log('\n=== 샘플 데이터 (처음 5개) ===');
  allData.slice(0, 5).forEach((item, idx) => {
    console.log(`${idx + 1}. ID: ${item.id}, Category: ${item.category}`);
    console.log(`   Prompt: ${item.prompt.substring(0, 100)}...`);
    console.log('');
  });

  // 4. 전체 데이터 목록 (선택사항)
  console.log(`\n전체 ${allData.length}개 데이터를 모두 보시겠습니까? (y/n)`);
  // 실제로는 사용자 입력을 받아야 하지만, 여기서는 간단히 처리
  const showAll = false; // true로 변경하면 모든 데이터를 출력

  if (showAll) {
    console.log('\n=== 전체 데이터 목록 ===');
    allData.forEach((item, idx) => {
      console.log(`${idx + 1}. ID: ${item.id}, Category: ${item.category}`);
      console.log(`   Prompt: ${item.prompt}`);
      console.log('');
    });
  }
}

// 사용법 예시
const typeToCheck = process.argv[2] || '문제 풀이';

if (!typeToCheck) {
  console.log('사용법: node scripts/check_specific_type.js "타입명"');
  console.log('\n사용 가능한 타입들:');
  console.log('- 문제 풀이');
  console.log('- 테마별 글쓰기');
  console.log('- 필사 연습');
  console.log('- 제작성 훈련');
  console.log('- 5감각 묘사 연습');
  console.log('- 이어쓰기 연습');
  console.log('- 시점 변화 연습');
  console.log('- 한 문장 소설');
} else {
  checkSpecificType(typeToCheck);
} 