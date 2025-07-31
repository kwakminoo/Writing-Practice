const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkSpecificType() {
  console.log('=== "편지 에세이" 타입 데이터 확인 ===');

  // 1. "편지 에세이" 타입 데이터 조회
  console.log('\n1. "편지 에세이" 타입 데이터 조회 중...');
  const { data, error } = await supabase
    .from('practice_problems')
    .select('*')
    .eq('type', '편지 에세이');

  if (error) {
    console.error('데이터 조회 오류:', error);
    return;
  }

  console.log(`${data.length}개 데이터 조회 완료...\n`);

  if (data.length === 0) {
    console.log('❌ "편지 에세이" 타입 데이터가 없습니다.');
    return;
  }

  console.log(`총 ${data.length}개의 "편지 에세이" 데이터 확인 완료\n`);

  // 2. 카테고리별 통계
  console.log('=== 카테고리별 통계 ===');
  const categoryStats = {};
  data.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
  });

  Object.keys(categoryStats).forEach(category => {
    console.log(`${category}: ${categoryStats[category]}개`);
  });

  // 3. 샘플 데이터 출력
  console.log('\n=== 샘플 데이터 (처음 5개) ===');
  data.slice(0, 5).forEach((item, idx) => {
    console.log(`${idx + 1}. ID: ${item.id}, Category: ${item.category}`);
    console.log(`   Prompt: ${item.prompt.substring(0, 100)}...`);
    console.log(`   Difficulty: ${item.difficulty}, Length: ${item.length}`);
    console.log(`   Keywords: ${Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}`);
    console.log('');
  });

  // 4. 전체 데이터 확인 여부
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n전체 데이터를 모두 보시겠습니까? (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n=== 전체 데이터 ===');
      data.forEach((item, idx) => {
        console.log(`${idx + 1}. ID: ${item.id}, Category: ${item.category}`);
        console.log(`   Prompt: ${item.prompt}`);
        console.log(`   Difficulty: ${item.difficulty}, Length: ${item.length}`);
        console.log(`   Keywords: ${Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}`);
        console.log('');
      });
    }
    rl.close();
  });
}

checkSpecificType(); 