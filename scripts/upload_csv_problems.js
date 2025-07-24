const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

const files = [
  'novel_pilsa_practice_300.csv',
  'novel_pilsa_practice_300_part2.csv',
  'novel_pilsa_practice_foreign_300.csv',
  'classic_global_pilsa_100.csv',
  'poem_sensory_100_exam.csv', // 시 감각 분리 시 데이터 추가
  'poem_sensory_100_exam.csv',
  'poem_sensory_300_set3.csv',
  'poem_sensory_300_set2.csv',
  'poem_sensory_300.csv',
  'poem_word_transform_100_exam.csv',
  'poem_word_transform_300_set3.csv',
  'poem_word_transform_300_set2.csv',
  'poem_word_transform_300_set1.csv',
  'poem_rhythm_prompts_100_exam.csv',
  'poem_rhythm_prompts_300_fourth.csv',
  'poem_rhythm_prompts_300_third.csv',
  'poem_rhythm_prompts_300_extra_clean.csv',
  'poem_image_prompts_100_v4.csv',
  'poem_image_prompts_300_v3.csv',
  'poem_image_prompts_300_v2.csv',
  'poem_image_prompts_300.csv',
  'poem_oneline_100_exam.csv',
  'poem_oneline_300_set3.csv',
  'poem_oneline_300_set2.csv',
  'poem_oneline_300.csv',
  'poem_variation_100_exam.csv',
  'poem_variation_300_set3.csv',
  'poem_variation_300_set2.csv',
  'poem_variation_300.csv',
  'poem_improv_100_exam.csv',
  'poem_improv_300_set3.csv',
  'poem_improv_300_set2.csv',
  'poem_improv_300.csv',
  'poetry_structure_variation_set4_exam.csv',
  'poetry_structure_variation_set3.csv',
  'poetry_structure_variation_set2.csv',
  'poetry_structure_variation_set1.csv',
];

const allRows = [];
// 중복 검사 제거: seen, duplicateCount, duplicateSamples 삭제

for (const file of files) {
  try {
    const csv = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
    const records = csvParse.parse(csv, { columns: true, skip_empty_lines: true });
    for (const row of records) {
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

console.log(`총 ${allRows.length}개의 문제를 업로드합니다.`);

// 샘플 데이터 출력
console.log('\n=== 샘플 데이터 ===');
allRows.slice(0, 3).forEach((row, idx) => {
  console.log(`${idx + 1}. Category: ${row.category}, Type: ${row.type}`);
  console.log(`   Prompt: ${row.prompt.substring(0, 50)}...`);
});

(async () => {
  try {
    for (let i = 0; i < allRows.length; i += 1000) {
      const chunk = allRows.slice(i, i + 1000);
      console.log(`\n${i + 1}~${i + chunk.length}번째 데이터 업로드 중...`);
      console.log('첫 번째 데이터:', JSON.stringify(chunk[0], null, 2));
      
      const { data, error } = await supabase.from('practice_problems').insert(chunk);
      
      if (error) {
        console.error('업로드 오류:', error);
        console.error('오류 상세:', JSON.stringify(error, null, 2));
        process.exit(1);
      }
      
      console.log(`${i + chunk.length}/${allRows.length}개 업로드 완료`);
    }
    console.log('업로드 완료!');
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
})(); 