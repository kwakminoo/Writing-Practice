const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

// CSV 파싱 함수
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // 마지막 값
    
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index];
      });
      data.push(row);
    }
  }
  
  return data;
}

// keywords 파싱 함수
function parseKeywords(keywordsStr) {
  if (!keywordsStr || keywordsStr.trim() === '') {
    return [];
  }
  
  // JSON 배열 형태에서 숫자 부분 제거
  const cleanStr = keywordsStr.replace(/,\s*\d+$/, '');
  
  try {
    // JSON 파싱 시도
    return JSON.parse(cleanStr);
  } catch (e) {
    // 쉼표로 구분된 문자열로 처리
    return cleanStr.split(',').map(k => k.trim().replace(/['"]/g, ''));
  }
}

async function fixStoryRestructureFinal() {
  console.log('=== 이야기 재구성 데이터 최종 수정 시작 ===\n');
  
  try {
    // 1. CSV 파일 읽기
    console.log('1. CSV 파일 읽는 중...');
    const csvContent = fs.readFileSync('이야기 재구성 데이터.csv', 'utf-8');
    const rawData = parseCSV(csvContent);
    
    console.log(`총 ${rawData.length}개의 데이터를 읽었습니다.\n`);
    
    // 2. 데이터 정제
    console.log('2. 데이터 정제 중...');
    const cleanData = rawData.map((row, index) => {
      const keywords = parseKeywords(row.keywords);
      const length = parseInt(row.length) || 0;
      
      return {
        category: row.category,
        type: row.type,
        difficulty: row.difficulty,
        prompt: row.prompt,
        keywords: keywords,
        length: length
      };
    });
    
    console.log('데이터 정제 완료\n');
    
    // 3. 기존 "이야기 재구성" 데이터 삭제
    console.log('3. 기존 "이야기 재구성" 데이터 삭제 중...');
    const { error: deleteError } = await supabase
      .from('practice_problems')
      .delete()
      .eq('type', '이야기 재구성');
    
    if (deleteError) {
      console.error('기존 데이터 삭제 오류:', deleteError);
      throw deleteError;
    }
    
    console.log('기존 "이야기 재구성" 데이터 삭제 완료\n');
    
    // 4. 새 데이터 업로드 (배치 처리)
    console.log('4. 새 데이터 업로드 중...');
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < cleanData.length; i += batchSize) {
      const batch = cleanData.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('practice_problems')
          .insert(batch);
        
        if (error) {
          console.error(`배치 ${Math.floor(i/batchSize) + 1} 업로드 오류:`, error);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
          console.log(`배치 ${Math.floor(i/batchSize) + 1} 완료: ${batch.length}개 업로드`);
        }
      } catch (e) {
        console.error(`배치 ${Math.floor(i/batchSize) + 1} 예외 오류:`, e);
        errorCount += batch.length;
      }
      
      // 잠시 대기 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n업로드 완료:`);
    console.log(`- 성공: ${successCount}개`);
    console.log(`- 실패: ${errorCount}개`);
    
    // 5. 업로드 결과 확인
    console.log('\n5. 업로드 결과 확인 중...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '이야기 재구성')
      .limit(5);
    
    if (verifyError) {
      console.error('결과 확인 오류:', verifyError);
    } else {
      console.log(`데이터베이스에 ${verifyData.length}개의 "이야기 재구성" 데이터가 있습니다.`);
      
      // 샘플 데이터 출력
      if (verifyData.length > 0) {
        console.log('\n샘플 데이터:');
        console.log(JSON.stringify(verifyData[0], null, 2));
      }
    }
    
    console.log('\n=== 이야기 재구성 데이터 최종 수정 완료 ===');
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
    throw err;
  }
}

// 스크립트 실행
fixStoryRestructureFinal()
  .then(() => {
    console.log('\n✅ 모든 작업이 성공적으로 완료되었습니다!');
  })
  .catch((error) => {
    console.error('\n❌ 작업 실패:', error);
    process.exit(1);
  });

