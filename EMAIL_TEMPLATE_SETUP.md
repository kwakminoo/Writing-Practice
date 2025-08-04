# 📧 Supabase 이메일 템플릿 설정 가이드

## 🎯 목표
- 이메일 제목: "글쓰기 훈련소"로 변경
- 이메일 내용: 환영 메시지와 응원
- 버튼 텍스트: "글쓰기 시작하기!"로 변경

## 📋 설정 단계

### 1. Supabase 대시보드 접속
1. [Supabase](https://supabase.com)에 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Authentication** 클릭
4. **Settings** 탭 클릭
5. **Email Templates** 섹션으로 스크롤

### 2. Confirm signup 템플릿 수정

#### 📧 이메일 제목 설정:
```
글쓰기 훈련소 - 이메일 인증
```

#### 📝 이메일 내용 (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>글쓰기 훈련소 - 이메일 인증</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }
    .header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .highlight {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #007bff;
    }
    .highlight h3 {
      color: #2c3e50;
      margin-top: 0;
    }
    .highlight ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .highlight li {
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #0056b3;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✍️ 글쓰기 훈련소</h1>
      <p>당신의 글쓰기 여정을 시작하세요</p>
    </div>
    <div class="content">
      <h2>안녕하세요! 글쓰기 훈련소에 오신 것을 환영합니다! 🎉</h2>
      <p>글쓰기 훈련소에 가입해주셔서 정말 감사합니다. 이제 당신의 글쓰기 여정이 시작됩니다!</p>
      <div class="highlight">
        <h3>📚 글쓰기 훈련소에서 할 수 있는 것들:</h3>
        <ul>
          <li>소설, 시, 에세이, 시나리오 등 다양한 장르 연습</li>
          <li>AI 기반 맞춤형 글쓰기 피드백</li>
          <li>체계적인 글쓰기 훈련 프로그램</li>
          <li>다양한 글쓰기 도전과제</li>
        </ul>
      </div>
      <p>앞으로 많은 멋진 글들을 써나가시길 바랍니다. 당신의 창작 여정을 응원합니다! ✨</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">글쓰기 시작하기! 🚀</a>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        이 버튼을 클릭하면 이메일 인증이 완료되고 글쓰기 훈련소에 로그인됩니다.
      </p>
    </div>
    <div class="footer">
      <p>글쓰기 훈련소 - 당신의 창작 여정을 함께합니다</p>
      <p>© 2024 글쓰기 훈련소. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

#### 📝 이메일 내용 (Plain Text):
```
안녕하세요! 글쓰기 훈련소에 오신 것을 환영합니다! 🎉

글쓰기 훈련소에 가입해주셔서 정말 감사합니다. 이제 당신의 글쓰기 여정이 시작됩니다!

📚 글쓰기 훈련소에서 할 수 있는 것들:
• 소설, 시, 에세이, 시나리오 등 다양한 장르 연습
• AI 기반 맞춤형 글쓰기 피드백
• 체계적인 글쓰기 훈련 프로그램
• 다양한 글쓰기 도전과제

앞으로 많은 멋진 글들을 써나가시길 바랍니다. 당신의 창작 여정을 응원합니다! ✨

글쓰기 시작하기! 🚀
{{ .ConfirmationURL }}

이 링크를 클릭하면 이메일 인증이 완료되고 글쓰기 훈련소에 로그인됩니다.

---
글쓰기 훈련소 - 당신의 창작 여정을 함께합니다
© 2024 글쓰기 훈련소. All rights reserved.
```

### 3. Recovery 템플릿 수정 (선택사항)

#### 📧 이메일 제목:
```
글쓰기 훈련소 - 비밀번호 재설정
```

#### 📝 이메일 내용 (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>글쓰기 훈련소 - 비밀번호 재설정</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }
    .header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #dc3545;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #c82333;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✍️ 글쓰기 훈련소</h1>
      <p>비밀번호 재설정</p>
    </div>
    <div class="content">
      <h2>비밀번호 재설정 요청</h2>
      <p>안녕하세요! 글쓰기 훈련소에서 비밀번호 재설정을 요청하셨습니다.</p>
      <p>아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">비밀번호 재설정하기</a>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        이 요청을 하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
      </p>
    </div>
    <div class="footer">
      <p>글쓰기 훈련소 - 당신의 창작 여정을 함께합니다</p>
      <p>© 2024 글쓰기 훈련소. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 4. Magic Link 템플릿 수정 (선택사항)

#### 📧 이메일 제목:
```
글쓰기 훈련소 - 로그인 링크
```

#### 📝 이메일 내용 (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>글쓰기 훈련소 - 로그인 링크</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }
    .header h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background-color: #28a745;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #218838;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✍️ 글쓰기 훈련소</h1>
      <p>로그인 링크</p>
    </div>
    <div class="content">
      <h2>로그인 링크</h2>
      <p>안녕하세요! 글쓰기 훈련소에서 로그인을 요청하셨습니다.</p>
      <p>아래 버튼을 클릭하여 로그인해주세요.</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">로그인하기</a>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        이 요청을 하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
      </p>
    </div>
    <div class="footer">
      <p>글쓰기 훈련소 - 당신의 창작 여정을 함께합니다</p>
      <p>© 2024 글쓰기 훈련소. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## ✅ 설정 완료 후 확인사항

1. **새로운 계정으로 회원가입** 테스트
2. **이메일 제목**이 "글쓰기 훈련소 - 이메일 인증"으로 표시되는지 확인
3. **이메일 내용**이 커스터마이징된 내용으로 표시되는지 확인
4. **버튼 텍스트**가 "글쓰기 시작하기! 🚀"로 표시되는지 확인
5. **이메일 확인 링크**를 클릭했을 때 정상적으로 로그인되는지 확인

## 🔧 문제 해결

### 이메일이 오지 않는 경우:
1. **스팸함 확인**
2. **Supabase 대시보드 → Logs → Auth**에서 이메일 발송 로그 확인
3. **Authentication → Settings → Email Auth**에서 이메일 설정 확인

### 이메일 확인 링크가 작동하지 않는 경우:
1. **Authentication → Settings → URL Configuration**에서 Site URL 확인
2. **Redirect URLs**에 `http://localhost:3000/auth/callback` 추가 (개발용)
3. **Production URL** 설정 (배포 시)

## 📝 참고사항

- 이메일 템플릿은 **HTML**과 **Plain Text** 두 가지 버전을 모두 설정해야 합니다
- `{{ .ConfirmationURL }}`은 Supabase에서 자동으로 실제 링크로 치환됩니다
- 이메일 템플릿 변경 후 즉시 적용됩니다 