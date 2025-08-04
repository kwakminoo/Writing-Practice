-- user_writings 테이블에 title 컬럼 추가
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- title 컬럼 추가
ALTER TABLE public.user_writings 
ADD COLUMN IF NOT EXISTS title TEXT;

-- 기존 데이터에 기본 제목 설정 (연습문제의 경우)
UPDATE public.user_writings 
SET title = '연습문제 글쓰기'
WHERE title IS NULL AND problem_id IS NOT NULL;

-- 자유 글쓰기의 경우
UPDATE public.user_writings 
SET title = '자유 글쓰기'
WHERE title IS NULL AND problem_id IS NULL; 