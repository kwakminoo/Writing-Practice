import { z } from 'zod';

// Phase B0 - Profile 도메인 스키마
// Input/Output 타입 분리 및 Zod 검증

// 프로필 데이터 스키마 (Output)
export const ProfileDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '이름은 필수입니다.'),
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

// 프로필 폼 데이터 스키마 (Input)
export const ProfileFormDataSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다.').max(50, '이름은 50자 이하여야 합니다.'),
  email: z.string().email('유효한 이메일을 입력해주세요.'),
});

// 타입 추출
export type ProfileData = z.infer<typeof ProfileDataSchema>;
export type ProfileFormData = z.infer<typeof ProfileFormDataSchema>;

// 검증 함수들
export function validateProfileData(data: unknown): ProfileData {
  return ProfileDataSchema.parse(data);
}

export function validateProfileFormData(data: unknown): ProfileFormData {
  return ProfileFormDataSchema.parse(data);
}
