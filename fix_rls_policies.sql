-- user_writings 테이블 RLS 정책 수정
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view own writings" ON public.user_writings;
DROP POLICY IF EXISTS "Users can insert own writings" ON public.user_writings;
DROP POLICY IF EXISTS "Users can update own writings" ON public.user_writings;
DROP POLICY IF EXISTS "Users can delete own writings" ON public.user_writings;

-- 2. 새로운 RLS 정책 생성
CREATE POLICY "Users can view own writings" ON public.user_writings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writings" ON public.user_writings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writings" ON public.user_writings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own writings" ON public.user_writings
    FOR DELETE USING (auth.uid() = user_id);

-- 3. RLS가 활성화되어 있는지 확인
ALTER TABLE public.user_writings ENABLE ROW LEVEL SECURITY; 