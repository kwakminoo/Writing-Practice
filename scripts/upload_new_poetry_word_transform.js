const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParse = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

const files = [
  'poem_word_transform_100_philosophy.csv',
  'poem_word_transform_300_everyday.csv',
  'poem_word_transform_300_new_batch5.csv',
  'poem_word_transform_300_new_filled_final.csv'
];

let totalUploaded = 0;
let totalErrors = 0;

// keywords 문자열을 PostgreSQL 배열로 변환하는 함수
function parseKeywords(keywordsStr) {
  if (!keywordsStr || keywordsStr === 'null' || keywordsStr === '') {
    return null;
  }
  
  try {
    // "['감상문', '작품', '영화']" 형태를 배열로 변환
    if (keywordsStr.startsWith('[') && keywordsStr.endsWith(']')) {
      const content = keywordsStr.slice(1, -1); // 대괄호 제거
      const keywords = content.split(',').map(k => k.trim().replace(/'/g, ''));
      return keywords.filter(k => k.length > 0);
    }
    return null;
  } catch (error) {
    console.log(`keywords 파싱 오류: ${keywordsStr}`, error.message);
    return null;
  }
}

// UTF-8 BOM 제거 및 인코딩 처리
function readFileWithEncoding(filePath) {
  try {
    // 먼저 UTF-8로 시도
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // BOM 제거
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    return content;
  } catch (error) {
    console.log(`UTF-8 읽기 실패, 다른 인코딩 시도: ${filePath}`);
    try {
      // 다른 인코딩 시도 (Windows-1252, EUC-KR 등)
      const buffer = fs.readFileSync(filePath);
      return buffer.toString('utf-8');
    } catch (err) {
      console.error(`파일 읽기 실패: ${filePath}`, err.message);
      return null;
    }
  }
}

async function uploadFile(filename) {
  console.log(`\n=== ${filename} 업로드 시작 ===`);
  
  try {
    const filePath = path.join(__dirname, '..', filename);
    const csv = readFileWithEncoding(filePath);
    
    if (!csv) {
      console.error(`${filename}: 파일 읽기 실패`);
      return;
    }
    
    const records = csvParse.parse(csv, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`${filename}: ${records.length}개 레코드 발견`);
    
    // 데이터 전처리
    const processedRecords = records.map((row, index) => {
      // id, created_at 컬럼이 있으면 제거 (Supabase가 자동 생성)
      const { id, created_at, ...dataWithoutId } = row;
      
      return {
        category: dataWithoutId.category || '시',
        type: dataWithoutId.type || '시어 변형',
        prompt: dataWithoutId.prompt || '',
        difficulty: dataWithoutId.difficulty || '중간',
        keywords: parseKeywords(dataWithoutId.keywords),
        length: dataWithoutId.length ? parseInt(dataWithoutId.length) : 500
      };
    });
    
    console.log(`처리된 레코드: ${processedRecords.length}개`);
    
    // 샘플 데이터 출력
    if (processedRecords.length > 0) {
      console.log('샘플 데이터:');
      console.log(`Category: ${processedRecords[0].category}`);
      console.log(`Type: ${processedRecords[0].type}`);
      console.log(`Prompt: ${processedRecords[0].prompt.substring(0, 50)}...`);
    }
    
    // 1000개씩 나누어 업로드
    for (let i = 0; i < processedRecords.length; i += 1000) {
      const chunk = processedRecords.slice(i, i + 1000);
      console.log(`${i + 1}~${i + chunk.length}번째 데이터 업로드 중...`);
      
      const { data, error } = await supabase
        .from('practice_problems')
        .insert(chunk);
      
      if (error) {
        console.error(`업로드 오류 (${i + 1}~${i + chunk.length}):`, error.message);
        
        // 중복 키 오류인 경우 개별 처리
        if (error.message.includes('duplicate key')) {
          console.log('중복 키 오류 발생. 개별 처리로 전환...');
          await uploadIndividualRecords(chunk, i + 1);
        } else {
          totalErrors += chunk.length;
          console.error('오류 상세:', JSON.stringify(error, null, 2));
        }
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

async function uploadIndividualRecords(records, startIndex) {
  console.log('개별 레코드 업로드 시작...');
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const currentIndex = startIndex + i;
    
    try {
      const { data, error } = await supabase
        .from('practice_problems')
        .insert([record]);
      
      if (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`⚠️ 중복 데이터 건너뛰기: ${currentIndex}번째`);
        } else {
          console.error(`오류 (${currentIndex}번째):`, error.message);
          totalErrors += 1;
        }
      } else {
        totalUploaded += 1;
        if (currentIndex % 100 === 0) {
          console.log(`✅ ${currentIndex}번째까지 업로드 완료`);
        }
      }
    } catch (err) {
      console.error(`예상치 못한 오류 (${currentIndex}번째):`, err.message);
      totalErrors += 1;
    }
  }
}

async function main() {
  console.log('=== 새로운 시어변형 데이터 업로드 시작 ===');
  console.log(`총 ${files.length}개 파일 처리 예정`);
  
  // 현재 테이블 상태 확인
  const { data: currentData, error: checkError } = await supabase
    .from('practice_problems')
    .select('count');
  
  if (checkError) {
    console.error('테이블 상태 확인 오류:', checkError);
    return;
  }
  
  console.log(`현재 테이블 데이터 수: ${currentData?.length || 0}개`);
  
  // 각 파일 순차 업로드
  for (const file of files) {
    await uploadFile(file);
  }
  
  console.log('\n=== 업로드 완료 요약 ===');
  console.log(`총 업로드된 데이터: ${totalUploaded}개`);
  console.log(`총 오류 발생: ${totalErrors}개`);
  
  // 최종 확인
  const { data: finalData, error: finalError } = await supabase
    .from('practice_problems')
    .select('count');
  
  if (finalError) {
    console.error('최종 확인 오류:', finalError);
  } else {
    console.log(`최종 테이블 데이터 수: ${finalData?.length || 0}개`);
  }
}

main().catch(console.error); 