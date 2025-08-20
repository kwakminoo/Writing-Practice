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
**별점 평가 기준 (5개 항목, 각 1-5점)**

**평가 기준:**
- ★☆☆☆☆ (1점): 심각한 문제가 있음, 기본적인 수준에도 미달
- ★★☆☆☆ (2점): 부족함, 개선이 많이 필요함
- ★★★☆☆ (3점): 보통, 평균적인 수준
- ★★★★☆ (4점): 좋음, 평균 이상의 수준
- ★★★★★ (5점): 뛰어남, 전문가 수준

**각 항목별 세부 기준:**

**문장력과 묘사력**
- 1점: 문법 오류가 많고, 묘사가 거의 없음
- 2점: 기본적인 문법은 맞지만, 묘사가 부족하고 단조로움
- 3점: 문법이 대체로 정확하고, 적절한 묘사가 있음
- 4점: 문장이 유려하고, 생생한 묘사가 있음
- 5점: 문장이 아름답고, 독창적이고 감동적인 묘사가 있음

**흐름과 개연성**
- 1점: 이야기 흐름이 없고, 논리적 연결이 전혀 없음
- 2점: 흐름이 어색하고, 개연성이 부족함
- 3점: 기본적인 흐름이 있고, 대체로 개연적임
- 4점: 자연스러운 흐름과 설득력 있는 개연성
- 5점: 완벽한 흐름과 탄탄한 개연성

**몰입감과 주제 전달**
- 1점: 전혀 몰입되지 않고, 주제가 불분명함
- 2점: 몰입감이 부족하고, 주제 전달이 약함
- 3점: 어느 정도 몰입되고, 주제가 명확함
- 4점: 높은 몰입감과 효과적인 주제 전달
- 5점: 완전한 몰입과 깊이 있는 주제 전달

**창의성과 독창성**
- 1점: 모방 수준, 독창성이 전혀 없음
- 2점: 일반적인 표현, 독창성이 부족함
- 3점: 적절한 창의성과 어느 정도의 독창성
- 4점: 높은 창의성과 독창적인 표현
- 5점: 탁월한 창의성과 완전히 독창적인 접근

**전체적 완성도**
- 1점: 미완성 수준, 전체적으로 부족함
- 2점: 기본적인 완성도, 개선이 많이 필요함
- 3점: 적절한 완성도, 평균적인 수준
- 4점: 높은 완성도, 잘 다듬어진 글
- 5점: 완벽한 완성도, 출판 가능한 수준

**평가 원칙:**
- 객관적으로 글의 실제 수준을 평가하세요
- 너무 관대하거나 엄격하지 말고 정직하게 평가하세요
- 각 항목별로 구체적인 기준에 따라 점수를 매기세요
- 평균적으로 3점이 '보통' 수준임을 기억하세요

**응답 형식:**
| 항목 | 별점 | 한 줄 평가 |
| --- | --- | --- |
| 문장력과 묘사력 | ★★★☆☆ | ... |
| 흐름과 개연성 | ★★★☆☆ | ... |
| 몰입감과 주제 전달 | ★★★☆☆ | ... |
| 창의성과 독창성 | ★★★☆☆ | ... |
| 전체적 완성도 | ★★★☆☆ | ... |

**평균 별점과 등급:**
- 4.5~5.0: 뛰어남 (전문가 수준)
- 3.5~4.4: 좋음 (평균 이상)
- 2.5~3.4: 보통 (평균 수준)
- 1.0~2.4: 부족 (개선 필요)`

    const prompt = `당신은 소설 창작 평가 전문가입니다. 지금부터 사용자가 작성한 단편소설을 읽고, 아래 순서와 기준에 따라 평가해 주세요. 답변은 반드시 지정된 순서를 지켜 주세요.

${starRatingGuide}

**규칙:**
- 중복 내용 금지, 라벨 없이 자연스럽게 작성
- 개선안은 문제 설명 → 원문 인용 → 개선 방향 순으로

**분석할 글:**
${content}

**응답 형식:**

## 별점 평가
(위 표 형식)

## 감상 
(글의 전체적인 인상과 주제, 분위기를 간단히 요약하고 감상을 말한다. 200자 내외)

## 좋았던 점
(문장력, 묘사력, 캐릭터, 몰입감, 전개, 대사 등 글에서 뛰어난 점들을 구체적으로 짚는다., 1~3개.)

## 개선이 가능한 부분
(부족하거나 아쉬운 부분을 구체적으로 제시한다. 만약 특별히 개선할 부분이 없다면 "훌륭한 글이며 개선점이 특별히 없다" 등의 뉘앙스로 말한다. 혹은 "개선점이 보이지만, 이는 스타일 차이에 가깝다"라는 식으로 언급한다., 1~3개, 개선 예시 포함)

## 글 스타일 분석
(글의 톤, 문체, 장르적 특징, 글쓴이의 개성이 드러나는 부분을 정리한다.)

