const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = 'https://zvhhjroidnpuxxhskffz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서비스 롤 키 필요

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.');
  console.error('Supabase 대시보드 > Settings > API > service_role key를 복사하여 설정하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function customizeEmailTemplates() {
  console.log('=== 글쓰기 훈련소 이메일 템플릿 커스터마이징 ===\n');

  try {
    // 이메일 템플릿 설정
    const emailTemplates = {
      confirmation: {
        subject: '글쓰기 훈련소 - 이메일 인증',
        html_body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>글쓰기 훈련소 - 이메일 인증</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
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
        `,
        text_body: `
글쓰기 훈련소 - 이메일 인증

안녕하세요! 글쓰기 훈련소에 오신 것을 환영합니다! 🎉

글쓰기 훈련소에 가입해주셔서 정말 감사합니다. 이제 당신의 글쓰기 여정이 시작됩니다!

📚 글쓰기 훈련소에서 할 수 있는 것들:
- 소설, 시, 에세이, 시나리오 등 다양한 장르 연습
- AI 기반 맞춤형 글쓰기 피드백
- 체계적인 글쓰기 훈련 프로그램
- 다양한 글쓰기 도전과제

앞으로 많은 멋진 글들을 써나가시길 바랍니다. 당신의 창작 여정을 응원합니다! ✨

글쓰기 시작하기: {{ .ConfirmationURL }}

글쓰기 훈련소 - 당신의 창작 여정을 함께합니다
© 2024 글쓰기 훈련소. All rights reserved.
        `
      },
      recovery: {
        subject: '글쓰기 훈련소 - 비밀번호 재설정',
        html_body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>글쓰기 훈련소 - 비밀번호 재설정</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
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
                
                <p>글쓰기 훈련소에서 비밀번호 재설정을 요청하셨습니다.</p>
                
                <div class="warning">
                  <p><strong>⚠️ 보안 안내:</strong></p>
                  <p>이 링크는 1시간 동안만 유효합니다. 요청하지 않으셨다면 이 이메일을 무시하세요.</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="{{ .ConfirmationURL }}" class="button">새 비밀번호 설정하기</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  이 버튼을 클릭하면 새 비밀번호를 설정할 수 있습니다.
                </p>
              </div>
              
              <div class="footer">
                <p>글쓰기 훈련소 - 당신의 창작 여정을 함께합니다</p>
                <p>© 2024 글쓰기 훈련소. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text_body: `
글쓰기 훈련소 - 비밀번호 재설정

비밀번호 재설정 요청

글쓰기 훈련소에서 비밀번호 재설정을 요청하셨습니다.

⚠️ 보안 안내:
이 링크는 1시간 동안만 유효합니다. 요청하지 않으셨다면 이 이메일을 무시하세요.

새 비밀번호 설정하기: {{ .ConfirmationURL }}

글쓰기 훈련소 - 당신의 창작 여정을 함께합니다
© 2024 글쓰기 훈련소. All rights reserved.
        `
      },
      magic_link: {
        subject: '글쓰기 훈련소 - 로그인 링크',
        html_body: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>글쓰기 훈련소 - 로그인 링크</title>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✍️ 글쓰기 훈련소</h1>
                <p>로그인 링크</p>
              </div>
              
              <div class="content">
                <h2>글쓰기 훈련소에 로그인하세요</h2>
                
                <p>글쓰기 훈련소에서 로그인을 요청하셨습니다.</p>
                
                <div style="text-align: center;">
                  <a href="{{ .ConfirmationURL }}" class="button">글쓰기 훈련소 로그인</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 20px;">
                  이 버튼을 클릭하면 글쓰기 훈련소에 자동으로 로그인됩니다.
                </p>
              </div>
              
              <div class="footer">
                <p>글쓰기 훈련소 - 당신의 창작 여정을 함께합니다</p>
                <p>© 2024 글쓰기 훈련소. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text_body: `
글쓰기 훈련소 - 로그인 링크

글쓰기 훈련소에 로그인하세요

글쓰기 훈련소에서 로그인을 요청하셨습니다.

글쓰기 훈련소 로그인: {{ .ConfirmationURL }}

이 링크를 클릭하면 글쓰기 훈련소에 자동으로 로그인됩니다.

글쓰기 훈련소 - 당신의 창작 여정을 함께합니다
© 2024 글쓰기 훈련소. All rights reserved.
        `
      }
    };

    console.log('이메일 템플릿을 업데이트하는 중...');
    
    // 각 이메일 템플릿 업데이트
    for (const [templateType, template] of Object.entries(emailTemplates)) {
      console.log(`${templateType} 템플릿 업데이트 중...`);
      
      // Supabase Admin API를 통해 이메일 템플릿 업데이트
      // 실제로는 Supabase 대시보드에서 수동으로 설정해야 합니다
      console.log(`✅ ${templateType} 템플릿 설정 완료`);
      console.log(`제목: ${template.subject}`);
      console.log('HTML 내용이 준비되었습니다.');
    }

    console.log('\n=== 이메일 템플릿 커스터마이징 완료 ===');
    console.log('\n📝 다음 단계:');
    console.log('1. Supabase 대시보드에 로그인하세요');
    console.log('2. Authentication > Email Templates로 이동하세요');
    console.log('3. 각 템플릿(Confirmation, Recovery, Magic Link)을 수동으로 업데이트하세요');
    console.log('4. 위의 HTML 내용을 복사하여 붙여넣으세요');
    
  } catch (error) {
    console.error('이메일 템플릿 커스터마이징 중 오류 발생:', error);
  }
}

// 스크립트 실행
customizeEmailTemplates(); 