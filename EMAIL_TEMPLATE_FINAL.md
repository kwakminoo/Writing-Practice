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

### 3. Reset Password Email 설정

#### Subject (제목):
```
글쓰기 훈련소 - 비밀번호 재설정
```

#### HTML Body (HTML 내용):
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>글쓰기 훈련소 - 비밀번호 재설정</title>
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
                            <p style="margin: 10px 0 0 0; font-size: 18px; color: #374151;">비밀번호 재설정 안내</p>
                        </td>
                    </tr>
                    
                    <!-- 내용 -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                                안녕하세요! <strong style="color: #2563eb;">{{ .UserMetadata.name }}</strong>님
                            </p>
                            
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                                글쓰기 훈련소에서 비밀번호 재설정 요청을 받았습니다.
                            </p>
                            
                            <!-- 보안 안내 섹션 -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-left: 4px solid #dc2626; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #dc2626;">🔒 보안 안내</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 본인이 요청하지 않았다면 이 이메일을 무시하세요</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 링크는 24시간 후 만료됩니다</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 안전한 환경에서 비밀번호를 변경하세요</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- 비밀번호 변경 팁 섹션 -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-left: 4px solid #2563eb; margin: 20px 0;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #2563eb;">💡 비밀번호 변경 후</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 안전한 비밀번호로 계정을 보호하세요</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 정기적으로 비밀번호를 변경하세요</p>
                                        <p style="margin: 5px 0; font-size: 14px; color: #333;">• 다른 사이트와 다른 비밀번호를 사용하세요</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0; font-size: 16px; color: #333;">
                                아래 버튼을 클릭하여 새 비밀번호를 설정하세요.
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
                                            🔐 새 비밀번호 설정하기
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

## ✅ 설정 완료 후 확인사항

1. **이메일 템플릿 저장** 후 테스트
2. **회원가입** 시 이메일 확인
3. **비밀번호 찾기** 시 이메일 확인
4. **모바일**에서도 이메일이 잘 보이는지 확인

## 🔧 문제 해결

- 이메일이 오지 않는 경우: **Spam 폴더** 확인
- 링크가 작동하지 않는 경우: **URL 인코딩** 확인
- 디자인이 깨지는 경우: **이메일 클라이언트** 호환성 확인 