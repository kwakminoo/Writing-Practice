-- 새로운 저장 정책에 맞는 데이터베이스 스키마 업데이트
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. user_subscriptions 테이블 업데이트 (새로운 플랜 추가)
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_subscription_type_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_subscription_type_check 
CHECK (subscription_type IN ('free', 'basic', 'premium'));

-- 2. 자동 만료 정책 함수 업데이트
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

-- 3. 고정 글 수 제한 함수 업데이트
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
        SELECT COUNT(*) INTO pinned_count
        FROM public.user_writings 
        WHERE user_id = NEW.user_id AND is_pinned = true;
        
        IF NEW.is_pinned = true AND pinned_count >= 20 THEN
            RAISE EXCEPTION '베이직 사용자는 최대 20개까지만 고정할 수 있습니다.';
        END IF;
        RETURN NEW;
    END IF;
    
    -- 무료 사용자는 최대 5개 고정 가능
    SELECT COUNT(*) INTO pinned_count
    FROM public.user_writings 
    WHERE user_id = NEW.user_id AND is_pinned = true;
    
    IF NEW.is_pinned = true AND pinned_count >= 5 THEN
        RAISE EXCEPTION '무료 사용자는 최대 5개까지만 고정할 수 있습니다.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 사용자 구독 정보 초기화 (기존 사용자들을 무료로 설정)
INSERT INTO public.user_subscriptions (user_id, subscription_type, subscription_status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- 5. 기존 글들의 storage_tier 업데이트
UPDATE public.user_writings 
SET storage_tier = 'free' 
WHERE storage_tier IS NULL OR storage_tier NOT IN ('free', 'basic', 'premium'); 