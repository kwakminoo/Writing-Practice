const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkProfilesOnly() {
  console.log('=== Profiles 테이블 확인 ===\n');

  try {
    // profiles 테이블 확인
    console.log('Profiles 테이블 조회 중...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Profiles 조회 오류:', profilesError);
      return;
    }

    console.log(`총 ${profiles.length}개의 프로필이 있습니다.`);
    
    if (profiles.length === 0) {
      console.log('❌ 프로필이 없습니다. 회원가입 시 프로필이 생성되지 않았을 수 있습니다.');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`\n프로필 ${index + 1}:`);
        console.log(`- ID: ${profile.id}`);
        console.log(`- 이름: ${profile.name || '없음'}`);
        console.log(`- 아바타: ${profile.avatar_url || '없음'}`);
        console.log(`- 소개: ${profile.bio || '없음'}`);
        console.log(`- 생성일: ${profile.created_at}`);
        console.log(`- 수정일: ${profile.updated_at}`);
      });
    }

    // 테이블 구조 확인
    console.log('\n=== 테이블 구조 확인 ===');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('테이블 구조 확인 오류:', tableError);
    } else {
      console.log('✅ profiles 테이블이 정상적으로 존재합니다.');
    }

  } catch (error) {
    console.error('프로필 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkProfilesOnly(); 