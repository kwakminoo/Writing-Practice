const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function checkEmailDelivery() {
  console.log('=== 이메일 전송 상태 확인 ===\n');

  const testEmail = 'kwakmw12@naver.com';

  try {
    // 1. 현재 사용자 상태 확인
    console.log('1. 현재 사용자 상태 확인...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('인증된 사용자가 없습니다.');
    } else {
      console.log('현재 사용자:', user.email);
      console.log('이메일 확인 상태:', user.email_confirmed_at ? '확인됨' : '미확인');
      console.log('계정 생성일:', user.created_at);
    }

    // 2. 이메일 재발송 테스트
    console.log('\n2. 이메일 재발송 테스트...');
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
    });

    if (resendError) {
      console.error('이메일 재발송 오류:', resendError);
    } else {
      console.log('✅ 이메일 재발송 요청이 성공했습니다.');
      console.log('📧 받은편지함과 스팸함을 확인해주세요.');
    }

    // 3. 이메일 전송 문제 진단
    console.log('\n3. 이메일 전송 문제 진단...');
    console.log('🔍 가능한 원인들:');
    console.log('1. 스팸함에 이메일이 들어갔을 수 있습니다.');
    console.log('2. Supabase 이메일 서비스에 일시적 문제가 있을 수 있습니다.');
    console.log('3. 이메일 주소가 잘못되었을 수 있습니다.');
    console.log('4. Supabase 설정에 문제가 있을 수 있습니다.');

    console.log('\n🔧 해결 방법:');
    console.log('1. 스팸함 확인 (kwakmw12@naver.com)');
    console.log('2. Supabase 대시보드 → Logs → Auth에서 이메일 발송 로그 확인');
    console.log('3. 다른 이메일 주소로 테스트 (Gmail, Outlook 등)');
    console.log('4. Supabase 대시보드 → Authentication → Settings → Email Auth 설정 확인');

    // 4. 다른 이메일로 테스트 제안
    console.log('\n4. 다른 이메일로 테스트 제안...');
    console.log('다음 이메일 중 하나로 테스트해보세요:');
    console.log('- Gmail: yourname@gmail.com');
    console.log('- Outlook: yourname@outlook.com');
    console.log('- Yahoo: yourname@yahoo.com');
    console.log('- 다른 Naver 계정: another@naver.com');

    // 5. 임시 해결책
    console.log('\n5. 임시 해결책:');
    console.log('이메일 확인 없이 바로 로그인되도록 설정을 변경할 수 있습니다.');
    console.log('Supabase 대시보드 → Authentication → Settings → Email Auth');
    console.log('→ "Enable email confirmations"를 OFF로 설정');

  } catch (error) {
    console.error('이메일 전송 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkEmailDelivery(); 