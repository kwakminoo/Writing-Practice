// Phase A2 - Lib 배럴 파일
// 기존 lib 파일들을 export하는 배럴 파일

import { createClient } from '@supabase/supabase-js';

// 하드코딩된 Supabase 클라이언트 (환경 변수 문제 해결)
const supabaseUrl = 'https://zvhhjroidnpuxxhskffz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc0ODI0OSwiZXhwIjoyMDY4MzI0MjQ5fQ.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
export const supabaseServer = supabaseAdmin;
