import { describe, it, expect } from 'vitest';
import { 
  ProfileDataSchema, 
  ProfileFormDataSchema,
  validateProfileData,
  validateProfileFormData 
} from './profile';

// Phase D1 - Profile 스키마 단위 테스트
// Zod 스키마: happy/edge/에러 케이스 테스트

describe('ProfileDataSchema', () => {
  describe('happy case - 유효한 프로필 데이터', () => {
    it('올바른 형식의 프로필 데이터를 검증해야 한다', () => {
      const validProfileData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '홍길동',
        email: 'hong@example.com',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z'
      };

      const result = ProfileDataSchema.safeParse(validProfileData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProfileData);
      }
    });

    it('validateProfileData 함수가 유효한 데이터를 반환해야 한다', () => {
      const validProfileData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '김철수',
        email: 'kim@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const result = validateProfileData(validProfileData);
      
      expect(result).toEqual(validProfileData);
    });
  });

  describe('edge case - 경계값 테스트', () => {
    it('updated_at이 없는 프로필 데이터를 허용해야 한다', () => {
      const profileDataWithoutUpdatedAt = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '이영희',
        email: 'lee@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const result = ProfileDataSchema.safeParse(profileDataWithoutUpdatedAt);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.updated_at).toBeUndefined();
      }
    });

    it('최소 길이의 이름을 허용해야 한다', () => {
      const profileDataWithMinName = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '김',
        email: 'min@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const result = ProfileDataSchema.safeParse(profileDataWithMinName);
      
      expect(result.success).toBe(true);
    });
  });

  describe('error case - 유효하지 않은 데이터', () => {
    it('잘못된 UUID 형식의 ID를 거부해야 한다', () => {
      const invalidProfileData = {
        id: 'invalid-uuid',
        name: '홍길동',
        email: 'hong@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const result = ProfileDataSchema.safeParse(invalidProfileData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['id']);
        expect(result.error.issues[0].message).toContain('Invalid uuid');
      }
    });

    it('빈 이름을 거부해야 한다', () => {
      const profileDataWithEmptyName = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '',
        email: 'hong@example.com',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const result = ProfileDataSchema.safeParse(profileDataWithEmptyName);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('이름은 필수입니다');
      }
    });

    it('잘못된 이메일 형식을 거부해야 한다', () => {
      const profileDataWithInvalidEmail = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '홍길동',
        email: 'invalid-email',
        created_at: '2024-01-01T00:00:00.000Z'
      };

      const result = ProfileDataSchema.safeParse(profileDataWithInvalidEmail);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
        expect(result.error.issues[0].message).toContain('유효한 이메일을 입력해주세요');
      }
    });

    it('잘못된 날짜 형식을 거부해야 한다', () => {
      const profileDataWithInvalidDate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '홍길동',
        email: 'hong@example.com',
        created_at: 'invalid-date'
      };

      const result = ProfileDataSchema.safeParse(profileDataWithInvalidDate);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['created_at']);
        expect(result.error.issues[0].message).toContain('Invalid datetime');
      }
    });
  });
});

describe('ProfileFormDataSchema', () => {
  describe('happy case - 유효한 폼 데이터', () => {
    it('올바른 형식의 폼 데이터를 검증해야 한다', () => {
      const validFormData = {
        name: '홍길동',
        email: 'hong@example.com'
      };

      const result = ProfileFormDataSchema.safeParse(validFormData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validFormData);
      }
    });

    it('validateProfileFormData 함수가 유효한 데이터를 반환해야 한다', () => {
      const validFormData = {
        name: '김철수',
        email: 'kim@example.com'
      };

      const result = validateProfileFormData(validFormData);
      
      expect(result).toEqual(validFormData);
    });
  });

  describe('edge case - 경계값 테스트', () => {
    it('최대 길이의 이름을 허용해야 한다', () => {
      const formDataWithMaxName = {
        name: 'A'.repeat(50), // 최대 50자
        email: 'max@example.com'
      };

      const result = ProfileFormDataSchema.safeParse(formDataWithMaxName);
      
      expect(result.success).toBe(true);
    });

    it('최소 길이의 이름을 허용해야 한다', () => {
      const formDataWithMinName = {
        name: '김',
        email: 'min@example.com'
      };

      const result = ProfileFormDataSchema.safeParse(formDataWithMinName);
      
      expect(result.success).toBe(true);
    });
  });

  describe('error case - 유효하지 않은 폼 데이터', () => {
    it('빈 이름을 거부해야 한다', () => {
      const formDataWithEmptyName = {
        name: '',
        email: 'hong@example.com'
      };

      const result = ProfileFormDataSchema.safeParse(formDataWithEmptyName);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('이름은 필수입니다');
      }
    });

    it('최대 길이를 초과하는 이름을 거부해야 한다', () => {
      const formDataWithTooLongName = {
        name: 'A'.repeat(51), // 51자 (최대 50자 초과)
        email: 'long@example.com'
      };

      const result = ProfileFormDataSchema.safeParse(formDataWithTooLongName);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['name']);
        expect(result.error.issues[0].message).toContain('이름은 50자 이하여야 합니다');
      }
    });

    it('잘못된 이메일 형식을 거부해야 한다', () => {
      const formDataWithInvalidEmail = {
        name: '홍길동',
        email: 'invalid-email-format'
      };

      const result = ProfileFormDataSchema.safeParse(formDataWithInvalidEmail);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
        expect(result.error.issues[0].message).toContain('유효한 이메일을 입력해주세요');
      }
    });

    it('이메일이 없는 데이터를 거부해야 한다', () => {
      const formDataWithoutEmail = {
        name: '홍길동'
      };

      const result = ProfileFormDataSchema.safeParse(formDataWithoutEmail);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
        expect(result.error.issues[0].message).toContain('Required');
      }
    });
  });
});








