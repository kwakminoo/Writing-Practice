import { supabase } from '@/lib/supabaseClient';
import { ProfileData, ProfileFormData } from '../schema/profile';

// Phase B3 - React Query 도입
// 캐시키 상수화 및 Query/Mutation 함수 정의

// 캐시키 상수화
export const PROFILE_QUERY_KEYS = {
  all: ['profile'] as const,
  detail: (userId: string) => [...PROFILE_QUERY_KEYS.all, userId] as const,
  list: () => [...PROFILE_QUERY_KEYS.all, 'list'] as const,
} as const;

interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

// Query 함수: 프로필 조회
export async function getProfile(userId: string): Promise<ApiResult<ProfileData>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        success: false,
        message: error.message,
        code: error.code
      };
    }

    return {
      success: true,
      data: data as ProfileData
    };
  } catch (error) {
    return {
      success: false,
      message: '프로필을 불러오는 중 오류가 발생했습니다.',
      code: 'UNKNOWN_ERROR'
    };
  }
}

// Mutation 함수: 프로필 업데이트
export async function updateProfile(
  userId: string, 
  formData: ProfileFormData
): Promise<ApiResult<ProfileData>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        email: formData.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: error.message,
        code: error.code
      };
    }

    return {
      success: true,
      data: data as ProfileData
    };
  } catch (error) {
    return {
      success: false,
      message: '프로필을 업데이트하는 중 오류가 발생했습니다.',
      code: 'UNKNOWN_ERROR'
    };
  }
}
