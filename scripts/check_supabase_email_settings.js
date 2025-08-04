const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkSupabaseEmailSettings() {
  console.log('=== Supabase 이메일 설정 확인 ===\n');

  try {
    // 1. 현재 사용자 확인
    console.log('1. 현재 인증된 사용자 확인...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('인증된 사용자가 없습니다.');
    } else {
      console.log('현재 사용자:', user.email);
      console.log('이메일 확인 상태:', user.email_confirmed_at ? '확인됨' : '미확인');
    }

    // 2. 이메일 재발송 테스트
    console.log('\n2. 이메일 재발송 테스트...');
    const testEmail = 'kwakmw12@naver.com';
    
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
    });

    if (resendError) {
      console.error('이메일 재발송 오류:', resendError);
      console.log('\n🔧 문제 해결 방법:');
      console.log('1. Supabase 대시보드 → Authentication → Settings → Email Auth');
      console.log('2. "Enable email confirmations"가 활성화되어 있는지 확인');
      console.log('3. "Enable secure email change"가 활성화되어 있는지 확인');
      console.log('4. 이메일 템플릿이 제대로 설정되어 있는지 확인');
    } else {
      console.log('✅ 이메일 재발송 요청이 성공했습니다.');
      console.log('받은편지함과 스팸함을 확인해주세요.');
    }

    // 3. 회원가입 테스트
    console.log('\n3. 회원가입 테스트...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          name: '테스트 사용자',
        },
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (signupError) {
      console.error('회원가입 오류:', signupError);
    } else {
      console.log('✅ 회원가입 요청이 성공했습니다.');
      if (signupData.user && !signupData.session) {
        console.log('이메일 확인이 필요합니다.');
        console.log('사용자 ID:', signupData.user.id);
        console.log('이메일:', signupData.user.email);
      } else if (signupData.session) {
        console.log('이메일 확인 없이 바로 로그인되었습니다.');
      }
    }

  } catch (error) {
    console.error('설정 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkSupabaseEmailSettings(); 