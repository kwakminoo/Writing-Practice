const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function forceResendEmail(email) {
  console.log(`=== ${email} 강제 이메일 재발송 ===\n`);

  try {
    // 1. 먼저 기존 계정 삭제 시도
    console.log('1. 기존 계정 삭제 시도...');
    
    // 로그인 시도 (계정이 존재하는지 확인)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'testpassword123',
    });

    if (signInError) {
      console.log('계정이 존재하지 않거나 비밀번호가 다릅니다.');
    } else {
      console.log('계정이 존재합니다. 로그아웃합니다.');
      await supabase.auth.signOut();
    }

    // 2. 여러 방법으로 이메일 재발송 시도
    console.log('\n2. 이메일 재발송 시도...');
    
    // 방법 1: 기본 재발송
    console.log('방법 1: 기본 재발송 시도...');
    const { error: resendError1 } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (resendError1) {
      console.log('기본 재발송 실패:', resendError1.message);
    } else {
      console.log('✅ 기본 재발송 성공!');
    }

    // 방법 2: 새로운 회원가입으로 재발송
    console.log('\n방법 2: 새로운 회원가입으로 재발송...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: email,
      password: 'newpassword123',
      options: {
        data: {
          name: '강제 재발송 테스트',
        },
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (signupError) {
      console.log('새로운 회원가입 실패:', signupError.message);
      
      if (signupError.message.includes('User already registered')) {
        console.log('계정이 이미 존재합니다. 다른 방법을 시도합니다.');
        
        // 방법 3: 비밀번호 재설정 이메일로 우회
        console.log('\n방법 3: 비밀번호 재설정 이메일로 우회...');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'http://localhost:3000/auth/callback',
        });

        if (resetError) {
          console.log('비밀번호 재설정 이메일 실패:', resetError.message);
        } else {
          console.log('✅ 비밀번호 재설정 이메일 발송 성공!');
        }
      }
    } else {
      console.log('✅ 새로운 회원가입으로 이메일 발송 성공!');
      console.log('사용자 ID:', signupData.user?.id);
    }

    // 3. 최종 확인
    console.log('\n3. 최종 확인...');
    console.log('📧 다음을 확인해주세요:');
    console.log('1. 받은편지함 확인');
    console.log('2. 스팸함 확인');
    console.log('3. Supabase 대시보드 → Logs → Auth에서 발송 로그 확인');

    // 4. 수동 삭제 안내
    console.log('\n4. 수동 삭제 안내:');
    console.log('만약 여전히 이메일이 오지 않는다면:');
    console.log('1. Supabase 대시보드 → Authentication → Users');
    console.log(`2. ${email} 계정을 찾아서 삭제`);
    console.log('3. 또는 SQL Editor에서 실행:');
    console.log(`DELETE FROM auth.users WHERE email = '${email}';`);
    console.log('4. 삭제 후 다시 회원가입 시도');

  } catch (error) {
    console.error('강제 재발송 중 오류 발생:', error);
  }
}

// 재발송할 이메일 주소
const emailToResend = 'kwakmw12@naver.com';

// 스크립트 실행
forceResendEmail(emailToResend); 