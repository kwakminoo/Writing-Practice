-- Migration: create community posts and comments tables
-- Applied-by-user: <unknown yet>
-- Generated-at: 2025-01-20

BEGIN;

-- 커뮤니티 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('fiction', 'poetry', 'essay', 'screenplay', 'general')),
  view_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 커뮤니티 댓글 테이블 생성
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON public.community_comments(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (이미 존재하는 경우)
DROP POLICY IF EXISTS "커뮤니티 게시글 조회는 모두 가능" ON public.community_posts;
DROP POLICY IF EXISTS "인증된 사용자만 커뮤니티 게시글 작성 가능" ON public.community_posts;
DROP POLICY IF EXISTS "본인 게시글만 수정 가능" ON public.community_posts;
DROP POLICY IF EXISTS "본인 게시글만 삭제 가능" ON public.community_posts;
DROP POLICY IF EXISTS "댓글 조회는 모두 가능" ON public.community_comments;
DROP POLICY IF EXISTS "인증된 사용자만 댓글 작성 가능" ON public.community_comments;
DROP POLICY IF EXISTS "본인 댓글만 수정 가능" ON public.community_comments;
DROP POLICY IF EXISTS "본인 댓글만 삭제 가능" ON public.community_comments;

-- RLS 정책: 모든 사용자가 커뮤니티 게시글 조회 가능
CREATE POLICY "커뮤니티 게시글 조회는 모두 가능"
  ON public.community_posts
  FOR SELECT
  USING (true);

-- RLS 정책: 인증된 사용자만 커뮤니티 게시글 작성 가능
CREATE POLICY "인증된 사용자만 커뮤니티 게시글 작성 가능"
  ON public.community_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인이 작성한 게시글만 수정 가능
CREATE POLICY "본인 게시글만 수정 가능"
  ON public.community_posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인이 작성한 게시글만 삭제 가능
CREATE POLICY "본인 게시글만 삭제 가능"
  ON public.community_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS 정책: 모든 사용자가 댓글 조회 가능
CREATE POLICY "댓글 조회는 모두 가능"
  ON public.community_comments
  FOR SELECT
  USING (true);

-- RLS 정책: 인증된 사용자만 댓글 작성 가능
CREATE POLICY "인증된 사용자만 댓글 작성 가능"
  ON public.community_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인이 작성한 댓글만 수정 가능
CREATE POLICY "본인 댓글만 수정 가능"
  ON public.community_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인이 작성한 댓글만 삭제 가능
CREATE POLICY "본인 댓글만 삭제 가능"
  ON public.community_comments
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;
