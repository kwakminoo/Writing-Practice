const fetch = require('node-fetch');

async function testAPI() {
  console.log('=== 실제 API 엔드포인트 테스트 ===\n');
  
  try {
    // 1. "이야기 재구성" 타입으로 API 호출
    console.log('1. "이야기 재구성" 타입 API 호출 중...');
    const response = await fetch('http://localhost:3000/api/practice-problems/random?type=이야기%20재구성');
    
    if (!response.ok) {
      console.error(`API 오류: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    console.log('API 응답 성공!');
    console.log(`응답 데이터:`, JSON.stringify(data, null, 2));
    
    if (data.data && data.data.length > 0) {
      const problem = data.data[0];
      console.log('\n=== 반환된 문제 상세 ===');
      console.log(`ID: ${problem.id}`);
      console.log(`카테고리: ${problem.category}`);
      console.log(`타입: ${problem.type}`);
      console.log(`난이도: ${problem.difficulty}`);
      console.log(`길이: ${problem.length}자`);
      console.log(`키워드: ${Array.isArray(problem.keywords) ? problem.keywords.join(', ') : problem.keywords}`);
      console.log(`프롬프트: ${problem.prompt}`);
      
      // 데이터 검증
      if (problem.type === '이야기 재구성' && problem.category === '소설') {
        console.log('\n✅ 올바른 "이야기 재구성" 데이터가 반환되었습니다!');
      } else {
        console.log('\n⚠️ 잘못된 타입의 데이터가 반환되었습니다.');
      }
    } else {
      console.log('\n⚠️ API에서 데이터를 반환하지 않았습니다.');
    }
    
  } catch (error) {
    console.error('API 테스트 오류:', error.message);
    console.log('개발 서버가 실행 중인지 확인해주세요. (npm run dev)');
  }
}

testAPI();

