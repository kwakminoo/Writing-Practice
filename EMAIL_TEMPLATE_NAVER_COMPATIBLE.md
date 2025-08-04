# 📧 네이버 메일 호환 이메일 템플릿

## 🎯 네이버 메일 호환을 위한 수정사항

### 1. Supabase 대시보드에서 설정
- **Authentication** → **Settings** → **Email Auth** → **Email Templates**
- **Confirmation** 템플릿 선택

### 2. Subject (제목)
```
글쓰기 훈련소 - 이메일 확인
```

### 3. HTML Body (네이버 메일 호환)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>글쓰기 훈련소 - 이메일 확인</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- 헤더 -->
                    <tr>
                        <td align="center" style="padding: 30px 30px 20px 30px;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #2563eb;">✍️ 글쓰기 훈련소</h1>
                            <p style="margin: 10px 0 0 0; font-size: 18px; color: #374151;">환영합니다! 🎉</p>
                        </td>
                    </tr>
                    
                    <!-- 내용 -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                                안녕하세요! <strong style="color: #2563eb;">{{ .UserMetadata.name }}</strong>님
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                                글쓰기 훈련소에 가입해주셔서 정말 감사합니다! 🙏
                            </p>
                            
                            <!-- 응원 섹션 -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-left: 4px solid #2563eb; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #2563eb;">💡 앞으로 많은 글을 쓰시면서</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 창의적인 아이디어를 펼쳐보세요</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 자신만의 스타일을 만들어보세요</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 글쓰기의 즐거움을 발견해보세요</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0; font-size: 16px; color: #333;">
                                이메일 주소를 확인하시면 바로 글쓰기를 시작하실 수 있습니다!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- 버튼 -->
                    <tr>
                        <td align="center" style="padding: 20px 30px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color: #2563eb; border-radius: 8px;">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 15px 30px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            🚀 글쓰기 시작하기!
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- 푸터 -->
                    <tr>
                        <td align="center" style="padding: 20px 30px 30px 30px;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">이 링크는 24시간 동안 유효합니다.</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">문의사항이 있으시면 언제든 연락해주세요.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

### 4. Plain Text Body (텍스트 버전)
```
✍️ 글쓰기 훈련소 - 환영합니다! 🎉

안녕하세요! {{ .UserMetadata.name }}님

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

## 🔧 주요 변경사항:

### 1. **사용자 이름 표시 변경**
- 기존: `{{ .Email }}` → 변경: `{{ .UserMetadata.name }}`
- 회원가입 시 입력한 이름으로 표시

### 2. **HTML과 Plain Text 모두 수정**
- 두 버전 모두 사용자 이름으로 변경
- 일관성 유지

### 3. **테스트 방법**
1. Supabase에서 템플릿 저장
2. 기존 계정 삭제
3. 새로운 회원가입 (이름 입력)
4. 이메일에서 확인

## ✅ 완료 후 확인사항:
- 이메일에서 "안녕하세요! [사용자이름]님" 표시
- 회원가입 시 입력한 이름으로 표시
- 네이버 메일에서도 정상 작동

설정이 완료되면 다시 테스트해보세요! 🚀 