export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  storageDays: number;
  maxPinned: number;
  storageTier: 'free' | 'basic' | 'premium';
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_type: 'free' | 'basic' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: '무료',
    price: 0,
    currency: 'KRW',
    interval: 'month',
    features: [
      '30일간 글 저장',
      '5개 글 고정 가능',
      '기본 AI 피드백'
    ],
    storageDays: 30,
    maxPinned: 5,
    storageTier: 'free'
  },
  {
    id: 'basic',
    name: '베이직',
    price: 5000,
    currency: 'KRW',
    interval: 'month',
    features: [
      '90일간 글 저장',
      '20개 글 고정 가능',
      '고급 AI 피드백',
      '글쓰기 통계'
    ],
    storageDays: 90,
    maxPinned: 20,
    storageTier: 'basic'
  },
  {
    id: 'premium',
    name: '프리미엄',
    price: 10000,
    currency: 'KRW',
    interval: 'month',
    features: [
      '1년간 글 저장',
      '무제한 글 고정',
      '최고급 AI 피드백',
      '상세한 글쓰기 분석',
      '개인 맞춤 피드백'
    ],
    storageDays: 365,
    maxPinned: -1, // 무제한
    storageTier: 'premium'
  }
]; 