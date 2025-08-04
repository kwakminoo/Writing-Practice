"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      try {
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError(error.message);
        }
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('인증 시스템 초기화 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Login attempt for:', email);
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data.user?.email);
    } catch (err: any) {
      console.error('Login exception:', err);
      
      // Supabase 에러 코드에 따른 구체적인 메시지
      if (err.message) {
        if (err.message.includes('Invalid login credentials')) {
          // 보안상 구체적인 정보를 제공하지 않고 일반적인 메시지 표시
          setError('아이디 또는 비밀번호를 확인해주세요.');
        } else if (err.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
        } else if (err.message.includes('Too many requests')) {
          setError('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
        } else if (err.message.includes('Invalid email')) {
          setError('올바른 이메일 형식을 입력해주세요.');
        } else if (err.message.includes('User not found')) {
          setError('등록되지 않은 이메일입니다.');
        } else if (err.message.includes('Invalid password')) {
          setError('비밀번호가 올바르지 않습니다.');
        } else if (err.message.includes('Account not found')) {
          setError('계정을 찾을 수 없습니다.');
        } else if (err.message.includes('Signup disabled')) {
          setError('현재 로그인이 비활성화되어 있습니다.');
        } else if (err.message.includes('Email rate limit exceeded')) {
          setError('이메일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      clearError();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // 사용자 메타데이터에 이름 저장
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        // 더 구체적인 한국어 오류 메시지
        if (error.message.includes('User already registered')) {
          setError('이미 등록된 이메일입니다.');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setError('비밀번호는 최소 6자 이상이어야 합니다.');
        } else if (error.message.includes('Invalid email')) {
          setError('올바른 이메일 형식을 입력해주세요.');
        } else if (error.message.includes('Unable to validate email address')) {
          setError('이메일 주소를 확인할 수 없습니다. 올바른 이메일을 입력해주세요.');
        } else if (error.message.includes('Signup not allowed for this email')) {
          setError('이 이메일로는 회원가입이 허용되지 않습니다.');
        } else if (error.message.includes('Signup disabled')) {
          setError('현재 회원가입이 비활성화되어 있습니다.');
        } else if (error.message.includes('Too many requests')) {
          setError('너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('Email rate limit exceeded')) {
          setError('이메일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        } else if (error.message.includes('Password is too weak')) {
          setError('비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.');
        } else if (error.message.includes('Email already confirmed')) {
          setError('이미 인증된 이메일입니다.');
        } else if (error.message.includes('Email change not allowed')) {
          setError('이메일 변경이 허용되지 않습니다.');
        } else {
          setError('회원가입에 실패했습니다. 다시 시도해주세요.');
        }
        return;
      }

      if (data.user && data.session) {
        // 이메일 확인 없이 바로 로그인 성공
        setUser(data.user as any);
        console.log('회원가입 및 로그인 성공:', data.user);
      } else if (data.user && !data.session) {
        // 이메일 확인 필요
        console.log('이메일 확인이 필요합니다:', data.user);
        setError('이메일을 확인해주세요. 확인 링크를 이메일로 보냈습니다.');
      }
    } catch (err) {
      console.error('Signup exception:', err);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || '로그아웃에 실패했습니다.');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // 사용자 정보 가져오기
  const getUserInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('User info fetch error:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('User info fetch exception:', err);
      return null;
    }
  };

  // 사용자 정보 업데이트
  const updateUserInfo = async (userId: string, updates: { name?: string; avatar_url?: string; bio?: string }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('User info update error:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('User info update exception:', err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    getUserInfo,
    updateUserInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 