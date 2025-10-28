import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, getUserCoinBalance, deductUserCoins } from '../../../lib/auth';
import { supabaseServer } from '@/lib/index';
import { getFictionPrompt, getFictionRatingCriteria, getFictionRatingDetails } from './fiction-prompts';
import { getScreenplayPrompt, getScreenplayRatingCriteria } from './screenplay-prompts';
import { getPoetryPrompt, getPoetryRatingCriteria } from './poetry-prompts';
import { getEssayPrompt, getEssayRatingCriteria } from './essay-prompts';

export async function POST(req: NextRequest) {
  try {
    console.log('=== AI 피드백 API 시작 ===');
    
    // 1. 요청 데이터 파싱
    const { content, category, practiceType, problemPrompt } = await req.json();
    console.log('1. 요청 데이터 파싱 완료:', { 
      content: content?.substring(0, 50) + '...', 
      category, 
      practiceType, 
      problemPrompt 
    });
    
    if (!content || typeof content !== 'string') {
      console.log('1. 오류: 유효하지 않은 content');
      return NextResponse.json({ error: 'Invalid content provided' }, { status: 400 });
    }

    // 2. problemPrompt 안전 처리
    const safeProblemPrompt = problemPrompt || '';
    console.log('2. problemPrompt 안전 처리 완료:', safeProblemPrompt);

    // 3. 사용자 인증 (임시로 우회)
    console.log('3. 사용자 인증 시작 (테스트 모드)');
    // 임시 사용자 객체 생성 (테스트용)
    const user = { id: 'test-user-id', email: 'test@example.com' };
    console.log('3. 사용자 인증 완료 (테스트 모드):', user.id);

    // 4. 코인 확인 (임시로 우회)
    console.log('4. 코인 확인 시작 (테스트 모드)');
    const requiredCoins = 10;
    const currentCoins = 100; // 테스트용 코인
    console.log('4. 코인 확인 완료 (테스트 모드):', currentCoins);

    // 5. OpenAI API 키 확인
    console.log('5. OpenAI API 키 확인 시작');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('5. 오류: OpenAI API 키 없음 - 테스트 피드백 반환');
      // API 키가 없을 때 테스트 피드백 반환
      const testFeedback = `## 📝 AI 피드백 (테스트 모드)

### ⭐ 종합 평가: 4.0/5.0

**좋은 점:**
- 창의적인 아이디어와 독창적인 표현이 돋보입니다
- 문장의 흐름이 자연스럽고 읽기 편합니다
- 감정 표현이 생생하고 몰입감이 있습니다

**개선점:**
- 문장의 길이를 다양화하면 더욱 흥미로워질 것입니다
- 구체적인 묘사를 추가하면 독자의 몰입도가 높아집니다
- 주제 의식을 더 명확하게 드러내면 완성도가 높아집니다

### 💡 최후통첩
전반적으로 잘 쓴 글입니다. 창의성과 표현력이 뛰어나며, 몇 가지 세부사항만 보완하면 더욱 완성도 높은 작품이 될 것입니다.`;

      // 코인 차감과 글 저장을 병렬로 처리
      const [deductResult, saveResult] = await Promise.allSettled([
        deductUserCoins(user.id, requiredCoins),
        supabaseServer.from('user_writings').insert({
          user_id: user.id,
          content: content,
          title: `${category} - ${practiceType}`,
          type: 'ai_feedback',
          ai_feedback: testFeedback,
          created_at: new Date().toISOString()
        })
      ]);

      return NextResponse.json({
        feedback: testFeedback,
        coinsUsed: requiredCoins,
        message: '테스트 모드로 피드백을 제공했습니다. 실제 AI 피드백을 받으려면 OpenAI API 키를 설정해주세요.'
      });
    }
    console.log('5. OpenAI API 키 확인 완료');

    // 6. 프롬프트 생성
    console.log('6. 프롬프트 생성 시작');
    let practiceSpecificPrompt = '';
    let practiceSpecificRules = '';
    
    try {
      if (category === '소설') {
        const fictionConfig = getFictionPrompt(practiceType, safeProblemPrompt);
        practiceSpecificPrompt = fictionConfig.practiceSpecificPrompt;
        practiceSpecificRules = fictionConfig.practiceSpecificRules;
        console.log('6-1. 소설 프롬프트 생성 완료');
      } else if (category === '시나리오') {
        const screenplayConfig = getScreenplayPrompt(practiceType, safeProblemPrompt);
        practiceSpecificPrompt = screenplayConfig.practiceSpecificPrompt;
        practiceSpecificRules = screenplayConfig.practiceSpecificRules;
        console.log('6-2. 시나리오 프롬프트 생성 완료');
      } else if (category === '시') {
        const poetryConfig = getPoetryPrompt(practiceType, safeProblemPrompt);
        practiceSpecificPrompt = poetryConfig.practiceSpecificPrompt;
        practiceSpecificRules = poetryConfig.practiceSpecificRules;
        console.log('6-3. 시 프롬프트 생성 완료');
      } else if (category === '에세이') {
        const essayConfig = getEssayPrompt(practiceType, safeProblemPrompt);
        practiceSpecificPrompt = essayConfig.practiceSpecificPrompt;
        practiceSpecificRules = essayConfig.practiceSpecificRules;
        console.log('6-4. 에세이 프롬프트 생성 완료');
      } else {
        // 기본값 (소설 기준)
        const fictionConfig = getFictionPrompt(practiceType, safeProblemPrompt);
        practiceSpecificPrompt = fictionConfig.practiceSpecificPrompt;
        practiceSpecificRules = fictionConfig.practiceSpecificRules;
        console.log('6-5. 기본 프롬프트 생성 완료');
      }
      
      console.log('6. 프롬프트 생성 완료');
    } catch (promptError) {
      console.error('6. 오류: 프롬프트 생성 실패:', promptError);
      return NextResponse.json({ error: '프롬프트 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 6-1. 별점 평가 기준 설정
    console.log('6-1. 별점 평가 기준 설정 시작');
    let ratingCriteria: string[] = [];
    let starRatingGuide = '';
    
    try {
      if (category === '소설') {
        ratingCriteria = getFictionRatingCriteria();
        const ratingDetails = getFictionRatingDetails();
        
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
      }
      
      console.log('6-1. 별점 평가 기준 설정 완료');
    } catch (ratingError) {
      console.error('6-1. 오류: 별점 평가 기준 설정 실패:', ratingError);
      // 기본값으로 설정
      ratingCriteria = ['문장력과 묘사력', '흐름과 개연성', '몰입감과 주제 전달', '창의성과 독창성', '전체적 완성도'];
      console.log('6-1. 기본 별점 기준으로 대체');
    }

    // 6-2. 공통 프롬프트 구성
    console.log('6-2. 공통 프롬프트 구성 시작');
    let prompt = '';
    
    try {
      prompt = `${practiceSpecificPrompt}

${starRatingGuide}

**응답 형식:**
- 별점 평가 → 감상 → 좋았던 점 → 개선할 점 → 코멘트 순서로 작성
- 좋았던 점과 개선할 점은 반드시 2~3개씩 마크다운 리스트(- ) 형식으로 작성
- 친근하고 격려하는 톤으로 작성하세요

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
단순히 "좋았다"가 아니라, 사용자의 글을 인용해서 어떤 문장에서 어떤 기법이 효과적이었는지 구체적으로 설명한다.
단 사용자의 전체적인 별점이 1~2점 사이라면 신랄하게 비판하고 개선할 점을 지적할 것.)

## 개선할 점
(글에서 아쉬운 부분을 1~3가지 지적한다. 
실제로 어떻게 수정하거나 발전시킬 수 있을지 제안한다. 
특정 문장을 인용하고 → 어떤 점에서 아쉬운지 설명 → 더 생생하거나 효과적인 대안 문장 또는 표현 방법 제시. 
각 개선안은 실질적이고 글쓴이가 바로 적용할 수 있는 수준으로 구체적으로 작성한다.
단순히 "부족하다"가 아니라, 왜 그렇게 느껴지는지 근거와 맥락을 함께 제시한다. 
단 사용자의 전체적인 별점이 4점 이상이라면 특별히 고칠만한게 아니면 개선점에서 이런건 스타일 차이나 이렇게 하면 더 디테일적으로 좋을 수 있다 등의 조언식으로 할 것.
사용자의 전체적인 별점이 1~2점 사이라면 신랄하게 비판하고 개선할 점을 지적할 것.)

## 코멘트
(전체적인 인상을 총평하며, 글이 가진 강점과 발전 가능성을 균형 있게 다룬다. 
단순히 "잘했다"가 아니라, 글쓴이의 스타일적 특성과 잠재력을 짚어주고, 앞으로 어떤 방향으로 발전할 수 있을지 제안한다. 
마지막은 반드시 따뜻하고 격려하는 말로 마무리한다. 예: "이미 훌륭한 감각을 보여주고 있으니, 앞으로 더 다양한 시도를 하며 글을 발전시켜 나가길 바란다.")
`;

      console.log('6-2. 공통 프롬프트 구성 완료');
    } catch (promptError) {
      console.error('6-2. 오류: 공통 프롬프트 구성 실패:', promptError);
      return NextResponse.json({ error: '프롬프트 구성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 7. OpenAI API 호출
    console.log('7. OpenAI API 호출 시작');
    try {
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
          temperature: 0.5,
          max_tokens: 1200,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      console.log('7. OpenAI API 응답 상태:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('7. 오류: OpenAI API Error:', errorData);
        return NextResponse.json({ error: 'AI 서비스 오류가 발생했습니다.' }, { status: 500 });
      }

      const data = await response.json();
      const aiFeedback = data.choices[0].message.content;
      console.log('7. OpenAI API 호출 완료');

      // 8. 코인 차감과 글 저장을 병렬로 처리
      console.log('8. 코인 차감 및 글 저장 시작');
      
      // 사용자 토큰 추출
      const authHeader = req.headers.get('authorization');
      const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      
      const [deductResult, saveResult] = await Promise.allSettled([
        deductUserCoins(user.id, requiredCoins, accessToken),
        supabaseServer
          .from('user_writings')
          .insert({
            user_id: user.id,
            content: content,
            category: category,
            practice_type: practiceType,
            problem_prompt: safeProblemPrompt,
            ai_feedback: aiFeedback,
            coins_used: requiredCoins
          })
      ]);

      if (deductResult.status === 'rejected') {
        console.error('8. 오류: 코인 차감 실패:', deductResult.reason);
      }
      if (saveResult.status === 'rejected') {
        console.error('8. 오류: 글 저장 실패:', saveResult.reason);
      }
      console.log('8. 코인 차감 및 글 저장 완료');

      // 10. 응답 반환
      console.log('10. 응답 반환 시작');
      return NextResponse.json({ 
        feedback: aiFeedback,
        coinsUsed: requiredCoins,
        remainingCoins: currentCoins - requiredCoins
      });

    } catch (apiError) {
      console.error('7. 오류: OpenAI API 호출 실패:', apiError);
      return NextResponse.json({ error: 'AI 서비스 오류가 발생했습니다.' }, { status: 500 });
    }

  } catch (error) {
    console.error('=== AI 피드백 API 오류 ===');
    console.error('오류:', error);
    console.error('오류 스택:', error instanceof Error ? error.stack : '스택 정보 없음');
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 