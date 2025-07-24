import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 연습 방식별 키워드(예시)
const problemTypes = [
  'daily', 'theme', 'copy', 'rewrite', 'sense', 'onesentence', 'continue', 'perspective',
  'image', 'rhythm', 'wordplay', 'improv', 'mimic', 'variation', 'timer',
  'roleplay', 'scene', 'dialogue', 'structure', 'desc', 'genre',
  // ... (총 32개, 실제 프로젝트에 맞게 추가)
];

// 각 타입별 100개 데이터 자동 생성 예시
function generateProblems(type: string): { type: string, content: string }[] {
  const problems = [];
  for (let i = 1; i <= 100; i++) {
    problems.push({
      type,
      content: `[${type.toUpperCase()}] 자동 생성 문제 예시 #${i}`
    });
  }
  return problems;
}

async function seed() {
  let total = 0;
  for (const type of problemTypes) {
    const problems = generateProblems(type);
    const { error } = await supabase.from('practice_problems').insert(problems);
    if (error) {
      console.error(`Error inserting for type ${type}:`, error);
    } else {
      console.log(`${type}: ${problems.length}개 업로드 완료`);
      total += problems.length;
    }
  }
  console.log(`총 ${total}개 문제 업로드 완료!`);
}

seed(); 