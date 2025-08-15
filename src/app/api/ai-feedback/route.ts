import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드용 Supabase 클라이언트 (service_role 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key exists:', !!supabaseServiceKey);

// 일반 클라이언트 사용 (RLS 비활성화 상태)
const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    console.log('=== AI 피드백 API 호출 시작 ===');
    
    const { content, category, practiceType } = await req.json();
    console.log('받은 데이터:', { content: content?.length, category, practiceType });
    if (!content || typeof content !== 'string') {
      console.error('Invalid content provided:', { content, category, practiceType });
      return NextResponse.json({ error: 'Invalid content provided' }, { status: 400 });
    }

    console.log('Content length:', content.length);
    console.log('Category:', category);
    console.log('Practice type:', practiceType);

    // 사용자 인증 확인
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // AI 피드백 서비스 가격 (고정값)
    const requiredCoins = 10;

    // 현재 코인 잔액 확인 (users 테이블의 coins 컬럼)
    console.log('사용자 코인 잔액 조회 시작...');
    console.log('사용자 ID:', user.id);
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    console.log('코인 조회 결과:', { userData, userError });

    if (userError) {
      console.error('사용자 코인 잔액 조회 오류:', userError);
      return NextResponse.json({ error: 'Failed to fetch user coin balance' }, { status: 500 });
    }

    const currentCoins = userData?.coins || 0;
    console.log('Current coins:', currentCoins);
    
    // 코인 부족 확인
    if (currentCoins < requiredCoins) {
      console.log('Insufficient coins:', { currentCoins, requiredCoins });
      return NextResponse.json({ 
        error: 'Insufficient coins',
        currentBalance: currentCoins,
        requiredAmount: requiredCoins,
        message: 'AI 피드백을 받기 위해서는 10코인이 필요합니다. 코인을 충전해주세요.'
      }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('OpenAI API 키 존재:', !!apiKey);
    console.log('OpenAI API 키 길이:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.error('OpenAI API key not set');
      return NextResponse.json({ error: 'API Key not set' }, { status: 500 });
    }

    const starRatingGuide = `
**1. 별점 평가**
아래 5가지 항목에 대해 각각 5점 만점(★☆☆☆☆ ~ ★★★★★)으로 별점을 매기고, Markdown 표 형식으로 제시해주세요:

| 항목 | 별점 | 한 줄 평가 |
| --- | --- | --- |
| 문장력과 묘사력 | ★★★☆☆ | ... |
| 흐름과 개연성 | ★★★☆☆ | ... |
| 몰입감과 주제 전달 | ★★★☆☆ | ... |
| 창의성과 독창성 | ★★★☆☆ | ... |
| 전체적 완성도 | ★★★☆☆ | ... |

**2. 감상 요약**
글의 전체적인 인상과 느낌을 간단히 요약해주세요.

**3. 좋았던 점**
글에서 특히 잘된 부분들을 구체적으로 언급해주세요.

**4. 개선이 가능한 부분**
더 나아질 수 있는 부분들을 구체적으로 제시해주세요.

**5. 추천 포인트/다음 제안**
앞으로의 글쓰기에 도움이 될 만한 조언이나 제안을 해주세요.

**6. 기술적 피드백 (선택)**
필요한 경우 문법, 표현, 구조 등에 대한 구체적인 기술적 조언을 추가해주세요.

- 평균 점수에 따라 글 수준을 분류해주세요:
  - 4.5점 이상: 매우 뛰어난 글
  - 3.5~4.4점: 잘 쓴 글
  - 2.5~3.4점: 평범한 글
  - 2.4점 이하: 부족한 글
`;

    const prompt = `다음 글을 분석하여 한국어로 상세한 피드백을 제공해주세요.

${starRatingGuide}

**분석할 글:**
${content}

**중요**: 반드시 위의 6개 항목을 모두 포함하여 작성해주세요. 각 항목은 명확히 구분하고, 누락하지 마세요.

**응답 형식 (반드시 이 순서로 작성):**
## 1. 별점 평가
(표 형식으로 작성)

## 2. 감상 요약
(글의 전체적인 인상과 느낌 요약)

## 3. 좋았던 점
(글에서 발견한 장점과 긍정적인 요소들)

## 4. 개선이 가능한 부분
(글의 부족한 점이나 개선할 수 있는 부분들)

## 5. 추천 포인트/다음 제안
(향후 발전 방향이나 추천 사항)

## 6. 기술적 피드백
(기술적 측면에서 개선할 수 있는 부분)`;

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 글쓰기 전문가입니다. 한국어로 친절하고 구체적인 피드백을 제공해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API 오류:', errorData);
      return NextResponse.json({ error: 'AI 피드백 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const feedback = data.choices[0]?.message?.content || '피드백을 생성할 수 없습니다.';
    
    console.log('Feedback generated, length:', feedback.length);

    // 코인 차감
    console.log('Deducting coins...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: currentCoins - requiredCoins })
      .eq('id', user.id);

    if (updateError) {
      console.error('코인 차감 오류:', updateError);
      return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
    }

    console.log('Coins deducted successfully');

    // AI 피드백 저장
    console.log('Saving feedback...');
    const { error: feedbackError } = await supabase
      .from('ai_feedbacks')
      .insert({
        user_id: user.id,
        writing_id: null, // 자유 글쓰기이므로 null
        feedback_content: feedback,
        rating: null // 별점 정보는 피드백 내용에 포함됨
      });

    if (feedbackError) {
      console.error('피드백 저장 오류:', feedbackError);
      // 피드백 저장 실패해도 사용자에게는 피드백 제공
    }

    console.log('AI 피드백 API 완료');
    return NextResponse.json({
      feedback,
      usedCoins: requiredCoins,
      remainingCoins: currentCoins - requiredCoins
    });

  } catch (error) {
    console.error('AI 피드백 생성 중 오류:', error);
    return NextResponse.json({ 
      error: 'AI 서버 요청 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 