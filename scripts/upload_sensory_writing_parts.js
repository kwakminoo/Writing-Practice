const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

const files = [
  'novel_sensory_writing_300_part1.csv',
  'novel_sensory_writing_300_part2.csv',
  'novel_sensory_writing_300_part3.csv'
];

let totalUploaded = 0;
let totalErrors = 0;

function parseKeywords(keywordsStr) {
  if (!keywordsStr || keywordsStr === 'null' || keywordsStr === '') {
    return null;
  }
  try {
    if (keywordsStr.startsWith('[') && keywordsStr.endsWith(']')) {
      const content = keywordsStr.slice(1, -1);
      const keywords = content.split(',').map(k => k.trim().replace(/'/g, ''));
      return keywords.filter(k => k.length > 0);
    }
    if (keywordsStr.includes(',')) {
      const keywords = keywordsStr.split(',').map(k => k.trim());
      return keywords.filter(k => k.length > 0);
    }
    return [keywordsStr.trim()];
  } catch (error) {
    console.log(`keywords 파싱 오류: ${keywordsStr}`, error.message);
    return null;
  }
}

async function uploadFile(filename) {
  console.log(`\n=== ${filename} 업로드 시작 ===`);
  try {
    const csv = fs.readFileSync(path.join(__dirname, '..', filename), 'utf-8');
    const records = csvParse.parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    console.log(`${filename}: ${records.length}개 레코드 발견`);
    const processedRecords = records.map((row) => ({
      category: row.category || '소설',
      type: row.type || '5감각 묘사 연습',
      prompt: row.prompt || '',
      difficulty: row.difficulty || '중간',
      keywords: parseKeywords(row.keywords),
      length: row.length ? parseInt(row.length) : 500
    }));
    for (let i = 0; i < processedRecords.length; i += 1000) {
      const chunk = processedRecords.slice(i, i + 1000);
      const { data, error } = await supabase
        .from('practice_problems')
        .insert(chunk);
      if (error) {
        console.error(`업로드 오류:`, error.message);
        totalErrors += chunk.length;
      } else {
        totalUploaded += chunk.length;
        console.log(`✅ ${i + chunk.length}/${processedRecords.length}개 업로드 완료`);
      }
    }
    console.log(`✅ ${filename} 업로드 완료!`);
  } catch (error) {
    console.error(`${filename} 파일 처리 중 오류:`, error.message);
    totalErrors += 1;
  }
}

async function main() {
  console.log('=== 5감각 묘사 연습 part 파일 업로드 시작 ===');
  for (const file of files) {
    await uploadFile(file);
  }
  console.log(`\n=== 업로드 완료 요약 ===`);
  console.log(`총 업로드된 데이터: ${totalUploaded}개`);
  console.log(`총 오류 발생: ${totalErrors}개`);
}

main().catch(console.error); 