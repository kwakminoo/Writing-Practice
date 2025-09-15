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

async function uploadMissingPoetryData() {
  console.log('=== 누락된 시 데이터 업로드 시작 ===\n');
  
  const files = [
    'poem_improv_100_exam_final.csv',
    'poem_oneline_100_exam_fixed_type.csv', 
    'poem_sensory_100_exam_fixed.csv',
    'poem_variation_100_exam_fixed.csv'
  ];
  
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
          category: dataWithoutId.category || '시',
          type: dataWithoutId.type || '일반',
          prompt: dataWithoutId.prompt || '',
          difficulty: dataWithoutId.difficulty || '중간',
          keywords: parseKeywords(dataWithoutId.keywords),
          length: dataWithoutId.length ? parseInt(dataWithoutId.length) : 500
        };
      });
      
      // 중복 확인을 위해 기존 데이터 조회
      const existingPrompts = new Set();
      for (const record of processedRecords) {
        const { data: existing } = await supabase
          .from('practice_problems')
          .select('prompt')
          .eq('category', record.category)
          .eq('type', record.type)
          .eq('prompt', record.prompt)
          .limit(1);
        
        if (existing && existing.length > 0) {
          existingPrompts.add(record.prompt);
        }
      }
      
      // 중복되지 않는 데이터만 필터링
      const uniqueRecords = processedRecords.filter(record => !existingPrompts.has(record.prompt));
      
      console.log(`  🔍 중복 제거 후 레코드 수: ${uniqueRecords.length}개`);
      
      if (uniqueRecords.length === 0) {
        console.log(`  ⚠️ 모든 데이터가 이미 존재합니다.`);
        continue;
      }
      
      // 데이터 업로드
      const { data: insertResult, error: insertError } = await supabase
        .from('practice_problems')
        .insert(uniqueRecords);
      
      if (insertError) {
        console.error(`  ❌ 업로드 오류:`, insertError);
        continue;
      }
      
      console.log(`  ✅ 성공적으로 업로드됨: ${uniqueRecords.length}개`);
      
    } catch (error) {
      console.error(`  ❌ 파일 처리 오류 (${fileName}):`, error.message);
    }
    
    console.log('');
  }
  
  console.log('=== 누락된 시 데이터 업로드 완료 ===');
}

uploadMissingPoetryData().catch(console.error); 