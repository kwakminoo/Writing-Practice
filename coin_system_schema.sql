-- 코인 시스템 데이터베이스 스키마
-- 이 스크립트를 Supabase SQL 편집기에서 실행하세요

-- 1. 사용자 코인 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_coins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    balance INTEGER DEFAULT 100 NOT NULL, -- 초기 100코인
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. 코인 거래 내역 테이블 생성
CREATE TABLE IF NOT EXISTS public.coin_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- 사용/충전 코인 수 (음수: 사용, 양수: 충전)
    type TEXT NOT NULL CHECK (type IN ('use', 'charge', 'bonus', 'refund')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 코인 사용 가격 설정 테이블
CREATE TABLE IF NOT EXISTS public.coin_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_type TEXT NOT NULL UNIQUE,
    coin_cost INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 기본 가격 설정
INSERT INTO public.coin_prices (service_type, coin_cost, description) VALUES
('ai_feedback', 10, 'AI 피드백 서비스'),
('permanent_save', 10, '글 영구 저장'),
('basic_feedback', 5, '기본 피드백 서비스')
ON CONFLICT (service_type) DO NOTHING;

-- 5. 코인 잔액 업데이트 함수
CREATE OR REPLACE FUNCTION update_coin_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- 코인 거래 시 잔액 자동 업데이트
    UPDATE public.user_coins 
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 코인 거래 트리거
DROP TRIGGER IF EXISTS coin_transaction_trigger ON public.coin_transactions;
CREATE TRIGGER coin_transaction_trigger
    AFTER INSERT ON public.coin_transactions
    FOR EACH ROW EXECUTE FUNCTION update_coin_balance();

-- 7. 새 사용자 자동 코인 지급 함수
CREATE OR REPLACE FUNCTION give_welcome_coins()
RETURNS TRIGGER AS $$
BEGIN
    -- 새 사용자에게 100코인 지급
    INSERT INTO public.user_coins (user_id, balance)
    VALUES (NEW.id, 100)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 환영 코인 거래 내역 기록
    INSERT INTO public.coin_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 100, 'bonus', '환영 코인 지급');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 새 사용자 자동 코인 지급 트리거
DROP TRIGGER IF EXISTS welcome_coins_trigger ON auth.users;
CREATE TRIGGER welcome_coins_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION give_welcome_coins();

-- 9. 기존 사용자들에게 코인 지급 (한 번만 실행)
INSERT INTO public.user_coins (user_id, balance)
SELECT id, 100 FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_coins)
ON CONFLICT (user_id) DO NOTHING;

-- 10. 기존 사용자 환영 코인 거래 내역 기록
INSERT INTO public.coin_transactions (user_id, amount, type, description)
SELECT uc.user_id, 100, 'bonus', '기존 사용자 환영 코인 지급'
FROM public.user_coins uc
WHERE uc.user_id NOT IN (
    SELECT user_id FROM public.coin_transactions 
    WHERE type = 'bonus' AND description = '기존 사용자 환영 코인 지급'
);

-- 11. RLS 정책 설정
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_prices ENABLE ROW LEVEL SECURITY;

-- 사용자 코인 RLS 정책
DROP POLICY IF EXISTS "Users can view own coins" ON public.user_coins;
CREATE POLICY "Users can view own coins" ON public.user_coins
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own coins" ON public.user_coins;
CREATE POLICY "Users can update own coins" ON public.user_coins
    FOR UPDATE USING (auth.uid() = user_id);

-- 코인 거래 내역 RLS 정책
DROP POLICY IF EXISTS "Users can view own transactions" ON public.coin_transactions;
CREATE POLICY "Users can view own transactions" ON public.coin_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.coin_transactions;
CREATE POLICY "Users can insert own transactions" ON public.coin_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 코인 가격 RLS 정책 (모든 사용자가 읽기 가능)
DROP POLICY IF EXISTS "Anyone can view coin prices" ON public.coin_prices;
CREATE POLICY "Anyone can view coin prices" ON public.coin_prices
    FOR SELECT USING (true);

-- 12. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_coins_user_id ON public.user_coins(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON public.coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON public.coin_transactions(created_at); 