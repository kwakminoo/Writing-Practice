import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function gptSpellCheck(text: string): Promise<string> {
  const prompt = `다음 한국어 문장의 맞춤법, 띄어쓰기, 오타, 문장부호를 모두 교정해줘.\n- 반드시 띄어쓰기 오류도 교정해야 해.\n- 원문: ${text}\n- 교정문: (수정된 문장만 출력)\n- 단, 교정 결과에서 바뀐 부분(맞춤법, 띄어쓰기, 오타, 문장부호 등)은 <span style='color: #16a34a; font-weight: bold;'>수정된 부분</span>으로 감싸서 표시해줘.\n- 바뀌지 않은 부분은 그대로 두고, 바뀐 부분만 감싸서 보여줘.\n- 전체 문장을 다시 쓰지 말고, 원문과 교정문을 비교해서 바뀐 부분만 감싸서 반환해.\n- 예시: 원문: 나는밥을 먹엇다. → 나는<span style='color: #16a34a; font-weight: bold;'> 밥을</span> <span style='color: #16a34a; font-weight: bold;'>먹었다</span>.`;

  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: '너는 한국어 맞춤법 교정기야.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.2,
    }),
  });
  const data = await res.json();
  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content.trim();
  }
  return '맞춤법 검사 결과를 받아오지 못했습니다.';
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content provided' }, { status: 400 });
    }
    const result = await gptSpellCheck(content);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Spell Check API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 