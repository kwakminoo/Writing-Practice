const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function findAndCleanBadData() {
  console.log('=== 이상한 데이터 찾기 및 정리 ===\n');

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

  // 2. 타입별 통계
  const typeStats = {};
  allData.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
  });

  console.log('=== 현재 타입별 통계 ===');
  Object.keys(typeStats).forEach(type => {
    console.log(`${type}: ${typeStats[type]}개`);
  });

  // 3. 문제가 있는 데이터 찾기
  console.log('\n=== 문제가 있는 데이터 분석 ===');
  
  const badData = [];
  const emptyPrompts = [];
  const duplicatePrompts = new Set();
  const seenPrompts = new Set();

  allData.forEach((item, index) => {
    // 빈 프롬프트 체크
    if (!item.prompt || item.prompt.trim() === '') {
      emptyPrompts.push({ id: item.id, type: item.type, category: item.category });
    }

    // 중복 프롬프트 체크
    if (item.prompt && item.prompt.trim() !== '') {
      const cleanPrompt = item.prompt.trim();
      if (seenPrompts.has(cleanPrompt)) {
        duplicatePrompts.add(cleanPrompt);
      } else {
        seenPrompts.add(cleanPrompt);
      }
    }

    // 특정 타입에서 문제가 있는 데이터 찾기
    if (['문제 풀이', '테마별 글쓰기', '필사 연습'].includes(item.type)) {
      if (!item.prompt || item.prompt.trim() === '' || item.prompt.length < 10) {
        badData.push({
          id: item.id,
          type: item.type,
          category: item.category,
          prompt: item.prompt,
          reason: !item.prompt || item.prompt.trim() === '' ? '빈 프롬프트' : '너무 짧은 프롬프트'
        });
      }
    }
  });

  // 4. 결과 출력
  console.log(`\n빈 프롬프트 데이터: ${emptyPrompts.length}개`);
  console.log(`중복 프롬프트: ${duplicatePrompts.size}개`);
  console.log(`문제가 있는 데이터 (문제 풀이, 테마별 글쓰기, 필사 연습): ${badData.length}개`);

  if (badData.length > 0) {
    console.log('\n=== 삭제할 데이터 샘플 ===');
    badData.slice(0, 5).forEach((item, idx) => {
      console.log(`${idx + 1}. ID: ${item.id}, Type: ${item.type}, Category: ${item.category}`);
      console.log(`   Reason: ${item.reason}`);
      console.log(`   Prompt: "${item.prompt}"`);
      console.log('');
    });

    // 5. 삭제 확인
    console.log(`\n총 ${badData.length}개의 문제가 있는 데이터를 삭제하시겠습니까?`);
    console.log('삭제할 ID 목록:');
    const idsToDelete = badData.map(item => item.id);
    console.log(idsToDelete.join(', '));

    // 6. 실제 삭제 실행
    console.log('\n삭제 실행 중...');
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
    console.log('\n✅ 삭제할 문제가 있는 데이터가 없습니다.');
  }

  // 7. 최종 확인
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

findAndCleanBadData(); 