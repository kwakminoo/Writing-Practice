const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function forceDeleteUser(email) {
  console.log(`=== ${email} 계정 강제 삭제 ===\n`);

  try {
    // 1. 먼저 로그인 시도 (계정이 존재하는지 확인)
    console.log('1. 계정 존재 여부 확인...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'testpassword123', // 임시 비밀번호
    });

    if (signInError) {
      console.log('계정이 존재하지 않거나 비밀번호가 다릅니다.');
    } else {
      console.log('계정이 존재합니다. 로그아웃 후 삭제를 진행합니다.');
      await supabase.auth.signOut();
    }

    // 2. 이메일 재발송으로 계정 상태 확인
    console.log('\n2. 이메일 재발송으로 계정 상태 확인...');
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (resendError) {
      console.log('이메일 재발송 오류:', resendError.message);
      
      if (resendError.message.includes('User already registered')) {
        console.log('계정이 이미 등록되어 있습니다.');
        console.log('\n📝 Supabase 대시보드에서 수동 삭제가 필요합니다:');
        console.log('1. Supabase 대시보드 → Authentication → Users');
        console.log(`2. ${email} 계정을 찾아서 삭제`);
        console.log('3. 또는 SQL Editor에서 다음 실행:');
        console.log(`DELETE FROM auth.users WHERE email = '${email}';`);
      }
    } else {
      console.log('이메일 재발송이 성공했습니다.');
    }

    // 3. 새로운 회원가입 시도
    console.log('\n3. 새로운 회원가입 시도...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: email,
      password: 'newpassword123',
      options: {
        data: {
          name: '새로운 테스트 사용자',
        },
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (signupError) {
      console.error('회원가입 오류:', signupError);
      
      if (signupError.message.includes('User already registered')) {
        console.log('\n⚠️ 계정이 이미 존재합니다. 다음 중 하나를 선택하세요:');
        console.log('1. Supabase 대시보드에서 계정 삭제');
        console.log('2. 다른 이메일 주소 사용');
        console.log('3. 기존 계정으로 로그인 시도');
      }
    } else {
      console.log('✅ 새로운 회원가입이 성공했습니다.');
      console.log('사용자 ID:', signupData.user?.id);
      console.log('이메일 확인 필요:', !signupData.session);
    }

  } catch (error) {
    console.error('계정 삭제 중 오류 발생:', error);
  }
}

// 삭제할 이메일 주소
const emailToDelete = 'kwakmw12@naver.com';

// 스크립트 실행
forceDeleteUser(emailToDelete); 