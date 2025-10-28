// Phase A2 - Lib 배럴 파일
// 기존 lib 파일들을 export하는 배럴 파일

import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 환경 변수 검증
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.warn('📝 Vercel에서 환경 변수를 설정해주세요.');
}

// 더미 클라이언트 생성 (환경 변수가 없을 때)
const createDummyClient = () => createClient('https://example.supabase.co', 'dummy-key');

// 클라이언트용 Supabase
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : createDummyClient();

// 서버용 Supabase (service_role 키 사용)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createDummyClient();

export const supabaseServer = supabaseServiceKey ? supabaseAdmin : supabase;
