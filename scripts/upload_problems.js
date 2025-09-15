const { createClient } = require('@supabase/supabase-js');
const problems = require('../problems.json');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function insertProblems() {
  // practice_problems 테이블에 맞게 변환 (DB 구조에 맞춤)
  const practiceProblems = problems.map((p) => ({
    prompt: p.prompt,
    type: p.type,
    category: p.category
  }));
  for (let i = 0; i < practiceProblems.length; i += 1000) {
    const chunk = practiceProblems.slice(i, i + 1000);
    const { error } = await supabase.from('practice_problems').insert(chunk);
    if (error) {
      console.error('에러 발생:', error);
      break;
    }
    console.log(`${i + chunk.length}개 업로드 완료`);
  }
  console.log('모든 문제 업로드 완료!');
}

insertProblems(); 