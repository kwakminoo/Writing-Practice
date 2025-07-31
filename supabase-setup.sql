-- Supabase 데이터베이스 설정 스크립트
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 사용자 글쓰기 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_writings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('novel', 'poetry', 'essay', 'screenplay', 'period_drama')),
    word_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS public.ai_feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    writing_id UUID REFERENCES public.user_writings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    feedback_content TEXT NOT NULL,
    rating JSONB, -- 평가 점수 (문장력, 흐름, 창의성 등)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) 정책 설정

-- 프로필 테이블 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 읽고 수정할 수 있음
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 글쓰기 테이블 RLS
ALTER TABLE public.user_writings ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 글만 읽고 수정할 수 있음
CREATE POLICY "Users can view own writings" ON public.user_writings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writings" ON public.user_writings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writings" ON public.user_writings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own writings" ON public.user_writings
    FOR DELETE USING (auth.uid() = user_id);

-- AI 피드백 테이블 RLS
ALTER TABLE public.ai_feedbacks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 피드백만 읽을 수 있음
CREATE POLICY "Users can view own feedbacks" ON public.ai_feedbacks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedbacks" ON public.ai_feedbacks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 함수 생성 (자동 업데이트 시간)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. 트리거 설정
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_writings_updated_at BEFORE UPDATE ON public.user_writings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 새 사용자 가입 시 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 새 사용자 가입 시 프로필 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_writings_user_id ON public.user_writings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_writings_type ON public.user_writings(type);
CREATE INDEX IF NOT EXISTS idx_user_writings_created_at ON public.user_writings(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_feedbacks_writing_id ON public.ai_feedbacks(writing_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedbacks_user_id ON public.ai_feedbacks(user_id); 