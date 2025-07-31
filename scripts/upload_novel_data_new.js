const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

function readFileWithEncoding(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // BOM 제거
    return content.replace(/^\uFEFF/, '');
  } catch (error) {
    console.error(`파일 읽기 오류 (${filePath}):`, error.message);
    return null;
  }
}

function parseKeywords(keywordsStr) {
  if (!keywordsStr || keywordsStr === '[]') return [];
  try {
    // 문자열 형태의 배열을 실제 배열로 변환
    if (keywordsStr.startsWith('[') && keywordsStr.endsWith(']')) {
      const content = keywordsStr.slice(1, -1);
      if (content.trim() === '') return [];
      return content.split(',').map(item => item.trim().replace(/['"]/g, ''));
    }
    return [];
  } catch (error) {
    console.error('키워드 파싱 오류:', error);
    return [];
  }
}

async function uploadNovelData() {
  console.log('=== 소설 데이터 업로드 시작 ===\n');
  
  const files = [
    'novel_continue_writing_merged.csv',
    'novel_one_sentence_merged.csv',
    'novel_pilsa_practice_full_merged.csv',
    'novel_point_of_view_merged.csv',
    'novel_practice_merged.csv',
    'novel_production_training_merged.csv',
    'novel_sensory_writing_merged.csv',
    'novel_theme_writing_merged.csv'
  ];
  
  let totalUploaded = 0;
  
  for (const fileName of files) {
    console.log(`📁 파일 처리 중: ${fileName}`);
    
    const filePath = path.join(__dirname, '..', fileName);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ 파일이 존재하지 않습니다: ${fileName}`);
      continue;
    }
    
    const fileContent = readFileWithEncoding(filePath);
    if (!fileContent) {
      console.error(`❌ 파일 읽기 실패: ${fileName}`);
      continue;
    }
    
    try {
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      console.log(`  📊 파싱된 레코드 수: ${records.length}개`);
      
      // 데이터 전처리
      const processedRecords = records.map((row) => {
        const { id, created_at, ...dataWithoutId } = row;
        return {
          category: dataWithoutId.category || '소설',
          type: dataWithoutId.type || '일반',
          prompt: dataWithoutId.prompt || '',
          difficulty: dataWithoutId.difficulty || '중간',
          keywords: parseKeywords(dataWithoutId.keywords),
          length: dataWithoutId.length ? parseInt(dataWithoutId.length) : 500
        };
      });
      
      // 데이터 업로드
      const { data: insertResult, error: insertError } = await supabase
        .from('practice_problems')
        .insert(processedRecords);
      
      if (insertError) {
        console.error(`  ❌ 업로드 오류:`, insertError);
        continue;
      }
      
      console.log(`  ✅ 성공적으로 업로드됨: ${processedRecords.length}개`);
      totalUploaded += processedRecords.length;
      
    } catch (error) {
      console.error(`  ❌ 파일 처리 오류 (${fileName}):`, error.message);
    }
    
    console.log('');
  }
  
  console.log('=== 소설 데이터 업로드 완료 ===');
  console.log(`📊 총 업로드된 데이터 수: ${totalUploaded}개`);
}

uploadNovelData().catch(console.error); 