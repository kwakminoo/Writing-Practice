const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function deleteUserAccount(email) {
  console.log(`=== ${email} 계정 삭제 ===\n`);

  try {
    // 1. 먼저 사용자 정보 확인
    console.log('1. 사용자 정보 확인 중...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('id', (await supabase.auth.admin.getUserByEmail(email)).data.user?.id);

    if (usersError) {
      console.log('users 테이블에서 사용자 정보를 찾을 수 없습니다.');
    } else {
      console.log('users 테이블에서 사용자 정보 발견:', users);
    }

    // 2. 사용자 글쓰기 데이터 확인
    console.log('\n2. 사용자 글쓰기 데이터 확인 중...');
    const { data: writings, error: writingsError } = await supabase
      .from('user_writings')
      .select('*')
      .eq('user_id', (await supabase.auth.admin.getUserByEmail(email)).data.user?.id);

    if (writingsError) {
      console.log('user_writings 테이블에서 데이터를 찾을 수 없습니다.');
    } else {
      console.log(`user_writings 테이블에서 ${writings.length}개의 글 발견`);
    }

    // 3. AI 피드백 데이터 확인
    console.log('\n3. AI 피드백 데이터 확인 중...');
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from('ai_feedbacks')
      .select('*')
      .eq('user_id', (await supabase.auth.admin.getUserByEmail(email)).data.user?.id);

    if (feedbacksError) {
      console.log('ai_feedbacks 테이블에서 데이터를 찾을 수 없습니다.');
    } else {
      console.log(`ai_feedbacks 테이블에서 ${feedbacks.length}개의 피드백 발견`);
    }

    console.log('\n⚠️ 주의: 이 스크립트는 클라이언트 권한으로는 사용자 계정을 삭제할 수 없습니다.');
    console.log('Supabase 대시보드에서 수동으로 삭제해야 합니다.');
    console.log('\n📝 수동 삭제 방법:');
    console.log('1. Supabase 대시보드에 로그인');
    console.log('2. Authentication → Users로 이동');
    console.log(`3. ${email} 계정을 찾아서 삭제 버튼 클릭`);
    console.log('4. 확인 후 삭제 완료');

  } catch (error) {
    console.error('계정 삭제 중 오류 발생:', error);
    console.log('\n📝 수동 삭제 방법:');
    console.log('1. Supabase 대시보드에 로그인');
    console.log('2. Authentication → Users로 이동');
    console.log(`3. ${email} 계정을 찾아서 삭제 버튼 클릭`);
    console.log('4. 확인 후 삭제 완료');
  }
}

// 삭제할 이메일 주소
const emailToDelete = 'kwakmw12@naver.com';

// 스크립트 실행
deleteUserAccount(emailToDelete); 