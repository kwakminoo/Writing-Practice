import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 환경 변수가 없을 때 임시 설정 (개발용)
const fallbackUrl = 'https://your-project.supabase.co';
const fallbackKey = 'your-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback values for development.');
}

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackKey
);

// 서버용 클라이언트 (service_role 키 사용)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl || fallbackUrl, supabaseServiceKey)
  : null; 