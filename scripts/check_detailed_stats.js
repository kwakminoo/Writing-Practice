const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkDetailedStats() {
  console.log('=== 상세 통계 확인 ===\n');
  
  const categories = ['에세이', '시나리오', '시', '소설'];
  
  for (const category of categories) {
    console.log(`📊 ${category} 카테고리 상세 분석:`);
    
    // 카테고리별 전체 데이터 수
    const { count: categoryCount, error: countError } = await supabase
      .from('practice_problems')
      .select('*', { count: 'exact', head: true })
      .eq('category', category);
    
    if (countError) {
      console.error(`${category} 데이터 수 확인 오류:`, countError);
      continue;
    }
    
    console.log(`  전체 데이터 수: ${categoryCount}개`);
    
    // 타입별 데이터 수
    const { data: typeData, error: typeError } = await supabase
      .from('practice_problems')
      .select('type')
      .eq('category', category);
    
    if (typeError) {
      console.error(`${category} 타입별 데이터 확인 오류:`, typeError);
      continue;
    }
    
    const typeStats = {};
    typeData.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    });
    
    console.log(`  타입별 분포:`);
    Object.entries(typeStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`    ${type}: ${count}개`);
      });
    
    // 샘플 데이터 확인
    const { data: samples, error: sampleError } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('category', category)
      .limit(2);
    
    if (sampleError) {
      console.error(`${category} 샘플 데이터 확인 오류:`, sampleError);
      continue;
    }
    
    if (samples.length > 0) {
      console.log(`  샘플 데이터:`);
      samples.forEach((sample, index) => {
        console.log(`    ${index + 1}. ${sample.type} - "${sample.prompt.substring(0, 50)}..."`);
      });
    }
    
    console.log('');
  }
  
  // 전체 타입별 통계
  console.log('📈 전체 타입별 데이터 수 (상위 30개):');
  const { data: allTypeData, error: allTypeError } = await supabase
    .from('practice_problems')
    .select('type, category');
  
  if (allTypeError) {
    console.error('전체 타입별 데이터 확인 오류:', allTypeError);
    return;
  }
  
  const allTypeStats = {};
  allTypeData.forEach(item => {
    allTypeStats[item.type] = (allTypeStats[item.type] || 0) + 1;
  });
  
  Object.entries(allTypeStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 30)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}개`);
    });
  
  console.log('\n=== 상세 통계 확인 완료 ===');
}

checkDetailedStats().catch(console.error); 