## 코멘트
(글쓴이에게 따뜻하고 격려하는 말로 마무리한다 메시지 1-2문장)`;

    const isStream = req.nextUrl.searchParams.get('stream') === '1';

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // 더 빠른 모델 사용 (gpt-4o 대신)
    const makeChatBody = (isStream: boolean, promptText: string) => {
      const base: any = {
        model,
        messages: [
          { role: 'system', content: '당신은 글쓰기 전문가입니다. 한국어로 친절하고 구체적인 피드백을 제공해주세요.' },
          { role: 'user', content: promptText },
        ],
        temperature: 0.5, // 더 낮은 temperature로 일관성 향상
      };
      if (isStream) base.stream = true;
      if (model.startsWith('gpt-5')) {
        base.max_completion_tokens = 2500; // 토큰 수 줄임
      } else {
        base.max_tokens = 2500; // 토큰 수 줄임
      }
      return base;
    };
    if (isStream) {
      // 스트리밍 모드: 코인을 선차감하여 즉시 반영되도록 처리
      console.log('Streaming mode enabled. Deducting coins before streaming...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ coins: currentCoins - requiredCoins })
        .eq('id', user.id);

      if (updateError) {
        console.error('코인 차감 오류:', updateError);
        return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
      }

      const encoder = new TextEncoder();
      let accumulated = '';

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(makeChatBody(true, prompt)),
      });

      if (!openAiRes.ok || !openAiRes.body) {
        console.error('OpenAI stream failed:', openAiRes.status);
        return NextResponse.json({ error: 'AI 스트리밍 시작에 실패했습니다.' }, { status: 500 });
      }

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const reader = openAiRes.body!.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              // OpenAI는 SSE 형식으로 data: ...\n\n 이벤트를 보냄
              const parts = buffer.split('\n\n');
              buffer = parts.pop() || '';
              for (const part of parts) {
                if (!part.startsWith('data:')) continue;
                const data = part.replace(/^data:\s*/, '').trim();
                if (data === '[DONE]') continue;
                try {
                  const json = JSON.parse(data);
                  const token = json.choices?.[0]?.delta?.content;
                  if (token) {
                    accumulated += token;
                    controller.enqueue(encoder.encode(token));
                  }
                } catch (e) {
                  // JSON 파싱 실패는 무시
                }
              }
            }
          } catch (err) {
            console.error('Stream read error:', err);
          } finally {
            controller.close();
          }
        }
      });

      // 스트림 종료 후 비동기로 피드백 저장 (대기하지 않음)
      stream.pipeTo(new WritableStream({
        close: async () => {
          try {
            if (accumulated.trim().length > 0) {
              const { error: feedbackError } = await supabase
                .from('ai_feedbacks')
                .insert({
                  user_id: user.id,
                  writing_id: null,
                  feedback_content: accumulated,
                  rating: null,
                });
              if (feedbackError) {
                console.error('피드백 저장 오류 (stream):', feedbackError);
              }
            }
          } catch (e) {
            console.error('피드백 저장 중 예외 (stream):', e);
          }
        }
      })).catch(() => {
        // 파이프 도중 에러는 로그만 남김
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // 기본(비스트리밍) 경로 유지
    console.log('Calling OpenAI API (non-stream)...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makeChatBody(false, prompt)),
    });

    console.log('OpenAI response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API 오류:', errorData);
      return NextResponse.json({ error: 'AI 피드백 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const feedback = data.choices[0]?.message?.content || '피드백을 생성할 수 없습니다.';

    // 섹션 분리(서버 사이드) – 클라이언트 파싱 실패 대비용
    const splitSections = (md: string) => {
      try {
        const isTechTitle = (title: string) => /기술적\s*피드백|기술\s*피드백|테크니컬|technical|문법|표현|구조/i.test(title);
        const isCommentTitle = (title: string) => /코멘트|comment|코치|응원|격려|한줄\s*코멘트|한마디/i.test(title);
        const regex = /(^|\n)(#{1,6})\s*([^\n]+?)\s*(\r?\n)/g;
        const positions: Array<{ idx: number; title: string }> = [];
        let m: RegExpExecArray | null;
        while ((m = regex.exec(md)) !== null) {
          const start = m.index + (m[1] ? m[1].length : 0);
          const title = m[3].trim();
          positions.push({ idx: start, title });
        }
        if (positions.length === 0) return { main: md, technical: '', comment: '' };
        const chunks: Array<{ title: string; content: string }> = [];
        for (let i = 0; i < positions.length; i++) {
          const start = positions[i].idx;
          const end = i + 1 < positions.length ? positions[i + 1].idx : md.length;
          const headingEnd = md.indexOf('\n', start);
          const title = md.slice(start, headingEnd).replace(/^#{1,6}\s*/, '').trim();
          const content = ("## " + title + "\n\n" + md.slice(headingEnd + 1, end)).trim();
          chunks.push({ title, content });
        }
        const tech = chunks.find(c => isTechTitle(c.title))?.content || '';
        const comment = chunks.find(c => isCommentTitle(c.title))?.content || '';
        const main = chunks.filter(c => !isTechTitle(c.title) && !isCommentTitle(c.title))
                           .map(c => c.content).join('\n\n').trim();
        return { main: main || md, technical: tech, comment };
      } catch {
        return { main: md, technical: '', comment: '' };
      }
    };
    const sections = splitSections(feedback);
    console.log('Feedback generated, length:', feedback.length);

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
    console.log('Saving feedback...');
    const { error: feedbackError } = await supabase
      .from('ai_feedbacks')
      .insert({
        user_id: user.id,
        writing_id: null,
        feedback_content: feedback,
        rating: null
      });

    if (feedbackError) {
      console.error('피드백 저장 오류:', feedbackError);
    }

    console.log('AI 피드백 API 완료');
    return NextResponse.json({
      feedback,
      sections,
      usedCoins: requiredCoins,
      remainingCoins: currentCoins - requiredCoins
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('AI 피드백 생성 중 오류:', error);
    return NextResponse.json({ 
      error: 'AI 서버 요청 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 