# 글쓰기 훈련소

글쓰기 연습을 위한 웹 애플리케이션입니다. 다양한 글쓰기 모드와 AI 피드백 기능을 제공합니다.

## 기능

- 다양한 글쓰기 연습 모드 (소설, 시, 에세이, 시나리오 등)
- AI 기반 글쓰기 피드백
- 사용자 인증 시스템 (로그인/회원가입)
- 다크 모드 지원
- 반응형 디자인

## 환경 설정

### 1. Supabase 설정

이 프로젝트는 Supabase를 사용하여 사용자 인증을 처리합니다. 다음 단계를 따라 설정하세요:

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 API 키를 확인합니다.
3. 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Supabase SQL 편집기에서 `supabase-setup.sql` 파일의 내용을 실행하여 필요한 테이블과 정책을 생성합니다.

5. Supabase 대시보드에서 Authentication > Settings > Email Auth에서 이메일 확인을 활성화합니다.

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 사용법

1. **회원가입**: `/login` 페이지에서 새 계정을 만드세요.
2. **로그인**: 이메일과 비밀번호로 로그인하세요.
3. **글쓰기 연습**: 다양한 모드에서 글쓰기를 연습하세요.
4. **AI 피드백**: 작성한 글에 대한 AI 피드백을 받으세요.

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
