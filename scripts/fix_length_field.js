const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function fixLengthField() {
  console.log('=== length 필드 수정 시작 ===\n');
  
  try {
    // 1. "이야기 재구성" 데이터 조회
    console.log('1. "이야기 재구성" 데이터 조회 중...');
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('type', '이야기 재구성');
    
    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }
    
    console.log(`총 ${data.length}개의 데이터를 조회했습니다.\n`);
    
    // 2. length가 0인 데이터 찾기
    const zeroLengthData = data.filter(item => !item.length || item.length === 0);
    console.log(`length가 0인 데이터: ${zeroLengthData.length}개\n`);
    
    if (zeroLengthData.length === 0) {
      console.log('✅ 모든 데이터의 length 필드가 정상입니다!');
      return;
    }
    
    // 3. CSV 파일에서 올바른 length 값 읽기
    console.log('3. CSV 파일에서 올바른 length 값 읽는 중...');
    const fs = require('fs');
    const csvContent = fs.readFileSync('이야기 재구성 데이터.csv', 'utf-8');
    const lines = csvContent.split('\n');
    
    const csvData = {};
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      // 마지막 쉼표 이후의 숫자를 length로 추출
      const lastCommaIndex = lines[i].lastIndexOf(',');
      if (lastCommaIndex !== -1) {
        const lengthStr = lines[i].substring(lastCommaIndex + 1).trim();
        const length = parseInt(lengthStr);
        if (!isNaN(length)) {
          csvData[i] = length; // CSV 라인 번호를 키로 사용
        }
      }
    }
    
    console.log(`CSV에서 ${Object.keys(csvData).length}개의 length 값을 읽었습니다.\n`);
    
    // 4. 데이터베이스 업데이트
    console.log('4. 데이터베이스 업데이트 중...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < zeroLengthData.length; i++) {
      const item = zeroLengthData[i];
      const csvLineNumber = i + 1; // CSV에서 해당 데이터의 라인 번호
      const correctLength = csvData[csvLineNumber];
      
      if (correctLength && correctLength > 0) {
        try {
          const { error: updateError } = await supabase
            .from('practice_problems')
            .update({ length: correctLength })
            .eq('id', item.id);
          
          if (updateError) {
            console.error(`ID ${item.id} 업데이트 오류:`, updateError);
            errorCount++;
          } else {
            successCount++;
            if (successCount % 50 === 0) {
              console.log(`진행률: ${successCount}/${zeroLengthData.length}`);
            }
          }
        } catch (e) {
          console.error(`ID ${item.id} 예외 오류:`, e);
          errorCount++;
        }
        
        // API 제한 방지
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log(`\n업데이트 완료:`);
    console.log(`- 성공: ${successCount}개`);
    console.log(`- 실패: ${errorCount}개`);
    
    // 5. 결과 확인
    console.log('\n5. 결과 확인 중...');
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
    
    console.log('\n=== length 필드 수정 완료 ===');
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
    throw err;
  }
}

// 스크립트 실행
fixLengthField()
  .then(() => {
    console.log('\n✅ length 필드 수정이 완료되었습니다!');
  })
  .catch((error) => {
    console.error('\n❌ 작업 실패:', error);
    process.exit(1);
  });

