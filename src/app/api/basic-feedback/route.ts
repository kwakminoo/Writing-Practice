import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, category } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: '텍스트가 비어있습니다.' },
        { status: 400 }
      );
    }

    // 기본 피드백 생성 로직
    const feedback = generateBasicFeedback(content);

    return NextResponse.json({
      result: feedback,
      message: '기본 피드백이 생성되었습니다.'
    });

  } catch (error) {
    console.error('기본 피드백 생성 중 오류:', error);
    return NextResponse.json(
      { error: '피드백 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateBasicFeedback(text: string): any {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const charCount = text.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  
  // 고유 단어 수 계산
  const uniqueWords = new Set(words.map(word => word.toLowerCase())).size;
  const vocabularyDiversity = wordCount > 0 ? Math.round((uniqueWords / wordCount) * 100) : 0;
  
  // 평균 문장 길이
  const avgSentenceLength = sentences > 0 ? Math.round(wordCount / sentences) : 0;
  
  // 평균 단락 길이
  const avgParagraphLength = paragraphs > 0 ? Math.round(wordCount / paragraphs) : 0;

  // 전체 점수 계산 (글자 수, 문장 수, 단락 수 등을 종합)
  let overallScore = 70; // 기본 점수
  
  if (charCount >= 100) overallScore += 10;
  if (charCount >= 300) overallScore += 10;
  if (sentences >= 3) overallScore += 5;
  if (paragraphs >= 2) overallScore += 5;
  if (vocabularyDiversity >= 60) overallScore += 5;
  if (avgSentenceLength >= 5 && avgSentenceLength <= 20) overallScore += 5;
  
  overallScore = Math.min(overallScore, 100); // 최대 100점

  return {
    overallScore,
    analysis: {
      characterCount: charCount,
      wordCount: wordCount,
      sentenceCount: sentences,
      paragraphCount: paragraphs,
      averageSentenceLength: avgSentenceLength,
      averageParagraphLength: avgParagraphLength,
      uniqueWords: uniqueWords,
      vocabularyDiversity: vocabularyDiversity
    },
    style: {
      formality: charCount > 500 ? 'formal' : 'casual',
      complexity: avgSentenceLength > 15 ? 'complex' : avgSentenceLength > 8 ? 'moderate' : 'simple',
      tone: 'neutral',
      strengths: [
        {
          point: "글자 수가 적절합니다",
          evidence: `${charCount}자로 기본적인 내용을 담고 있습니다.`
        }
      ],
      weaknesses: [
        {
          point: "더 자세한 묘사가 필요합니다",
          evidence: `현재 글자 수가 ${charCount}자입니다.`,
          suggestion: "더 구체적인 묘사와 예시를 추가해보세요."
        }
      ]
    },
    grammar: {
      score: 85,
      issues: []
    },
    suggestions: [
      "더 구체적인 묘사를 추가해보세요.",
      "문단을 나누어 가독성을 높여보세요.",
      "다양한 어휘를 사용해보세요."
    ],
    summary: `📊 기본 분석 결과\n\n📝 글자 수: ${charCount}자\n📖 단어 수: ${wordCount}개\n📄 문장 수: ${sentences}개\n📑 문단 수: ${paragraphs}개\n\n✨ 기본 분석이 완료되었습니다. 더 자세한 피드백을 원하시면 AI 피드백을 이용해보세요!`
  };
} 