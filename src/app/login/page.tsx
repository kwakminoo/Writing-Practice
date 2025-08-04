"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  
  const { user, loading, error, login, signup, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!formData.email) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    if (!isLogin && !formData.name.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationErrors({}); // Clear previous validation errors
    if (!validateForm()) {
      return; // Stop if validation fails
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
        // 회원가입 성공 시 이메일 재발송 옵션 표시
        setShowResendEmail(true);
        setResendEmail(formData.email);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: '',
      });
    }
  };

  const handleTabChange = (newIsLogin: boolean) => {
    setIsLogin(newIsLogin);
    clearError();
    setValidationErrors({});
    setFormData({ email: '', password: '', name: '' });
    setShowResendEmail(false);
    setResendStatus('');
  };

  const handleInvalid = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const handleResendEmail = async () => {
    if (!resendEmail) {
      setResendStatus('이메일을 입력해주세요.');
      return;
    }

    try {
      setResendStatus('이메일 재발송 중...');
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 방법 1: 기본 재발송 시도
      let { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
      });

      if (resendError) {
        console.log('기본 재발송 실패:', resendError.message);
        
        // 방법 2: 새로운 회원가입으로 재발송 시도
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: resendEmail,
          password: 'tempPassword123', // 임시 비밀번호
          options: {
            data: {
              name: '이메일 재발송 요청',
            },
            emailRedirectTo: 'http://localhost:3000/auth/callback',
          },
        });

        if (signupError) {
          console.log('새로운 회원가입 실패:', signupError.message);
          
          if (signupError.message.includes('User already registered')) {
            // 방법 3: 비밀번호 재설정 이메일로 우회
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(resendEmail, {
              redirectTo: 'http://localhost:3000/auth/callback',
            });

            if (resetError) {
              setResendStatus(`재발송 실패: ${resetError.message}`);
            } else {
              setResendStatus('✅ 비밀번호 재설정 이메일이 발송되었습니다. 받은편지함을 확인해주세요.');
            }
          } else {
            setResendStatus(`재발송 실패: ${signupError.message}`);
          }
        } else {
          setResendStatus('✅ 새로운 회원가입 이메일이 발송되었습니다. 받은편지함을 확인해주세요.');
        }
      } else {
        setResendStatus('✅ 이메일이 재발송되었습니다. 받은편지함을 확인해주세요.');
      }
    } catch (err) {
      setResendStatus('이메일 재발송 중 오류가 발생했습니다.');
      console.error('재발송 오류:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button
              onClick={() => handleTabChange(!isLogin)}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} onInvalid={handleInvalid} noValidate>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    validationErrors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="이름을 입력하세요"
                />
                {validationErrors.name && (
                  <div className="text-red-600 dark:text-red-400 text-xs mt-1 px-3">
                    {validationErrors.name}
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="이메일을 입력하세요"
              />
              {validationErrors.email && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-1 px-3">
                  {validationErrors.email}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  validationErrors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="비밀번호를 입력하세요"
              />
              {validationErrors.password && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-1 px-3">
                  {validationErrors.password}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
            </button>
          </div>
        </form>

        {/* 이메일 재발송 섹션 */}
        {showResendEmail && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              이메일을 받지 못하셨나요?
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
              이미 등록된 이메일이라도 재발송이 가능합니다.
            </p>
            <div className="space-y-2">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="이메일 주소"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleResendEmail}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-md"
              >
                이메일 재발송
              </button>
              {resendStatus && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  {resendStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 