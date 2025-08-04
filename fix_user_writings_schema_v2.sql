-- user_writings 테이블 구조 완전 수정
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. 기존 user_writings 테이블 삭제 (데이터 백업 후)
-- DROP TABLE IF EXISTS public.user_writings CASCADE;

-- 2. user_writings 테이블 재생성 (올바른 구조로)
CREATE TABLE IF NOT EXISTS public.user_writings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT, -- 제목 (자유 글쓰기용)
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('novel', 'poetry', 'essay', 'screenplay', 'period_drama')),
    word_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    storage_tier TEXT DEFAULT 'free' CHECK (storage_tier IN ('free', 'basic', 'premium')),
    problem_id UUID REFERENCES public.practice_problems(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자 구독 정보 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('free', 'basic', 'premium')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 자동 만료 정책 함수 생성
CREATE OR REPLACE FUNCTION set_writing_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- 무료 사용자: 30일 후 만료
    IF NEW.storage_tier = 'free' THEN
        NEW.expires_at = NOW() + INTERVAL '30 days';
    -- 베이직 사용자: 90일 후 만료
    ELSIF NEW.storage_tier = 'basic' THEN
        NEW.expires_at = NOW() + INTERVAL '90 days';
    -- 프리미엄 사용자: 1년 후 만료
    ELSIF NEW.storage_tier = 'premium' THEN
        NEW.expires_at = NOW() + INTERVAL '1 year';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 글쓰기 삽입 시 자동 만료 설정 트리거
DROP TRIGGER IF EXISTS set_writing_expiry_trigger ON public.user_writings;
CREATE TRIGGER set_writing_expiry_trigger
    BEFORE INSERT ON public.user_writings
    FOR EACH ROW EXECUTE FUNCTION set_writing_expiry();

-- 6. 만료된 글 자동 삭제 함수
CREATE OR REPLACE FUNCTION cleanup_expired_writings()
RETURNS void AS $$
BEGIN
    -- 만료된 글 삭제 (고정된 글 제외)
    DELETE FROM public.user_writings 
    WHERE expires_at < NOW() AND is_pinned = false;
    
    -- 만료된 피드백도 함께 삭제
    DELETE FROM public.ai_feedbacks 
    WHERE writing_id IN (
        SELECT id FROM public.user_writings 
        WHERE expires_at < NOW() AND is_pinned = false
    );
END;
$$ LANGUAGE plpgsql;

-- 7. 사용자별 고정 글 수 제한 함수
CREATE OR REPLACE FUNCTION check_pinned_limit()
RETURNS TRIGGER AS $$
DECLARE
    pinned_count INTEGER;
    max_pinned INTEGER;
BEGIN
    -- 프리미엄 사용자는 제한 없음
    IF EXISTS (
        SELECT 1 FROM public.user_subscriptions 
        WHERE user_id = NEW.user_id 
        AND subscription_type = 'premium' 
        AND subscription_status = 'active'
    ) THEN
        RETURN NEW;
    END IF;
    
    -- 베이직 사용자는 최대 20개 고정 가능
    IF EXISTS (
        SELECT 1 FROM public.user_subscriptions 
        WHERE user_id = NEW.user_id 
        AND subscription_type = 'basic' 
        AND subscription_status = 'active'
    ) THEN
        max_pinned := 20;
    ELSE
        -- 무료 사용자는 최대 5개 고정 가능
        max_pinned := 5;
    END IF;
    
    SELECT COUNT(*) INTO pinned_count
    FROM public.user_writings 
    WHERE user_id = NEW.user_id AND is_pinned = true;
    
    IF NEW.is_pinned = true AND pinned_count >= max_pinned THEN
        RAISE EXCEPTION '고정 글 수 제한에 도달했습니다. (무료: 5개, 베이직: 20개, 프리미엄: 무제한)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 고정 글 수 제한 트리거
DROP TRIGGER IF EXISTS check_pinned_limit_trigger ON public.user_writings;
CREATE TRIGGER check_pinned_limit_trigger
    BEFORE INSERT OR UPDATE ON public.user_writings
    FOR EACH ROW EXECUTE FUNCTION check_pinned_limit();

-- 9. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_writings_expires_at ON public.user_writings(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_writings_is_pinned ON public.user_writings(is_pinned);
CREATE INDEX IF NOT EXISTS idx_user_writings_storage_tier ON public.user_writings(storage_tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(subscription_status);

-- 10. RLS 정책 설정
-- 글쓰기 테이블 RLS
ALTER TABLE public.user_writings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own writings" ON public.user_writings;
CREATE POLICY "Users can view own writings" ON public.user_writings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own writings" ON public.user_writings;
CREATE POLICY "Users can insert own writings" ON public.user_writings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own writings" ON public.user_writings;
CREATE POLICY "Users can update own writings" ON public.user_writings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own writings" ON public.user_writings;
CREATE POLICY "Users can delete own writings" ON public.user_writings
    FOR DELETE USING (auth.uid() = user_id);

-- 구독 정보 테이블 RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. 기존 사용자들을 무료 구독으로 설정
INSERT INTO public.user_subscriptions (user_id, subscription_type, subscription_status)
SELECT id, 'free', 'active' FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions);

-- 12. 자동 업데이트 시간 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. 트리거 설정
DROP TRIGGER IF EXISTS update_user_writings_updated_at ON public.user_writings;
CREATE TRIGGER update_user_writings_updated_at BEFORE UPDATE ON public.user_writings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 