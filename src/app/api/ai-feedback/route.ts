import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserCoinBalance, deductUserCoins } from '../../../lib/auth';
import { supabaseServer } from '../../../lib/supabaseClient';
import { getFictionPrompt, getFictionRatingCriteria, getFictionRatingDetails } from './fiction-prompts';
import { getScreenplayPrompt, getScreenplayRatingCriteria } from './screenplay-prompts';
import { getPoetryPrompt, getPoetryRatingCriteria } from './poetry-prompts';
import { getEssayPrompt, getEssayRatingCriteria } from './essay-prompts';

export async function POST(req: NextRequest) {
  try {
    const { content, category, practiceType, problemPrompt } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content provided' }, { status: 400 });
    }

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const user = authResult.user;
    const requiredCoins = 10;

    // 코인 잔액 확인
    const balanceResult = await getUserCoinBalance(user.id);
    if (!balanceResult.success) {
      return NextResponse.json({ error: balanceResult.error }, { status: 500 });
    }

    const currentCoins = balanceResult.balance!;
    if (currentCoins < requiredCoins) {
      return NextResponse.json({ 
        error: 'Insufficient coins',
        currentBalance: currentCoins,
        requiredAmount: requiredCoins,
        message: 'AI 피드백을 받기 위해서는 10코인이 필요합니다. 코인을 충전해주세요.'
      }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not set' }, { status: 500 });
    }

    // 파트별 별점 평가 기준 설정
    let ratingCriteria: string[] = [];
    let starRatingGuide = '';
    
    if (category === '소설') {
      ratingCriteria = getFictionRatingCriteria();
      const ratingDetails = getFictionRatingDetails() as Record<string, Record<string, string>>;
      
      starRatingGuide = `
**별점 평가 기준 (5개 항목, 각 1-5점)**

**평가 기준:**
- ★☆☆☆☆ (1점): 심각한 문제가 있음, 기본적인 수준에도 미달
- ★★☆☆☆ (2점): 부족함, 개선이 많이 필요함
- ★★★☆☆ (3점): 보통, 평균적인 수준
- ★★★★☆ (4점): 좋음, 평균 이상의 수준
- ★★★★★ (5점): 뛰어남, 전문가 수준

**각 항목별 세부 기준:**

**${ratingCriteria[0]}**
- 1점: ${ratingDetails[ratingCriteria[0]]['1점']}
- 2점: ${ratingDetails[ratingCriteria[0]]['2점']}
- 3점: ${ratingDetails[ratingCriteria[0]]['3점']}
- 4점: ${ratingDetails[ratingCriteria[0]]['4점']}
- 5점: ${ratingDetails[ratingCriteria[0]]['5점']}

**${ratingCriteria[1]}**
- 1점: ${ratingDetails[ratingCriteria[1]]['1점']}
- 2점: ${ratingDetails[ratingCriteria[1]]['2점']}
- 3점: ${ratingDetails[ratingCriteria[1]]['3점']}
- 4점: ${ratingDetails[ratingCriteria[1]]['4점']}
- 5점: ${ratingDetails[ratingCriteria[1]]['5점']}

**${ratingCriteria[2]}**
- 1점: ${ratingDetails[ratingCriteria[2]]['1점']}
- 2점: ${ratingDetails[ratingCriteria[2]]['2점']}
- 3점: ${ratingDetails[ratingCriteria[2]]['3점']}
- 4점: ${ratingDetails[ratingCriteria[2]]['4점']}
- 5점: ${ratingDetails[ratingCriteria[2]]['5점']}

**${ratingCriteria[3]}**
- 1점: ${ratingDetails[ratingCriteria[3]]['1점']}
- 2점: ${ratingDetails[ratingCriteria[3]]['2점']}
- 3점: ${ratingDetails[ratingCriteria[3]]['3점']}
- 4점: ${ratingDetails[ratingCriteria[3]]['4점']}
- 5점: ${ratingDetails[ratingCriteria[3]]['5점']}

**${ratingCriteria[4]}**
- 1점: ${ratingDetails[ratingCriteria[4]]['1점']}
- 2점: ${ratingDetails[ratingCriteria[4]]['2점']}
- 3점: ${ratingDetails[ratingCriteria[4]]['3점']}
- 4점: ${ratingDetails[ratingCriteria[4]]['4점']}
- 5점: ${ratingDetails[ratingCriteria[4]]['5점']}

**평가 원칙:**
- 객관적으로 글의 실제 수준을 평가하세요
- 너무 관대하거나 엄격하지 말고 정직하게 평가하세요
- 각 항목별로 구체적인 기준에 따라 점수를 매기세요
- 평균적으로 3점이 '보통' 수준임을 기억하세요

**응답 형식:**
| 항목 | 별점 | 한 줄 평가 |
| --- | --- | --- |
| ${ratingCriteria[0]} | ★★★☆☆ | ... |
| ${ratingCriteria[1]} | ★★★☆☆ | ... |
| ${ratingCriteria[2]} | ★★★☆☆ | ... |
| ${ratingCriteria[3]} | ★★★☆☆ | ... |
| ${ratingCriteria[4]} | ★★★☆☆ | ... |

**평균 별점과 등급:**
- 4.5~5.0: 뛰어남 (전문가 수준)
- 3.5~4.4: 좋음 (평균 이상)
- 2.5~3.4: 보통 (평균 수준)
- 1.0~2.4: 부족 (개선 필요)`;
    } else if (category === '시나리오') {
      ratingCriteria = getScreenplayRatingCriteria();
    } else if (category === '시') {
      ratingCriteria = getPoetryRatingCriteria();
    } else if (category === '에세이') {
      ratingCriteria = getEssayRatingCriteria();
    } else {
      // 기본값 (소설 기준)
      ratingCriteria = getFictionRatingCriteria();
    }

    // 소설이 아닌 경우 기본 별점 가이드 사용
    if (category !== '소설') {
      starRatingGuide = `
**별점 평가 기준 (5개 항목, 각 1-5점)**

**평가 기준:**
- ★☆☆☆☆ (1점): 심각한 문제가 있음, 기본적인 수준에도 미달
- ★★☆☆☆ (2점): 부족함, 개선이 많이 필요함
- ★★★☆☆ (3점): 보통, 평균적인 수준
- ★★★★☆ (4점): 좋음, 평균 이상의 수준
- ★★★★★ (5점): 뛰어남, 전문가 수준

**각 항목별 세부 기준:**

**${ratingCriteria[0]}**
- 1점: 심각한 문제가 있음, 기본적인 수준에도 미달
- 2점: 부족함, 개선이 많이 필요함
- 3점: 보통, 평균적인 수준
- 4점: 좋음, 평균 이상의 수준
- 5점: 뛰어남, 전문가 수준

**${ratingCriteria[1]}**
- 1점: 심각한 문제가 있음, 기본적인 수준에도 미달
- 2점: 부족함, 개선이 많이 필요함
- 3점: 보통, 평균적인 수준
- 4점: 좋음, 평균 이상의 수준
- 5점: 뛰어남, 전문가 수준

**${ratingCriteria[2]}**
- 1점: 심각한 문제가 있음, 기본적인 수준에도 미달
- 2점: 부족함, 개선이 많이 필요함
- 3점: 보통, 평균적인 수준
- 4점: 좋음, 평균 이상의 수준
- 5점: 뛰어남, 전문가 수준

**${ratingCriteria[3]}**
- 1점: 심각한 문제가 있음, 기본적인 수준에도 미달
- 2점: 부족함, 개선이 많이 필요함
- 3점: 보통, 평균적인 수준
- 4점: 좋음, 평균 이상의 수준
- 5점: 뛰어남, 전문가 수준

**${ratingCriteria[4]}**
- 1점: 심각한 문제가 있음, 기본적인 수준에도 미달
- 2점: 부족함, 개선이 많이 필요함
- 3점: 보통, 평균적인 수준
- 4점: 좋음, 평균 이상의 수준
- 5점: 뛰어남, 전문가 수준

**평가 원칙:**
- 객관적으로 글의 실제 수준을 평가하세요
- 너무 관대하거나 엄격하지 말고 정직하게 평가하세요
- 각 항목별로 구체적인 기준에 따라 점수를 매기세요
- 평균적으로 3점이 '보통' 수준임을 기억하세요

**응답 형식:**
| 항목 | 별점 | 한 줄 평가 |
| --- | --- | --- |
| ${ratingCriteria[0]} | ★★★☆☆ | ... |
| ${ratingCriteria[1]} | ★★★☆☆ | ... |
| ${ratingCriteria[2]} | ★★★☆☆ | ... |
| ${ratingCriteria[3]} | ★★★☆☆ | ... |
| ${ratingCriteria[4]} | ★★★☆☆ | ... |

**평균 별점과 등급:**
- 4.5~5.0: 뛰어남 (전문가 수준)
- 3.5~4.4: 좋음 (평균 이상)
- 2.5~3.4: 보통 (평균 수준)
- 1.0~2.4: 부족 (개선 필요)`;

    // 파트별 프롬프트 설정
    let practiceSpecificPrompt = '';
    let practiceSpecificRules = '';
    
    if (category === '소설') {
      const fictionConfig = getFictionPrompt(practiceType, problemPrompt);
      practiceSpecificPrompt = fictionConfig.practiceSpecificPrompt;
      practiceSpecificRules = fictionConfig.practiceSpecificRules;
    } else if (category === '시나리오') {
      const screenplayConfig = getScreenplayPrompt(practiceType, problemPrompt);
      practiceSpecificPrompt = screenplayConfig.practiceSpecificPrompt;
      practiceSpecificRules = screenplayConfig.practiceSpecificRules;
    } else if (category === '시') {
      const poetryConfig = getPoetryPrompt(practiceType, problemPrompt);
      practiceSpecificPrompt = poetryConfig.practiceSpecificPrompt;
      practiceSpecificRules = poetryConfig.practiceSpecificRules;
    } else if (category === '에세이') {
      const essayConfig = getEssayPrompt(practiceType, problemPrompt);
      practiceSpecificPrompt = essayConfig.practiceSpecificPrompt;
      practiceSpecificRules = essayConfig.practiceSpecificRules;
    } else {
      // 기본값 (소설 기준)
      const fictionConfig = getFictionPrompt(practiceType, problemPrompt);
      practiceSpecificPrompt = fictionConfig.practiceSpecificPrompt;
      practiceSpecificRules = fictionConfig.practiceSpecificRules;
    }

    // 공통 프롬프트 구성
    const prompt = `${practiceSpecificPrompt}

${starRatingGuide}

**응답 형식 규칙:**
- 반드시 아래 섹션들을 순서대로 작성하세요
- 별점 평가를 먼저 작성한 후, 다른 섹션들을 작성하세요
- 각 섹션 제목을 정확히 포함하세요
- 감상은 약 200자 내외, 다른 항목은 2~3문장 내외로 작성하세요
- 개선안은 문제 설명 → 원문 인용 → 개선 방향 순으로 작성하세요
- 연습문제라면 문제와 답안을 함께 분석하여 평가해 주세요
- 글이 해당 장르의 형식이 아니거나 정말 형편없는 글이면 신랄하게 평가해 주세요
- 연습문제가 있으면 그것을 잘 활용했는지, 문제를 잘 이해했는지 평가해 주세요
- 연습문제에서 원문 활용이 잘 안되진 않았는지, 너무 문제를 벗어나지 않았는지, 아니면 반대로 너무 문제에 얽매여있지는 않은지 평가 해주세요

**톤과 어조:**
- "사용자는...", "사용자의 글은..." 같은 딱딱한 표현 대신 "당신의 글은...", "당신이..." 같은 친근한 표현을 사용하세요
- 존댓말을 기본으로 하되, 너무 딱딱하지 않고 따뜻하고 격려하는 톤으로 작성하세요
- 마치 선생님이 학생을 격려하는 듯한 따뜻한 어조를 유지하세요

**형식 규칙:**
- 각 섹션의 내용은 반드시 단락으로 구분하여 작성하세요
- 긴 문장은 적절히 줄바꿈하여 가독성을 높이세요
- 각 섹션 사이에는 빈 줄을 두어 구분을 명확히 하세요

${practiceSpecificRules}

**반드시 아래 형식으로 응답하세요:**

**별점 평가**
| 항목 | 별점 | 한 줄 평가 |
| --- | --- | --- |
| ${ratingCriteria[0]} | ★★★☆☆ | ... |
| ${ratingCriteria[1]} | ★★★☆☆ | ... |
| ${ratingCriteria[2]} | ★★★☆☆ | ... |
| ${ratingCriteria[3]} | ★★★☆☆ | ... |
| ${ratingCriteria[4]} | ★★★☆☆ | ... |

## 감상
${category === '소설' ? '(소설의 경우, 문장력과 묘사력이 어떻게 구현되었는지, 흐름과 개연성이 어떻게 달성되었는지, 몰입감과 주제 전달이 어떻게 효과적으로 이루어졌는지를 구체적으로 분석할 것)' : ''}
${category === '시나리오' ? '(시나리오의 경우, 구조와 플롯이 어떻게 구성되었는지, 장면 구성력이 어떻게 발휘되었는지, 대사와 캐릭터가 어떻게 구현되었는지를 구체적으로 분석할 것)' : ''}
${category === '시' ? '(시의 경우, 이미지와 상징이 어떻게 활용되었는지, 운율과 리듬이 어떻게 구현되었는지, 감정과 주제가 어떻게 전달되었는지를 구체적으로 분석할 것)' : ''}
${category === '에세이' ? '(에세이의 경우, 논리와 구조가 어떻게 구성되었는지, 사고와 분석이 어떻게 전개되었는지, 표현과 문체가 어떻게 구현되었는지를 구체적으로 분석할 것)' : ''}

## 좋았던 점
(글에서 뛰어난 부분을 1~3가지 구체적으로 분석한다. 
문장력, 묘사력, 분위기 전달, 캐릭터 표현, 장르적 톤 충실도, 몰입감, 창의성 등 다양한 요소를 짚어낸다. 
단순히 "좋았다"가 아니라, 어떤 문장에서 어떤 기법이 효과적이었는지 구체적으로 설명한다.
단 사용자의 전체적인 별점이 1~2점 사이라면 신랄하게 비판하고 개선할 점을 지적할 것.)

## 개선할 점
(글에서 아쉬운 부분을 1~3가지 지적한다. 
실제로 어떻게 수정하거나 발전시킬 수 있을지 제안한다. 
예: 특정 문장을 인용하고 → 어떤 점에서 아쉬운지 설명 → 더 생생하거나 효과적인 대안 문장 또는 표현 방법 제시. 
각 개선안은 실질적이고 글쓴이가 바로 적용할 수 있는 수준으로 구체적으로 작성한다.
단순히 "부족하다"가 아니라, 왜 그렇게 느껴지는지 근거와 맥락을 함께 제시한다. 
단 사용자의 전체적인 별점이 4점 이상이라면 특별히 고칠만한게 아니면 개선점에서 이런건 스타일 차이나 이렇게 하면 더 디테일적으로 좋을 수 있다 등의 조언식으로 할 것.
사용자의 전체적인 별점이 1~2점 사이라면 신랄하게 비판하고 개선할 점을 지적할 것.)

## 코멘트
(전체적인 인상을 총평하며, 글이 가진 강점과 발전 가능성을 균형 있게 다룬다. 
단순히 "잘했다"가 아니라, 글쓴이의 스타일적 특성과 잠재력을 짚어주고, 앞으로 어떤 방향으로 발전할 수 있을지 제안한다. 
마지막은 반드시 따뜻하고 격려하는 말로 마무리한다. 예: "이미 훌륭한 감각을 보여주고 있으니, 앞으로 더 다양한 시도를 하며 글을 발전시켜 나가길 바란다.")
`;

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json({ error: 'AI 서비스 오류가 발생했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const aiFeedback = data.choices[0].message.content;

    // 코인 차감
    const deductResult = await deductUserCoins(user.id, requiredCoins);
    if (!deductResult.success) {
      console.error('코인 차감 실패:', deductResult.error);
      // 코인 차감 실패해도 피드백은 반환
    }

    // 사용자 글 저장
    const { error: saveError } = await supabaseServer
      .from('user_writings')
      .insert({
        user_id: user.id,
        content: content,
        category: category,
        practice_type: practiceType,
        problem_prompt: problemPrompt,
        ai_feedback: aiFeedback,
        coins_used: requiredCoins
      });

    if (saveError) {
      console.error('글 저장 실패:', saveError);
    }

    return NextResponse.json({ 
      feedback: aiFeedback,
      coinsUsed: requiredCoins,
      remainingCoins: currentCoins - requiredCoins
    });
  }

  } catch (error) {
    console.error('AI 피드백 생성 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 