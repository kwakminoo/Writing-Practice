const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkStoryRestructureData() {
  console.log('=== "이야기 재구성" 타입 데이터 확인 ===\n');
  
  try {
    // 1. "이야기 재구성" 타입 데이터 조회
    console.log('1. "이야기 재구성" 타입 데이터 조회 중...');
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '이야기 재구성');
    
    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }
    
    console.log(`총 ${data.length}개의 "이야기 재구성" 데이터 확인 완료\n`);
    
    // 2. 카테고리별 통계
    const categoryStats = {};
    data.forEach(item => {
      categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    });
    
    console.log('=== 카테고리별 통계 ===');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count}개`);
    });
    
    // 3. 샘플 데이터 출력 (처음 5개)
    console.log('\n=== 샘플 데이터 (처음 5개) ===');
    data.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, Category: ${item.category}`);
      console.log(`   Prompt: ${item.prompt.substring(0, 100)}...`);
      console.log(`   Difficulty: ${item.difficulty}, Length: ${item.length}`);
      console.log(`   Keywords: ${Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}`);
      console.log('');
    });
    
    // 4. 데이터 품질 체크
    console.log('=== 데이터 품질 체크 ===');
    let emptyPrompt = 0;
    let emptyDifficulty = 0;
    let emptyLength = 0;
    let invalidKeywords = 0;
    
    data.forEach(item => {
      if (!item.prompt || item.prompt.trim() === '') {
        emptyPrompt++;
      }
      if (!item.difficulty || item.difficulty.trim() === '') {
        emptyDifficulty++;
      }
      if (!item.length || item.length === 0) {
        emptyLength++;
      }
      if (!Array.isArray(item.keywords)) {
        invalidKeywords++;
      }
    });
    
    console.log(`빈 프롬프트: ${emptyPrompt}개`);
    console.log(`빈 난이도: ${emptyDifficulty}개`);
    console.log(`빈 길이: ${emptyLength}개`);
    console.log(`잘못된 키워드 형식: ${invalidKeywords}개`);
    
    if (emptyPrompt === 0 && emptyDifficulty === 0 && emptyLength === 0 && invalidKeywords === 0) {
      console.log('✅ 모든 데이터가 정상적으로 업로드되었습니다!');
    } else {
      console.log('⚠️ 일부 데이터에 문제가 있습니다.');
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

checkStoryRestructureData();

