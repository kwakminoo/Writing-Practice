const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

const files = [
  'novel_sensory_writing_300.csv'
];

let totalUploaded = 0;
let totalErrors = 0;

function parseKeywords(keywordsStr) {
  if (!keywordsStr || keywordsStr === 'null' || keywordsStr === '') {
    return null;
  }
  try {
    if (keywordsStr.startsWith('[') && keywordsStr.endsWith(']')) {
      return keywordsStr.slice(1, -1).split(',').map(k => k.trim().replace(/['"]/g, ''));
    }
    return keywordsStr.split(',').map(k => k.trim());
  } catch (error) {
    console.error('Keywords 파싱 오류:', error);
    return null;
  }
}

async function uploadFile(filePath) {
  try {
    console.log(`\n📁 파일 처리 중: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 파일이 존재하지 않습니다: ${filePath}`);
      totalErrors++;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const records = csvParse.parse(content, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`📊 CSV에서 ${records.length}개의 레코드를 읽었습니다.`);

    const processedRecords = records.map((row) => {
      const { id, created_at, ...dataWithoutId } = row;
      return {
        category: dataWithoutId.category || '소설',
        type: dataWithoutId.type || '5감각 묘사 연습',
        prompt: dataWithoutId.prompt || '',
        difficulty: dataWithoutId.difficulty || '중간',
        keywords: parseKeywords(dataWithoutId.keywords),
        length: dataWithoutId.length ? parseInt(dataWithoutId.length) : 500
      };
    });

    console.log(`🔄 ${processedRecords.length}개의 레코드를 처리했습니다.`);

    // 배치로 삽입 (1000개씩)
    const batchSize = 1000;
    for (let i = 0; i < processedRecords.length; i += batchSize) {
      const batch = processedRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('practice_problems')
        .insert(batch);

      if (error) {
        console.error(`❌ 배치 ${Math.floor(i / batchSize) + 1} 삽입 오류:`, error);
        totalErrors++;
      } else {
        console.log(`✅ 배치 ${Math.floor(i / batchSize) + 1} 완료: ${batch.length}개 레코드`);
        totalUploaded += batch.length;
      }
    }

    console.log(`✅ 파일 완료: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ 파일 처리 오류 (${filePath}):`, error);
    totalErrors++;
  }
}

async function main() {
  console.log('🚀 5감각 묘사 연습 데이터 업로드를 시작합니다...\n');
  
  for (const file of files) {
    await uploadFile(file);
  }
  
  console.log('\n📊 업로드 완료 요약:');
  console.log(`✅ 성공적으로 업로드된 레코드: ${totalUploaded}개`);
  console.log(`❌ 오류 발생: ${totalErrors}개`);
  
  if (totalErrors === 0) {
    console.log('🎉 모든 파일이 성공적으로 업로드되었습니다!');
  } else {
    console.log('⚠️ 일부 파일에서 오류가 발생했습니다.');
  }
}

main().catch(console.error); 