-- 사용자 글쓰기 테이블 구조 개선
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. user_writings 테이블에 새로운 필드 추가
ALTER TABLE public.user_writings 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS storage_tier TEXT DEFAULT 'free' CHECK (storage_tier IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS problem_id UUID REFERENCES public.practice_problems(id);

-- 2. 사용자 구독 정보 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('free', 'premium')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 자동 만료 정책 함수 생성
CREATE OR REPLACE FUNCTION set_writing_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- 무료 사용자: 30일 후 만료
    IF NEW.storage_tier = 'free' THEN
        NEW.expires_at = NOW() + INTERVAL '30 days';
    -- 프리미엄 사용자: 만료 없음
    ELSIF NEW.storage_tier = 'premium' THEN
        NEW.expires_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 글쓰기 삽입 시 자동 만료 설정 트리거
CREATE TRIGGER set_writing_expiry_trigger
    BEFORE INSERT ON public.user_writings
    FOR EACH ROW EXECUTE FUNCTION set_writing_expiry();

-- 5. 만료된 글 자동 삭제 함수
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

-- 6. 사용자별 고정 글 수 제한 함수
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
    
    -- 무료 사용자는 최대 10개 고정 가능
    SELECT COUNT(*) INTO pinned_count
    FROM public.user_writings 
    WHERE user_id = NEW.user_id AND is_pinned = true;
    
    IF NEW.is_pinned = true AND pinned_count >= 10 THEN
        RAISE EXCEPTION '무료 사용자는 최대 10개까지만 고정할 수 있습니다.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 고정 글 수 제한 트리거
CREATE TRIGGER check_pinned_limit_trigger
    BEFORE INSERT OR UPDATE ON public.user_writings
    FOR EACH ROW EXECUTE FUNCTION check_pinned_limit();

-- 8. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_writings_expires_at ON public.user_writings(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_writings_is_pinned ON public.user_writings(is_pinned);
CREATE INDEX IF NOT EXISTS idx_user_writings_storage_tier ON public.user_writings(storage_tier);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(subscription_status);

-- 9. RLS 정책 업데이트
-- 구독 정보 테이블 RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. 정기 정리 작업 스케줄링 (매일 자정)
-- 이 함수는 Supabase의 pg_cron 확장을 사용하여 스케줄링할 수 있습니다
-- SELECT cron.schedule('cleanup-expired-writings', '0 0 * * *', 'SELECT cleanup_expired_writings();'); 