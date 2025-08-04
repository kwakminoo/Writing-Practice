const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkUserProfiles() {
  console.log('=== 사용자 프로필 정보 확인 ===\n');

  try {
    // 1. auth.users 테이블 확인
    console.log('1. Auth Users 테이블 확인 중...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Auth users 조회 오류:', authError);
      return;
    }

    console.log(`총 ${authUsers.users.length}명의 사용자가 있습니다.`);
    
    authUsers.users.forEach((user, index) => {
      console.log(`\n사용자 ${index + 1}:`);
      console.log(`- ID: ${user.id}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- 이름: ${user.user_metadata?.name || '없음'}`);
      console.log(`- 생성일: ${user.created_at}`);
      console.log(`- 이메일 확인: ${user.email_confirmed_at ? '확인됨' : '미확인'}`);
    });

    // 2. profiles 테이블 확인
    console.log('\n2. Profiles 테이블 확인 중...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Profiles 조회 오류:', profilesError);
      return;
    }

    console.log(`총 ${profiles.length}개의 프로필이 있습니다.`);
    
    profiles.forEach((profile, index) => {
      console.log(`\n프로필 ${index + 1}:`);
      console.log(`- ID: ${profile.id}`);
      console.log(`- 이름: ${profile.name || '없음'}`);
      console.log(`- 아바타: ${profile.avatar_url || '없음'}`);
      console.log(`- 소개: ${profile.bio || '없음'}`);
      console.log(`- 생성일: ${profile.created_at}`);
      console.log(`- 수정일: ${profile.updated_at}`);
    });

    // 3. 매칭 확인
    console.log('\n3. Auth Users와 Profiles 매칭 확인...');
    
    const authUserIds = authUsers.users.map(user => user.id);
    const profileIds = profiles.map(profile => profile.id);
    
    const missingProfiles = authUserIds.filter(id => !profileIds.includes(id));
    const extraProfiles = profileIds.filter(id => !authUserIds.includes(id));
    
    if (missingProfiles.length > 0) {
      console.log(`\n⚠️ 프로필이 없는 사용자: ${missingProfiles.length}명`);
      missingProfiles.forEach(id => {
        const user = authUsers.users.find(u => u.id === id);
        console.log(`- ${user?.email} (${id})`);
      });
    }
    
    if (extraProfiles.length > 0) {
      console.log(`\n⚠️ Auth User가 없는 프로필: ${extraProfiles.length}개`);
      extraProfiles.forEach(id => {
        const profile = profiles.find(p => p.id === id);
        console.log(`- ${profile?.name || '이름 없음'} (${id})`);
      });
    }
    
    if (missingProfiles.length === 0 && extraProfiles.length === 0) {
      console.log('✅ 모든 사용자와 프로필이 정상적으로 매칭됩니다.');
    }

    // 4. 최근 가입한 사용자 상세 확인
    if (authUsers.users.length > 0) {
      console.log('\n4. 최근 가입한 사용자 상세 정보:');
      const latestUser = authUsers.users[0];
      const latestProfile = profiles.find(p => p.id === latestUser.id);
      
      console.log(`- Email: ${latestUser.email}`);
      console.log(`- Auth 이름: ${latestUser.user_metadata?.name || '없음'}`);
      console.log(`- Profile 이름: ${latestProfile?.name || '없음'}`);
      console.log(`- 가입일: ${latestUser.created_at}`);
    }

  } catch (error) {
    console.error('프로필 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkUserProfiles(); 