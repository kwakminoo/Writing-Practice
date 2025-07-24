const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

// 32개의 CSV 파일 목록
const csvFiles = [
  // 문제 풀이 관련
  'novel_practice_exam_style_100 final.csv',
  'novel_practice_final_unique_300 type 3.csv',
  'novel_practice_completely_new_300.csv',
  'novel_practice_diverse_300.csv',
  
  // 테마별 글쓰기 관련
  'novel_theme_writing_exam_100.csv',
  'novel_theme_writing_300.csv',
  'novel_theme_writing_300_part2.csv',
  'novel_theme_writing_300_part3.csv',
  
  // 필사 연습 관련
  'classic_global_pilsa_100.csv',
  'novel_pilsa_practice_300.csv',
  'novel_pilsa_practice_300_part2.csv',
  'novel_pilsa_practice_foreign_300.csv',
  
  // 제작성 훈련 관련
  'novel_production_training_exam_100.csv',
  'novel_production_training_300.csv',
  'novel_production_training_300_part2.csv',
  'novel_production_training_300_part3.csv',
  
  // 5감각 묘사 연습 관련
  'novel_sensory_writing_exam_100.csv',
  'novel_sensory_writing_300.csv',
  'novel_sensory_writing_300_part2.csv',
  'novel_sensory_writing_300_part3.csv',
  
  // 한 문장 소설 관련
  'novel_one_sentence_exam_100.csv',
  'novel_one_sentence_300.csv',
  'novel_one_sentence_300_part2.csv',
  'novel_one_sentence_300_part3.csv',
  
  // 이어쓰기 관련
  'novel_continue_writing_exam_100.csv',
  'novel_continue_writing_300.csv',
  'novel_continue_writing_300_part2.csv',
  'novel_continue_writing_300_part3.csv',
  
  // 시점 관련
  'novel_point_of_view_exam_100.csv',
  'novel_point_of_view_300.csv',
  'novel_point_of_view_300_part2.csv',
  'novel_point_of_view_300_part3.csv',
];

// CSV에서 데이터 읽기
const getCsvData = () => {
  const allRows = [];
  const seen = new Set();
  
  for (const file of csvFiles) {
    try {
      const csv = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
      const records = csvParse.parse(csv, { columns: true, skip_empty_lines: true });
      
      for (const row of records) {
        const key = row.prompt;
        if (seen.has(key)) continue;
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

async function uploadAll32Files() {
  console.log('=== 32개 파일 데이터 업로드 ===');
  
  // 1. CSV 데이터 읽기
  console.log('\n1. CSV 파일에서 데이터 읽는 중...');
  const csvData = getCsvData();
  console.log(`총 ${csvData.length}개의 데이터를 찾았습니다.`);
  
  // 2. 타입별 통계
  const typeStats = {};
  csvData.forEach(item => {
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
  });
  
  console.log('\n=== 데이터 타입별 통계 ===');
  Object.keys(typeStats).forEach(type => {
    console.log(`${type}: ${typeStats[type]}개`);
  });
  
  // 3. 샘플 데이터 출력
  console.log('\n=== 데이터 샘플 ===');
  csvData.slice(0, 3).forEach((row, idx) => {
    console.log(`${idx + 1}. Category: ${row.category}, Type: ${row.type}`);
    console.log(`   Prompt: ${row.prompt.substring(0, 50)}...`);
  });
  
  // 4. 데이터 업로드
  console.log('\n2. 데이터 업로드 중...');
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
    console.log('32개 파일 데이터 업로드 완료!');
    
    // 5. 최종 확인
    console.log('\n3. 최종 데이터 확인 중...');
    const { data: finalData, error: finalError } = await supabase.from('practice_problems').select('*');
    
    if (finalError) {
      console.error('최종 확인 오류:', finalError);
    } else {
      console.log(`최종 데이터: ${finalData.length}개`);
      
      const finalTypeStats = {};
      finalData.forEach(item => {
        finalTypeStats[item.type] = (finalTypeStats[item.type] || 0) + 1;
      });
      
      console.log('\n=== 최종 타입별 통계 ===');
      Object.keys(finalTypeStats).forEach(type => {
        console.log(`${type}: ${finalTypeStats[type]}개`);
      });
    }
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

uploadAll32Files(); 