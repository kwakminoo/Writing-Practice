const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkDataQuality() {
  console.log('=== 데이터 품질 점검 시작 ===\n');
  
  // 1. 전체 데이터 수 확인
  const { count: totalCount, error: countError } = await supabase
    .from('practice_problems')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('전체 데이터 수 확인 오류:', countError);
    return;
  }
  
  console.log(`📊 전체 데이터 수: ${totalCount}개\n`);
  
  // 2. 카테고리별 데이터 수 확인
  const { data: categoryData, error: categoryError } = await supabase
    .from('practice_problems')
    .select('category, type')
    .order('category');
  
  if (categoryError) {
    console.error('카테고리별 데이터 확인 오류:', categoryError);
    return;
  }
  
  const categoryStats = {};
  const typeStats = {};
  
  categoryData.forEach(item => {
    categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
    typeStats[item.type] = (typeStats[item.type] || 0) + 1;
  });
  
  console.log('📈 카테고리별 데이터 수:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}개`);
  });
  
  console.log('\n📈 타입별 데이터 수 (상위 20개):');
  Object.entries(typeStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}개`);
    });
  
  // 3. 각 카테고리별 샘플 데이터 확인
  const categories = ['에세이', '시나리오', '시', '소설'];
  
  for (const category of categories) {
    console.log(`\n🔍 ${category} 카테고리 샘플 데이터 확인:`);
    
    const { data: samples, error: sampleError } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('category', category)
      .limit(3);
    
    if (sampleError) {
      console.error(`${category} 샘플 데이터 확인 오류:`, sampleError);
      continue;
    }
    
    if (samples.length === 0) {
      console.log(`  ❌ ${category} 데이터가 없습니다.`);
      continue;
    }
    
    samples.forEach((sample, index) => {
      console.log(`\n  📝 샘플 ${index + 1}:`);
      console.log(`    Type: ${sample.type}`);
      console.log(`    Difficulty: ${sample.difficulty}`);
      console.log(`    Length: ${sample.length}`);
      console.log(`    Keywords: ${JSON.stringify(sample.keywords)}`);
      console.log(`    Prompt: ${sample.prompt.substring(0, 100)}...`);
      
      // 데이터 품질 체크
      const qualityIssues = [];
      if (!sample.prompt || sample.prompt.trim() === '') {
        qualityIssues.push('빈 프롬프트');
      }
      if (sample.prompt && sample.prompt.length < 10) {
        qualityIssues.push('너무 짧은 프롬프트');
      }
      if (!sample.type || sample.type.trim() === '') {
        qualityIssues.push('빈 타입');
      }
      if (!sample.difficulty || sample.difficulty.trim() === '') {
        qualityIssues.push('빈 난이도');
      }
      
      if (qualityIssues.length > 0) {
        console.log(`    ⚠️ 품질 이슈: ${qualityIssues.join(', ')}`);
      } else {
        console.log(`    ✅ 품질 양호`);
      }
    });
  }
  
  // 4. 빈 데이터나 문제가 있는 데이터 확인
  console.log('\n🔍 빈 데이터 확인:');
  
  const { data: emptyPrompts, error: emptyError } = await supabase
    .from('practice_problems')
    .select('id, category, type, prompt')
    .or('prompt.is.null,prompt.eq.')
    .limit(10);
  
  if (emptyError) {
    console.error('빈 프롬프트 확인 오류:', emptyError);
  } else if (emptyPrompts.length > 0) {
    console.log(`  ⚠️ 빈 프롬프트가 있는 데이터: ${emptyPrompts.length}개`);
    emptyPrompts.forEach(item => {
      console.log(`    ID: ${item.id}, Category: ${item.category}, Type: ${item.type}`);
    });
  } else {
    console.log('  ✅ 빈 프롬프트 없음');
  }
  
  console.log('\n=== 데이터 품질 점검 완료 ===');
}

checkDataQuality().catch(console.error); 