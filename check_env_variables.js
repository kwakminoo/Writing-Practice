// 환경 변수 확인 스크립트
// node check_env_variables.js 로 실행

console.log('=== 환경 변수 확인 ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '설정되지 않음');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정되지 않음');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '설정되지 않음');

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다!');
  console.log('📝 .env.local 파일에 다음을 추가해주세요:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
} else {
  console.log('\n✅ 모든 환경 변수가 설정되었습니다!');
} 