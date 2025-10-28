# Vercel 배포 가이드

## 🚀 배포 방법

### Vercel 웹사이트로 배포 (추천)

1. **Vercel 배포**
   - https://vercel.com 접속
   - "Continue with GitHub" 클릭하여 로그인
   - "Add New Project" 클릭
   - `kwakminoo/Writing-Practice` 저장소 선택 및 Import
   - 브랜치: `vercel-deployment` 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js (자동 감지됨)
     - Root Directory: `./` (기본값)
     - Build Command: `npm run build` (자동 설정됨)
     - Output Directory: `.next` (자동 설정됨)

2. **환경 변수 설정** (중요!)
   
   Vercel 대시보드에서 다음 환경 변수를 추가:
   
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://zvhhjroidnpuxxhskffz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
   - `OPENAI_API_KEY`: OpenAI API 키 (AI 피드백 기능용)

3. **배포 시작**
   - "Deploy" 버튼 클릭
   - 자동으로 빌드 및 배포 진행 (2-3분 소요)
   - 배포 완료 후 자동으로 도메인 생성됨 (예: your-project.vercel.app)

---

## 🔑 환경 변수 찾는 방법

### Supabase
1. https://supabase.com 로그인
2. 프로젝트 선택
3. Settings > API 메뉴
4. "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
5. "Project API keys" > "anon public" → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. "service_role" → `SUPABASE_SERVICE_ROLE_KEY` (주의: 비공개!)

### OpenAI
1. https://platform.openai.com 로그인
2. API keys 메뉴
3. "Create new secret key" 클릭
4. 생성된 키 복사 → `OPENAI_API_KEY`

---

## ✅ 배포 후 확인사항

- [ ] 웹사이트가 정상적으로 열리는가?
- [ ] 로그인/회원가입이 작동하는가?
- [ ] 글쓰기 연습 기능이 작동하는가?
- [ ] AI 피드백이 정상적으로 생성되는가?
- [ ] 사용자 데이터가 정상적으로 저장되는가?

---

## 🔧 트러블슈팅

### 빌드 에러 발생 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run typecheck

# 린트 체크
npm run lint
```

### 환경 변수 문제
- Vercel 대시보드 > Settings > Environment Variables 확인
- 변수명 철자 확인 (대소문자 구분)
- `NEXT_PUBLIC_` 접두사 확인 (클라이언트에서 사용하는 경우)

---

## 📊 무료 플랜 제한사항

Vercel 무료 플랜:
- ✅ 무제한 배포
- ✅ 자동 HTTPS
- ✅ 100GB 대역폭/월
- ✅ 6,000분 빌드 시간/월
- ⚠️ Serverless Functions: 100GB-시간/월
- ⚠️ Edge Middleware: 100만 요청/월

**참고**: AI 피드백 기능은 OpenAI API 사용량에 따라 별도 과금됩니다.

---

## 🔄 자동 배포 설정

GitHub 연동 시 자동 배포 활성화:
- `vercel-deployment` 브랜치에 푸시 → 자동 배포
- Pull Request 생성 → 미리보기 배포 자동 생성
- 커밋마다 배포 상태 GitHub에 표시

