const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zvhhjroidnpuxxhskffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2aGhqcm9pZG5wdXh4aHNrZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDgyNDksImV4cCI6MjA2ODMyNDI0OX0.29sSyISNUcFAUPiZEe96lsJg1kTLwciQUUGQu0s0hYg'
);

async function createUsersTable() {
  console.log('=== Users 테이블 생성 ===\n');

  try {
    // 1. 사용자 테이블 생성
    console.log('1. Users 테이블 생성 중...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name TEXT,
          avatar_url TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (createError) {
      console.error('테이블 생성 오류:', createError);
      console.log('\n⚠️ 수동으로 Supabase 대시보드에서 SQL을 실행해야 합니다.');
      console.log('Supabase 대시보드 → SQL Editor에서 다음 SQL을 실행하세요:');
      console.log(`
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name TEXT,
          avatar_url TEXT,
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      return;
    }

    console.log('✅ Users 테이블이 생성되었습니다.');

    // 2. RLS 정책 설정
    console.log('\n2. RLS 정책 설정 중...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own user info" ON public.users
          FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own user info" ON public.users
          FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert own user info" ON public.users
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    });

    if (rlsError) {
      console.error('RLS 정책 설정 오류:', rlsError);
      console.log('\n⚠️ 수동으로 RLS 정책을 설정해야 합니다.');
    } else {
      console.log('✅ RLS 정책이 설정되었습니다.');
    }

    // 3. 자동 생성 함수 및 트리거
    console.log('\n3. 자동 생성 함수 및 트리거 설정 중...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.users (id, name)
          VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    if (triggerError) {
      console.error('트리거 설정 오류:', triggerError);
      console.log('\n⚠️ 수동으로 트리거를 설정해야 합니다.');
    } else {
      console.log('✅ 자동 생성 트리거가 설정되었습니다.');
    }

    console.log('\n=== 설정 완료 ===');
    console.log('이제 회원가입 시 자동으로 사용자 정보가 생성됩니다.');

  } catch (error) {
    console.error('테이블 생성 중 오류 발생:', error);
    console.log('\n📝 수동 설정 가이드:');
    console.log('1. Supabase 대시보드에 로그인');
    console.log('2. SQL Editor로 이동');
    console.log('3. supabase-setup.sql 파일의 내용을 복사하여 실행');
  }
}

// 스크립트 실행
createUsersTable(); 