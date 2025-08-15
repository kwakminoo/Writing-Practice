import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { getCoinBalance } from '@lib/fetchers/coins';

// Phase B2 - API Route 정비
// 입력 Zod 검증, 명시적 status 코드, 에러 {code,message} 직렬화

// 인증 헤더 검증 스키마
const AuthHeaderSchema = z.object({
  authorization: z.string().refine(
    (val) => val.startsWith('Bearer '),
    { message: 'Authorization header must start with Bearer' }
  )
});

// 응답 에러 타입
interface ApiError {
  code: string;
  message: string;
}

export async function GET(request: NextRequest) {
  try {
    // 1. 입력 검증 - 인증 헤더
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const error: ApiError = {
        code: 'MISSING_AUTH_HEADER',
        message: 'Authorization header is required'
      };
      return NextResponse.json({ error }, { status: 401 });
    }

    try {
      AuthHeaderSchema.parse({ authorization: authHeader });
    } catch (validationError) {
      const error: ApiError = {
        code: 'INVALID_AUTH_HEADER',
        message: 'Invalid authorization header format'
      };
      return NextResponse.json({ error }, { status: 401 });
    }

    // 2. 토큰 추출 및 사용자 인증
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      const error: ApiError = {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      };
      return NextResponse.json({ error }, { status: 401 });
    }

    // 3. 비즈니스 로직 실행
    const result = await getCoinBalance(user.id);

    if (!result.success) {
      const error: ApiError = {
        code: result.error?.code || 'UNKNOWN_ERROR',
        message: result.error?.message || 'Unknown error occurred'
      };
      return NextResponse.json({ error }, { status: 500 });
    }

    // 4. 성공 응답
    return NextResponse.json(result.data, { status: 200 });

  } catch (error) {
    console.error('코인 잔액 조회 중 예상치 못한 오류:', error);
    const apiError: ApiError = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error occurred'
    };
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
} 