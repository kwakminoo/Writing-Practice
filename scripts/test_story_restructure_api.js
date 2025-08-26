const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function testStoryRestructureAPI() {
  console.log('=== 이야기 재구성 API 테스트 ===\n');
  
  try {
    // 1. "이야기 재구성" 타입으로 문제 조회 (API와 동일한 방식)
    console.log('1. "이야기 재구성" 타입 문제 조회 중...');
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '이야기 재구성')
      .eq('category', '소설')
      .limit(5);
    
    if (error) {
      console.error('API 조회 오류:', error);
      return;
    }
    
    console.log(`총 ${data.length}개의 "이야기 재구성" 문제를 조회했습니다.\n`);
    
    // 2. 샘플 문제 출력
    console.log('=== 샘플 문제 (처음 3개) ===');
    data.slice(0, 3).forEach((problem, index) => {
      console.log(`${index + 1}. ID: ${problem.id}`);
      console.log(`   카테고리: ${problem.category}`);
      console.log(`   타입: ${problem.type}`);
      console.log(`   난이도: ${problem.difficulty}`);
      console.log(`   길이: ${problem.length}자`);
      console.log(`   키워드: ${Array.isArray(problem.keywords) ? problem.keywords.join(', ') : problem.keywords}`);
      console.log(`   프롬프트: ${problem.prompt.substring(0, 100)}...`);
      console.log('');
    });
    
    // 3. 데이터 품질 확인
    console.log('=== 데이터 품질 확인 ===');
    let validData = 0;
    let invalidData = 0;
    
    data.forEach(problem => {
      if (problem.prompt && problem.difficulty && problem.length > 0 && Array.isArray(problem.keywords)) {
        validData++;
      } else {
        invalidData++;
        console.log(`문제 ID ${problem.id}: 데이터 불완전`);
      }
    });
    
    console.log(`유효한 데이터: ${validData}개`);
    console.log(`문제가 있는 데이터: ${invalidData}개`);
    
    if (validData === data.length) {
      console.log('✅ 모든 데이터가 정상적으로 설정되었습니다!');
    } else {
      console.log('⚠️ 일부 데이터에 문제가 있습니다.');
    }
    
    // 4. 실제 API 엔드포인트 테스트 (로컬 서버가 실행 중인 경우)
    console.log('\n=== 실제 API 엔드포인트 테스트 ===');
    try {
      const response = await fetch('http://localhost:3000/api/practice-problems?category=소설&type=이야기 재구성&limit=3');
      if (response.ok) {
        const apiData = await response.json();
        console.log('API 응답 성공!');
        console.log(`API에서 반환된 문제 수: ${apiData.length}개`);
        
        if (apiData.length > 0) {
          console.log('\nAPI 응답 샘플:');
          console.log(JSON.stringify(apiData[0], null, 2));
        }
      } else {
        console.log('API 서버가 실행되지 않았거나 오류가 발생했습니다.');
        console.log('웹 애플리케이션을 실행한 후 다시 테스트해주세요.');
      }
    } catch (apiError) {
      console.log('API 서버 연결 실패 (정상 - 서버가 실행되지 않음)');
      console.log('웹 애플리케이션을 실행한 후 다시 테스트해주세요.');
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

testStoryRestructureAPI();

