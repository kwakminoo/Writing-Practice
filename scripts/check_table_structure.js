const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkTableStructure() {
  console.log('=== practice_problems 테이블 구조 확인 ===\n');
  
  try {
    // 1. 하나의 레코드를 자세히 조회
    const { data: sampleData, error: sampleError } = await supabase
      .from('practice_problems')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('샘플 데이터 조회 오류:', sampleError);
      return;
    }
    
    if (sampleData.length === 0) {
      console.log('데이터가 없습니다.');
      return;
    }
    
    const sample = sampleData[0];
    console.log('📋 테이블 컬럼 구조:');
    console.log('='.repeat(50));
    
    Object.keys(sample).forEach(key => {
      const value = sample[key];
      const type = typeof value;
      const isArray = Array.isArray(value);
      const isNull = value === null;
      const isUndefined = value === undefined;
      
      let displayValue = value;
      if (isArray) {
        displayValue = `[${value.length}개 항목]`;
      } else if (isNull) {
        displayValue = 'NULL';
      } else if (isUndefined) {
        displayValue = 'undefined';
      } else if (typeof value === 'string' && value.length > 50) {
        displayValue = value.substring(0, 50) + '...';
      }
      
      console.log(`${key.padEnd(15)} | ${type.padEnd(10)} | ${displayValue}`);
    });
    
    console.log('\n📊 전체 데이터 통계:');
    console.log('='.repeat(50));
    
    // 2. 전체 데이터 수
    const { count: totalCount, error: countError } = await supabase
      .from('practice_problems')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`전체 레코드 수: ${totalCount}개`);
    }
    
    // 3. 카테고리별 통계
    const { data: categoryData, error: categoryError } = await supabase
      .from('practice_problems')
      .select('category, type');
    
    if (!categoryError) {
      const categoryStats = {};
      const typeStats = {};
      
      categoryData.forEach(item => {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
        typeStats[item.type] = (typeStats[item.type] || 0) + 1;
      });
      
      console.log('\n📈 카테고리별 데이터 수:');
      Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count}개`);
        });
      
      console.log('\n📈 타입별 데이터 수 (상위 10개):');
      Object.entries(typeStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count}개`);
        });
    }
    
    // 4. 샘플 데이터 상세 출력
    console.log('\n📝 샘플 데이터 상세:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(sample, null, 2));
    
  } catch (err) {
    console.error('예상치 못한 오류:', err);
  }
}

checkTableStructure();


