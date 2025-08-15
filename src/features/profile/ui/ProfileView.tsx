'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileData, ProfileFormData } from '../schema/profile';
import { getProfile, updateProfile, PROFILE_QUERY_KEYS } from '../api/profile';

// Phase B3 - React Query 도입
// Query/Mutation 훅 사용, 캐시 관리

interface ProfileViewProps {
  userId: string;
}

export default function ProfileView({ userId }: ProfileViewProps) {
  const queryClient = useQueryClient();

  // Query: 프로필 조회
  const {
    data: profileResult,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: PROFILE_QUERY_KEYS.detail(userId),
    queryFn: () => getProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  // Mutation: 프로필 업데이트
  const {
    mutate: updateProfileMutation,
    isPending: isUpdating,
    error: updateError
  } = useMutation({
    mutationFn: (formData: ProfileFormData) => updateProfile(userId, formData),
    onSuccess: (result) => {
      if (result.success && result.data) {
        // 캐시 업데이트
        queryClient.setQueryData(
          PROFILE_QUERY_KEYS.detail(userId),
          result
        );
        // 관련 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: PROFILE_QUERY_KEYS.all
        });
      }
    },
    onError: (error) => {
      console.error('프로필 업데이트 오류:', error);
    }
  });

  const handleUpdateProfile = (formData: ProfileFormData) => {
    updateProfileMutation(formData);
  };

  // 로딩 상태
  if (isProfileLoading) {
    return (
      <div className="profile-view">
        <h2>프로필</h2>
        <div>로딩 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (profileError) {
    return (
      <div className="profile-view">
        <h2>프로필</h2>
        <div>오류: {profileError.message}</div>
        <button onClick={() => refetchProfile()}>다시 시도</button>
      </div>
    );
  }

  // 업데이트 에러 상태
  if (updateError) {
    return (
      <div className="profile-view">
        <h2>프로필</h2>
        <div>업데이트 오류: {updateError.message}</div>
        {profileResult?.success && profileResult.data && (
          <div>
            <p>이름: {profileResult.data.name}</p>
            <p>이메일: {profileResult.data.email}</p>
            <p>가입일: {profileResult.data.created_at}</p>
          </div>
        )}
      </div>
    );
  }

  const profile = profileResult?.success ? profileResult.data : null;

  return (
    <div className="profile-view">
      <h2>프로필</h2>
      {profile ? (
        <div>
          <p>이름: {profile.name}</p>
          <p>이메일: {profile.email}</p>
          <p>가입일: {profile.created_at}</p>
          {isUpdating && <p>업데이트 중...</p>}
        </div>
      ) : (
        <div>
          <p>프로필을 찾을 수 없습니다.</p>
          <button onClick={() => refetchProfile()}>다시 시도</button>
        </div>
      )}
    </div>
  );
}
