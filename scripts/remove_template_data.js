const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function removeTemplateData() {
  console.log('=== 템플릿 문구 및 의미 없는 데이터 삭제 ===\n');

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

  console.log(`총 ${allData.length}개 데이터 조회 완료\n`);

  // 2. 템플릿 문구 및 의미 없는 데이터 찾기
  console.log('2. 템플릿 문구 및 의미 없는 데이터 분석 중...');
  
  const badData = [];
  const templatePatterns = [
    // 필사 연습 관련 템플릿
    /아래 문장을 그대로 필사해보세요/i,
    /다음 문장을 필사해보세요/i,
    /아래 글을 필사해보세요/i,
    /다음 글을 필사해보세요/i,
    /필사해보세요/i,
    
    // 일반적인 템플릿 문구
    /아래.*를.*해보세요/i,
    /다음.*를.*해보세요/i,
    /아래.*을.*해보세요/i,
    /다음.*을.*해보세요/i,
    
    // 너무 짧거나 의미 없는 프롬프트
    /^[가-힣\s]{1,10}$/, // 10자 이하의 한글만
    /^[a-zA-Z\s]{1,20}$/, // 20자 이하의 영문만
    
    // 특정 패턴
    /^[0-9\s]+$/, // 숫자와 공백만
    /^[^\w가-힣\s]+$/, // 특수문자만
  ];

  allData.forEach((item) => {
    if (!item.prompt) return;
    
    const prompt = item.prompt.trim();
    
    // 템플릿 패턴 체크
    for (const pattern of templatePatterns) {
      if (pattern.test(prompt)) {
        badData.push({
          id: item.id,
          type: item.type,
          category: item.category,
          prompt: prompt,
          reason: '템플릿 문구 또는 의미 없는 데이터'
        });
        break;
      }
    }
    
    // 추가 체크: 너무 짧은 프롬프트 (20자 이하)
    if (prompt.length <= 20 && !badData.find(d => d.id === item.id)) {
      badData.push({
        id: item.id,
        type: item.type,
        category: item.category,
        prompt: prompt,
        reason: '너무 짧은 프롬프트 (20자 이하)'
      });
    }
  });

  // 3. 결과 출력
  console.log(`\n발견된 문제 데이터: ${badData.length}개`);
  
  if (badData.length > 0) {
    console.log('\n=== 삭제할 데이터 샘플 ===');
    badData.slice(0, 10).forEach((item, idx) => {
      console.log(`${idx + 1}. ID: ${item.id}, Type: ${item.type}, Category: ${item.category}`);
      console.log(`   Reason: ${item.reason}`);
      console.log(`   Prompt: "${item.prompt}"`);
      console.log('');
    });

    // 타입별 통계
    const typeStats = {};
    badData.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    });

    console.log('\n=== 삭제할 데이터 타입별 통계 ===');
    Object.keys(typeStats).forEach(type => {
      console.log(`${type}: ${typeStats[type]}개`);
    });

    // 4. 삭제 실행
    console.log(`\n총 ${badData.length}개의 문제 데이터를 삭제합니다...`);
    const idsToDelete = badData.map(item => item.id);
    
    const { data: deleteResult, error: deleteError } = await supabase
      .from('practice_problems')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('삭제 오류:', deleteError);
    } else {
      console.log(`✅ ${badData.length}개 데이터 삭제 완료!`);
    }
  } else {
    console.log('\n✅ 삭제할 문제 데이터가 없습니다.');
  }

  // 5. 최종 확인
  console.log('\n=== 최종 데이터 확인 ===');
  const { data: finalData, error: finalError } = await supabase
    .from('practice_problems')
    .select('*')
    .limit(1000);

  if (finalError) {
    console.error('최종 확인 오류:', finalError);
  } else {
    console.log(`최종 데이터: ${finalData.length}개 이상`);
    
    const finalTypeStats = {};
    finalData.forEach(item => {
      finalTypeStats[item.type] = (finalTypeStats[item.type] || 0) + 1;
    });

    console.log('\n=== 최종 타입별 통계 ===');
    Object.keys(finalTypeStats).forEach(type => {
      console.log(`${type}: ${finalTypeStats[type]}개`);
    });
  }
}

removeTemplateData(); 