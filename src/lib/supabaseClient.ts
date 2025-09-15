import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.warn('📝 .env.local 파일에 환경 변수들을 추가해주세요.');
}

// 더미 클라이언트 생성 (환경 변수가 없을 때)
const createDummyClient = () => createClient('https://example.supabase.co', 'dummy-key');

// 클라이언트용 Supabase (브라우저에서 사용)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();

// 서버용 Supabase (API 라우트에서 사용, service_role 키 사용)
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createDummyClient();

// 서버용 Supabase (service_role 키가 없을 때 fallback)
export const supabaseServer = supabaseServiceKey 
  ? supabaseAdmin
  : supabase; 