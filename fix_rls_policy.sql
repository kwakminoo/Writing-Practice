-- practice_problems 테이블 RLS 정책 수정
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. practice_problems 테이블에 RLS 비활성화 (공개 데이터이므로)
ALTER TABLE public.practice_problems DISABLE ROW LEVEL SECURITY;

-- 또는 RLS를 유지하면서 모든 사용자가 읽을 수 있도록 정책 설정
-- ALTER TABLE public.practice_problems ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Anyone can view practice problems" ON public.practice_problems
--     FOR SELECT USING (true);

-- 2. 기존 정책이 있다면 삭제
DROP POLICY IF EXISTS "Anyone can view practice problems" ON public.practice_problems;

-- 3. 새로운 정책 생성 (모든 사용자가 읽기 가능)
CREATE POLICY "Anyone can view practice problems" ON public.practice_problems
    FOR SELECT USING (true);

-- 4. 관리자만 삽입/수정/삭제 가능하도록 설정 (선택사항)
-- CREATE POLICY "Only admins can insert practice problems" ON public.practice_problems
--     FOR INSERT WITH CHECK (auth.uid() IN (
--         SELECT id FROM auth.users WHERE email IN ('admin@example.com')
--     ));

-- CREATE POLICY "Only admins can update practice problems" ON public.practice_problems
--     FOR UPDATE USING (auth.uid() IN (
--         SELECT id FROM auth.users WHERE email IN ('admin@example.com')
--     ));

-- CREATE POLICY "Only admins can delete practice problems" ON public.practice_problems
--     FOR DELETE USING (auth.uid() IN (
--         SELECT id FROM auth.users WHERE email IN ('admin@example.com')
--     ));

-- 5. 변경사항 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'practice_problems'; 