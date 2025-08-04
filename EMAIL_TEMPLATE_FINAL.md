# 📧 최종 이메일 템플릿 설정

## 🎯 Supabase 대시보드에서 설정 방법

### 1. 경로
- **Authentication** → **Settings** → **Email Auth** → **Email Templates**

### 2. Confirmation Email 설정

#### Subject (제목):
```
글쓰기 훈련소 - 이메일 확인
```

#### HTML Body (HTML 내용):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>글쓰기 훈련소 - 이메일 확인</title>
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
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .welcome-message {
            font-size: 18px;
            color: #374151;
            margin-bottom: 25px;
            text-align: center;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
        }
        .encouragement {
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .user-email {
            font-weight: bold;
            color: #2563eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✍️ 글쓰기 훈련소</div>
            <div class="welcome-message">환영합니다! 🎉</div>
        </div>
        
        <div class="content">
            <p>안녕하세요! <span class="user-email">{{ .Email }}</span>님</p>
            
            <p>글쓰기 훈련소에 가입해주셔서 정말 감사합니다! 🙏</p>
            
            <div class="encouragement">
                <p><strong>💡 앞으로 많은 글을 쓰시면서</strong></p>
                <p>• 창의적인 아이디어를 펼쳐보세요</p>
                <p>• 자신만의 스타일을 만들어보세요</p>
                <p>• 글쓰기의 즐거움을 발견해보세요</p>
            </div>
            
            <p>이메일 주소를 확인하시면 바로 글쓰기를 시작하실 수 있습니다!</p>
        </div>
        
        <div style="text-align: center;">
            <a href="{{ .ConfirmationURL }}" class="button">
                🚀 글쓰기 시작하기!
            </a>
        </div>
        
        <div class="footer">
            <p>이 링크는 24시간 동안 유효합니다.</p>
            <p>문의사항이 있으시면 언제든 연락해주세요.</p>
        </div>
    </div>
</body>
</html>
```

#### Plain Text Body (텍스트 버전):
```
✍️ 글쓰기 훈련소 - 환영합니다! 🎉

안녕하세요! {{ .Email }}님

글쓰기 훈련소에 가입해주셔서 정말 감사합니다! 🙏

💡 앞으로 많은 글을 쓰시면서
• 창의적인 아이디어를 펼쳐보세요
• 자신만의 스타일을 만들어보세요  
• 글쓰기의 즐거움을 발견해보세요

이메일 주소를 확인하시면 바로 글쓰기를 시작하실 수 있습니다!

🚀 글쓰기 시작하기!
{{ .ConfirmationURL }}

이 링크는 24시간 동안 유효합니다.
문의사항이 있으시면 언제든 연락해주세요.
```

### 3. 저장 및 테스트
1. **Save** 버튼 클릭
2. 기존 계정 삭제: **Authentication** → **Users** → `kwakmw12@naver.com` 삭제
3. 웹사이트에서 다시 회원가입
4. 새로운 이메일 확인

## ✅ 완료 후 확인사항:
- 이메일 제목: "글쓰기 훈련소 - 이메일 확인"
- 깔끔한 HTML 레이아웃
- "🚀 글쓰기 시작하기!" 버튼
- 환영 메시지와 응원 문구

설정이 완료되면 다시 테스트해보세요! 🚀 