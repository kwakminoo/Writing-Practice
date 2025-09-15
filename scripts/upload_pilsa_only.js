const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

// 필사 연습 CSV 파일 목록
const csvFiles = [
  'classic_global_pilsa_100.csv',
  'novel_pilsa_practice_300.csv',
  'novel_pilsa_practice_300_part2.csv',
  'novel_pilsa_practice_foreign_300.csv',
];

// CSV에서 데이터 읽기
const getCsvData = () => {
  const allRows = [];
  const seen = new Set();
  
  for (const file of csvFiles) {
    try {
      const csv = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
      const records = csvParse.parse(csv, { columns: true, skip_empty_lines: true });
      
      console.log(`${file}: ${records.length}개 레코드 발견`);
      
      for (const row of records) {
        const key = row.prompt;
        if (seen.has(key)) {
          console.log(`중복 제거: ${key.substring(0, 30)}...`);
          continue;
        }
        seen.add(key);
        
        allRows.push({
          category: row.category && row.category.trim() ? row.category.trim() : '소설',
          type: row.type,
          prompt: row.prompt,
        });
      }
      console.log(`${file}: ${records.length}개 레코드 처리 완료`);
    } catch (error) {
      console.error(`${file} 파일 처리 중 오류:`, error.message);
    }
  }
  
  return allRows;
};

async function uploadPilsaOnly() {
  console.log('=== 필사 연습 데이터만 업로드 ===');
  
  // 1. 기존 필사 연습 데이터 삭제
  console.log('\n1. 기존 필사 연습 데이터 삭제 중...');
  const { data: deleteResult, error: deleteError } = await supabase
    .from('practice_problems')
    .delete()
    .eq('type', '필사 연습');

  if (deleteError) {
    console.error('삭제 오류:', deleteError);
    return;
  }
  console.log('기존 필사 연습 데이터 삭제 완료');
  
  // 2. CSV 데이터 읽기
  console.log('\n2. CSV 파일에서 데이터 읽는 중...');
  const csvData = getCsvData();
  console.log(`총 ${csvData.length}개의 필사 연습 데이터를 찾았습니다.`);
  
  // 3. 타입별 통계
  const typeStats = {};
  csvData.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
  });
  
  console.log('\n=== 데이터 타입별 통계 ===');
  Object.keys(typeStats).forEach(type => {
    console.log(`${type}: ${typeStats[type]}개`);
  });
  
  // 4. 샘플 데이터 출력
  console.log('\n=== 데이터 샘플 ===');
  csvData.slice(0, 5).forEach((row, idx) => {
    console.log(`${idx + 1}. Category: ${row.category}, Type: ${row.type}`);
    console.log(`   Prompt: ${row.prompt.substring(0, 50)}...`);
  });
  
  // 5. 데이터 업로드
  console.log('\n3. 데이터 업로드 중...');
  try {
    for (let i = 0; i < csvData.length; i += 1000) {
      const chunk = csvData.slice(i, i + 1000);
      console.log(`${i + 1}~${i + chunk.length}번째 데이터 업로드 중...`);
      
      const { data, error } = await supabase.from('practice_problems').insert(chunk);
      
      if (error) {
        console.error('업로드 오류:', error);
        console.error('오류 상세:', JSON.stringify(error, null, 2));
        return;
      }
      
      console.log(`${i + chunk.length}/${csvData.length}개 업로드 완료`);
    }
    console.log('필사 연습 데이터 업로드 완료!');
    
    // 6. 최종 확인
    console.log('\n4. 최종 데이터 확인 중...');
    const { data: finalData, error: finalError } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '필사 연습');
    
    if (finalError) {
      console.error('최종 확인 오류:', finalError);
    } else {
      console.log(`최종 필사 연습 데이터: ${finalData.length}개`);
      
      const finalCategoryStats = {};
      finalData.forEach(item => {
        finalCategoryStats[item.category] = (finalCategoryStats[item.category] || 0) + 1;
      });
      
      console.log('\n=== 최종 카테고리별 통계 ===');
      Object.keys(finalCategoryStats).forEach(category => {
        console.log(`${category}: ${finalCategoryStats[category]}개`);
      });
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

uploadPilsaOnly(); 