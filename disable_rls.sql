-- user_writings 테이블 RLS 비활성화
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- RLS 비활성화
ALTER TABLE public.user_writings DISABLE ROW LEVEL SECURITY;

-- 기존 RLS 정책들 삭제 (선택사항)
DROP POLICY IF EXISTS "Users can view own writings" ON public.user_writings;
DROP POLICY IF EXISTS "Users can insert own writings" ON public.user_writings;
DROP POLICY IF EXISTS "Users can update own writings" ON public.user_writings;
DROP POLICY IF EXISTS "Users can delete own writings" ON public.user_writings; 