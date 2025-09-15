const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function uploadStoryRestructureData() {
  console.log('=== 이야기 재구성 데이터 업로드 시작 ===\n');
  
  try {
    // 1. CSV 파일 읽기
    console.log('1. CSV 파일 읽는 중...');
    const results = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream('이야기 재구성 데이터.csv')
        .pipe(csv())
        .on('data', (data) => {
          // keywords 배열 처리
          let keywords = [];
          if (data.keywords && data.keywords.trim() !== '') {
            try {
              // JSON 배열 형태로 파싱
              keywords = JSON.parse(data.keywords);
            } catch (e) {
              // 쉼표로 구분된 문자열로 처리
              keywords = data.keywords.split(',').map(k => k.trim().replace(/['"]/g, ''));
            }
          }
          
          results.push({
            category: data.category,
            type: data.type,
            difficulty: data.difficulty,
            prompt: data.prompt,
            keywords: keywords,
            length: parseInt(data.length) || 0
          });
        })
        .on('end', async () => {
          console.log(`총 ${results.length}개의 데이터를 읽었습니다.\n`);
          
          // 2. 기존 "이야기 재구성" 데이터 삭제
          console.log('2. 기존 "이야기 재구성" 데이터 삭제 중...');
          const { error: deleteError } = await supabase
            .from('practice_problems')
            .delete()
            .eq('type', '이야기 재구성');
          
          if (deleteError) {
            console.error('기존 데이터 삭제 오류:', deleteError);
            reject(deleteError);
            return;
          }
          
          console.log('기존 "이야기 재구성" 데이터 삭제 완료\n');
          
          // 3. 새 데이터 업로드 (배치 처리)
          console.log('3. 새 데이터 업로드 중...');
          const batchSize = 100;
          let successCount = 0;
          let errorCount = 0;
          
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            
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
          
          // 4. 업로드 결과 확인
          console.log('\n4. 업로드 결과 확인 중...');
          const { data: verifyData, error: verifyError } = await supabase
            .from('practice_problems')
            .select('*')
            .eq('type', '이야기 재구성');
          
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
          
          resolve();
        })
        .on('error', (error) => {
          console.error('CSV 파일 읽기 오류:', error);
          reject(error);
        });
    });
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
    throw err;
  }
}

// 스크립트 실행
uploadStoryRestructureData()
  .then(() => {
    console.log('\n=== 이야기 재구성 데이터 업로드 완료 ===');
  })
  .catch((error) => {
    console.error('\n업로드 실패:', error);
    process.exit(1);
  });

