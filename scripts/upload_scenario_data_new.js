const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function uploadScenarioData() {
  console.log('=== 시나리오 데이터 업로드 시작 ===');
  
  // 1. 장면 묘사 데이터 업로드
  console.log('\n1. 장면 묘사 데이터 업로드 중...');
  const sceneDescriptionData = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('scenario_scene_description_id_blank.csv')
      .pipe(csv())
      .on('data', (row) => {
        // id가 비어있으면 제거
        if (row.id === '') {
          delete row.id;
        }
        
        // keywords를 배열로 변환
        if (row.keywords && row.keywords.startsWith('[') && row.keywords.endsWith(']')) {
          try {
            row.keywords = JSON.parse(row.keywords);
          } catch (e) {
            row.keywords = row.keywords.replace(/[\[\]"]/g, '').split(', ');
          }
        }
        
        // length를 숫자로 변환
        if (row.length) {
          row.length = parseInt(row.length) || null;
        }
        
        sceneDescriptionData.push(row);
      })
      .on('end', async () => {
        console.log(`장면 묘사 데이터 ${sceneDescriptionData.length}개 읽기 완료`);
        
        try {
          const { data: sceneData, error: sceneError } = await supabase
            .from('practice_problems')
            .insert(sceneDescriptionData)
            .select();
          
          if (sceneError) {
            console.error('장면 묘사 데이터 업로드 오류:', sceneError);
            reject(sceneError);
            return;
          }
          
          console.log(`✅ 장면 묘사 데이터 ${sceneData.length}개 업로드 완료`);
          
          // 2. 결말 재구성 데이터 업로드
          console.log('\n2. 결말 재구성 데이터 업로드 중...');
          const endingRewriteData = [];
          
          fs.createReadStream('Scenario_Ending_Rewrite_Practice__All_1_000_-_Fixed_UTF8_ (1).csv')
            .pipe(csv())
            .on('data', (row) => {
              // id가 비어있으면 제거
              if (row.id === '') {
                delete row.id;
              }
              
              // keywords를 배열로 변환
              if (row.keywords && row.keywords.startsWith('[') && row.keywords.endsWith(']')) {
                try {
                  row.keywords = JSON.parse(row.keywords);
                } catch (e) {
                  row.keywords = row.keywords.replace(/[\[\]"]/g, '').split(', ');
                }
              }
              
              // length를 숫자로 변환
              if (row.length) {
                row.length = parseInt(row.length) || null;
              }
              
              endingRewriteData.push(row);
            })
            .on('end', async () => {
              console.log(`결말 재구성 데이터 ${endingRewriteData.length}개 읽기 완료`);
              
              try {
                const { data: endingData, error: endingError } = await supabase
                  .from('practice_problems')
                  .insert(endingRewriteData)
                  .select();
                
                if (endingError) {
                  console.error('결말 재구성 데이터 업로드 오류:', endingError);
                  reject(endingError);
                  return;
                }
                
                console.log(`✅ 결말 재구성 데이터 ${endingData.length}개 업로드 완료`);
                
                // 3. 업로드 후 확인
                console.log('\n3. 업로드 후 데이터 확인...');
                const { data: allData, error: allError } = await supabase
                  .from('practice_problems')
                  .select('*')
                  .eq('category', '시나리오');
                
                if (allError) {
                  console.error('데이터 확인 오류:', allError);
                  reject(allError);
                  return;
                }
                
                console.log(`시나리오 카테고리 전체 데이터: ${allData.length}개`);
                
                // 타입별 통계
                const typeStats = {};
                allData.forEach(item => {
                  typeStats[item.type] = (typeStats[item.type] || 0) + 1;
                });
                
                console.log('\n=== 시나리오 카테고리 타입별 통계 ===');
                Object.keys(typeStats).forEach(type => {
                  console.log(`${type}: ${typeStats[type]}개`);
                });
                
                console.log('\n=== 업로드 작업 완료 ===');
                resolve();
              } catch (error) {
                console.error('결말 재구성 데이터 업로드 중 오류:', error);
                reject(error);
              }
            })
            .on('error', (error) => {
              console.error('결말 재구성 CSV 읽기 오류:', error);
              reject(error);
            });
        } catch (error) {
          console.error('장면 묘사 데이터 업로드 중 오류:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('장면 묘사 CSV 읽기 오류:', error);
        reject(error);
      });
  });
}

uploadScenarioData().catch(console.error); 