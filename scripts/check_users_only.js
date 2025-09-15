const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkUsersOnly() {
  console.log('=== Users 테이블 확인 ===\n');

  try {
    // users 테이블 확인
    console.log('Users 테이블 조회 중...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Users 조회 오류:', usersError);
      return;
    }

    console.log(`총 ${users.length}명의 사용자가 있습니다.`);
    
    if (users.length === 0) {
      console.log('❌ 사용자 정보가 없습니다. 회원가입 시 사용자 정보가 생성되지 않았을 수 있습니다.');
    } else {
      users.forEach((user, index) => {
        console.log(`\n사용자 ${index + 1}:`);
        console.log(`- ID: ${user.id}`);
        console.log(`- 이름: ${user.name || '없음'}`);
        console.log(`- 아바타: ${user.avatar_url || '없음'}`);
        console.log(`- 소개: ${user.bio || '없음'}`);
        console.log(`- 생성일: ${user.created_at}`);
        console.log(`- 수정일: ${user.updated_at}`);
      });
    }

    // 테이블 구조 확인
    console.log('\n=== 테이블 구조 확인 ===');
    const { data: tableInfo, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (tableError) {
      console.error('테이블 구조 확인 오류:', tableError);
    } else {
      console.log('✅ users 테이블이 정상적으로 존재합니다.');
    }

  } catch (error) {
    console.error('사용자 정보 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkUsersOnly(); 