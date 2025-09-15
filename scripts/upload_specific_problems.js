const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

// 원하는 타입들만 필터링
const allowedTypes = ['문제 풀이', '테마별 글쓰기', '필사 연습'];

// 문제 풀이와 테마별 글쓰기 데이터 생성
const generateProblems = () => {
  const problems = [];
  
  // 문제 풀이 데이터
  for (let i = 1; i <= 50; i++) {
    problems.push({
      category: '소설',
      type: '문제 풀이',
      prompt: `문제 풀이 예시 ${i}: 주인공이 갈등 상황에 처했을 때 어떻게 해결할지 써보세요.`,
    });
  }
  
  // 테마별 글쓰기 데이터
  const themes = ['사랑', '우정', '가족', '성장', '모험', '비밀', '추억', '희망', '슬픔', '기쁨'];
  for (let i = 1; i <= 50; i++) {
    const theme = themes[i % themes.length];
    problems.push({
      category: '소설',
      type: '테마별 글쓰기',
      prompt: `테마별 글쓰기 예시 ${i}: "${theme}"을 주제로 한 소설을 써보세요.`,
    });
  }
  
  return problems;
};

// 필사 연습 데이터는 CSV에서 가져오기
const getCopyData = () => {
  const files = [
    'novel_pilsa_practice_300.csv',
    'novel_pilsa_practice_300_part2.csv',
    'novel_pilsa_practice_foreign_300.csv',
    'classic_global_pilsa_100.csv',
  ];
  
  const allRows = [];
  const seen = new Set();
  
  for (const file of files) {
    try {
      const csv = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
      const records = csvParse.parse(csv, { columns: true, skip_empty_lines: true });
      for (const row of records) {
        const key = row.prompt;
        if (seen.has(key)) continue;
        seen.add(key);
        if (row.type === '필사 연습') {
          allRows.push({
            category: row.category && row.category.trim() ? row.category.trim() : '소설',
            type: row.type,
            prompt: row.prompt,
          });
        }
      }
      console.log(`${file}: ${records.length}개 레코드 처리 완료`);
    } catch (error) {
      console.error(`${file} 파일 처리 중 오류:`, error.message);
    }
  }
  
  return allRows;
};

async function uploadSpecificProblems() {
  // 기존 데이터 모두 삭제
  console.log('기존 데이터 삭제 중...');
  const { error: deleteError } = await supabase.from('practice_problems').delete().neq('id', 0);
  if (deleteError) {
    console.error('삭제 오류:', deleteError);
    return;
  }
  console.log('기존 데이터 삭제 완료');
  
  // 새로운 데이터 준비
  const generatedProblems = generateProblems();
  const copyProblems = getCopyData();
  const allProblems = [...generatedProblems, ...copyProblems];
  
  console.log(`총 ${allProblems.length}개의 문제를 업로드합니다.`);
  console.log(`- 문제 풀이: ${generatedProblems.filter(p => p.type === '문제 풀이').length}개`);
  console.log(`- 테마별 글쓰기: ${generatedProblems.filter(p => p.type === '테마별 글쓰기').length}개`);
  console.log(`- 필사 연습: ${copyProblems.length}개`);
  
  // 샘플 데이터 출력
  console.log('\n=== 샘플 데이터 ===');
  allProblems.slice(0, 3).forEach((row, idx) => {
    console.log(`${idx + 1}. Category: ${row.category}, Type: ${row.type}`);
    console.log(`   Prompt: ${row.prompt.substring(0, 50)}...`);
  });
  
  // 업로드
  try {
    for (let i = 0; i < allProblems.length; i += 1000) {
      const chunk = allProblems.slice(i, i + 1000);
      console.log(`\n${i + 1}~${i + chunk.length}번째 데이터 업로드 중...`);
      
      const { data, error } = await supabase.from('practice_problems').insert(chunk);
      
      if (error) {
        console.error('업로드 오류:', error);
        console.error('오류 상세:', JSON.stringify(error, null, 2));
        return;
      }
      
      console.log(`${i + chunk.length}/${allProblems.length}개 업로드 완료`);
    }
    console.log('업로드 완료!');
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

uploadSpecificProblems(); 