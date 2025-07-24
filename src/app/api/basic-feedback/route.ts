import { NextRequest, NextResponse } from 'next/server';

interface TextAnalysis {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
  uniqueWords: number;
  vocabularyDiversity: number;
  paragraphCount: number;
  averageParagraphLength: number;
}

interface GrammarCheck {
  issues: Array<{
    type: string;
    description: string;
    suggestion: string;
    position?: number;
  }>;
  score: number;
}

interface StyleAnalysis {
  formality: 'formal' | 'casual' | 'mixed';
  complexity: 'simple' | 'moderate' | 'complex';
  tone: 'neutral' | 'emotional' | 'descriptive' | 'narrative';
  strengths: Array<{
    point: string;
    evidence: string;
  }>;
  weaknesses: Array<{
    point: string;
    evidence: string;
    suggestion: string;
  }>;
}

interface FeedbackResult {
  analysis: TextAnalysis;
  grammar: GrammarCheck;
  style: StyleAnalysis;
  suggestions: string[];
  overallScore: number;
  category: string;
}

// 텍스트 분석 함수
function analyzeText(text: string): TextAnalysis {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w가-힣]/g, ''))).size;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  return {
    characterCount: text.length,
    wordCount: words.length,
    sentenceCount: sentences.length,
    averageSentenceLength: sentences.length > 0 ? Math.round(words.length / sentences.length * 10) / 10 : 0,
    uniqueWords,
    vocabularyDiversity: words.length > 0 ? Math.round((uniqueWords / words.length) * 100 * 10) / 10 : 0,
    paragraphCount: paragraphs.length,
    averageParagraphLength: paragraphs.length > 0 ? Math.round(sentences.length / paragraphs.length * 10) / 10 : 0
  };
}

// 대화문 판별 함수: 따옴표로 감싸진 문장인지 확인
function isDialogue(sentence: string): boolean {
  // 양쪽에 " 또는 '로 감싸진 경우, 또는 한글 대화체 따옴표(“ ”)도 포함
  const trimmed = sentence.trim();
  return (
    (/^".*"$/.test(trimmed) || /^'.*'$/.test(trimmed) || /^“.*”$/.test(trimmed))
  );
}

// 문법 체크 함수
function checkGrammar(text: string): GrammarCheck {
  const issues: Array<{
    type: string;
    description: string;
    suggestion: string;
    position?: number;
    example?: string;
  }> = [];
  
  let score = 100;
  
  // 문장 분리
  const sentences = text.match(/[^.!?\n]+[.!?\n]?/g) || [];
  
  // 문장 길이 분석
  const shortSentences: string[] = [];
  const longSentences: string[] = [];
  
  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    
    // 대화문은 짧거나 길어도 별도의 경고나 개선점에 포함하지 않도록 예외 처리
    if (isDialogue(trimmed)) {
      return;
    }

    // 문장이 너무 긴 경우
    if (trimmed.length > 100) {
      longSentences.push(trimmed);
      score -= 5;
    }
    
    // 문장이 너무 짧은 경우 (10자 미만)
    if (trimmed.length < 10) {
      shortSentences.push(trimmed);
      score -= 3;
    }
  });
  
  // 짧은 문장들을 그룹화하여 한 번에 보고
  if (shortSentences.length > 0) {
    const examples = shortSentences.slice(0, 3).map(s => `"${s}"`).join(', ');
    issues.push({
      type: '짧은 문장',
      description: `${shortSentences.length}개의 문장이 너무 짧습니다. (예: ${examples})`,
      suggestion: '짧은 문장들을 연결하거나 구체적인 묘사를 추가해 보세요.',
      example: shortSentences.slice(0, 3).join(' | ')
    });
  }
  
  // 긴 문장들을 그룹화하여 한 번에 보고
  if (longSentences.length > 0) {
    const examples = longSentences.slice(0, 2).map(s => `"${s.substring(0, 30)}..."`).join(', ');
    issues.push({
      type: '긴 문장',
      description: `${longSentences.length}개의 문장이 너무 깁니다. (예: ${examples})`,
      suggestion: '긴 문장을 두 개로 나누어 읽기 쉽게 만들어 보세요.',
      example: longSentences.slice(0, 2).join(' | ')
    });
  }
  
  // 반복되는 단어 체크 (전체 텍스트 기준)
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w가-힣]/g, '');
    if (cleanWord.length > 1) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });
  
  const repeatedWords = Object.entries(wordCount)
    .filter(([word, count]) => count > 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  repeatedWords.forEach(([word, count]) => {
    issues.push({
      type: '단어 반복',
      description: `'${word}'이(가) ${count}번 사용되었습니다.`,
      suggestion: '동의어나 다른 표현을 사용하여 다양성을 높여 보세요.',
      example: `"${word}" 사용 횟수: ${count}회`
    });
    score -= 2;
  });
  
  // 전체 텍스트에서 반복 패턴 체크
  const repeatedPhrases = findRepeatedPhrases(text);
  if (repeatedPhrases.length > 0) {
    const examples = repeatedPhrases.slice(0, 2).map(p => `"${p}"`).join(', ');
    issues.push({
      type: '구문 반복',
      description: `${repeatedPhrases.length}개의 구문이 반복되어 사용되었습니다. (예: ${examples})`,
      suggestion: '다양한 표현을 사용하여 단조로움을 피해 보세요.',
      example: repeatedPhrases.slice(0, 2).join(' | ')
    });
    score -= 3;
  }
  
  // 문단 구조 체크
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const veryShortParagraphs = paragraphs.filter(p => p.length < 20);
  
  if (veryShortParagraphs.length > 3) {
    issues.push({
      type: '짧은 문단',
      description: `${veryShortParagraphs.length}개의 문단이 너무 짧습니다.`,
      suggestion: '관련된 내용을 하나의 문단으로 묶어 보세요.',
      example: veryShortParagraphs.slice(0, 2).join(' | ')
    });
    score -= 2;
  }
  
  return { issues, score: Math.max(0, score) };
}

// 반복되는 구문 찾기
function findRepeatedPhrases(text: string): string[] {
  const phrases: string[] = [];
  const words = text.split(/\s+/);
  
  for (let len = 3; len <= 6; len++) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = text.match(regex);
      
      if (matches && matches.length > 2 && phrase.length > 5) {
        phrases.push(phrase);
      }
    }
  }
  
  return [...new Set(phrases)];
}

// 스타일 분석 함수 개선
function analyzeStyle(text: string, category: string): StyleAnalysis {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // 격식성 분석
  const formalWords = ['따라서', '그러므로', '또한', '그러나', '하지만', '그런데', '결과적으로'];
  const casualWords = ['그래서', '그럼', '근데', '그치', '맞아', '좋아'];
  
  const formalCount = formalWords.filter(word => text.includes(word)).length;
  const casualCount = casualWords.filter(word => text.includes(word)).length;
  
  let formality: 'formal' | 'casual' | 'mixed';
  if (formalCount > casualCount * 2) formality = 'formal';
  else if (casualCount > formalCount * 2) formality = 'casual';
  else formality = 'mixed';
  
  // 복잡성 분석
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  let complexity: 'simple' | 'moderate' | 'complex';
  if (avgSentenceLength < 10) complexity = 'simple';
  else if (avgSentenceLength < 20) complexity = 'moderate';
  else complexity = 'complex';
  
  // 톤 분석
  const toneEmotionalWords = ['사랑', '미워', '기쁘', '슬프', '화나', '무서', '즐거', '재미'];
  const toneDescriptiveWords = ['아름다운', '푸른', '밝은', '어두운', '큰', '작은', '부드러운', '따뜻한'];
  const narrativeWords = ['그때', '그리고', '그러다가', '그런데', '그래서', '마침내', '결국'];
  
  const emotionalCount = toneEmotionalWords.filter(word => text.includes(word)).length;
  const descriptiveCount = toneDescriptiveWords.filter(word => text.includes(word)).length;
  const narrativeCount = narrativeWords.filter(word => text.includes(word)).length;
  
  let tone: 'neutral' | 'emotional' | 'descriptive' | 'narrative';
  if (emotionalCount > descriptiveCount && emotionalCount > narrativeCount) tone = 'emotional';
  else if (descriptiveCount > emotionalCount && descriptiveCount > narrativeCount) tone = 'descriptive';
  else if (narrativeCount > emotionalCount && narrativeCount > descriptiveCount) tone = 'narrative';
  else tone = 'neutral';
  
  // 강점과 약점 분석 (실제 텍스트에서 발취한 근거 사용)
  const strengths: Array<{point: string; evidence: string}> = [];
  const weaknesses: Array<{point: string; evidence: string; suggestion: string}> = [];
  
  // 매우 짧은 글에 대한 특별 처리
  if (text.length < 20) {
    weaknesses.push({
      point: '글자 수가 매우 부족함',
      evidence: `현재 ${text.length}자로 요구사항에 훨씬 미치지 못합니다.`,
      suggestion: '최소 100자 이상으로 글을 작성해 주세요.'
    });
    
    if (words.length < 3) {
      weaknesses.push({
        point: '단어 수가 매우 부족함',
        evidence: `현재 ${words.length}개의 단어만 사용되었습니다.`,
        suggestion: '더 많은 단어와 문장을 사용하여 내용을 풍성하게 만들어 주세요.'
      });
    }
    
    if (sentences.length < 2) {
      weaknesses.push({
        point: '문장 수가 매우 부족함',
        evidence: `현재 ${sentences.length}개의 문장만 작성되었습니다.`,
        suggestion: '여러 문장을 연결하여 완성된 내용을 만들어 주세요.'
      });
    }
    
    // 매우 짧은 글에는 강점을 찾기 어려우므로 기본적인 것만
    if (text.trim().length > 0) {
      strengths.push({
        point: '기본적인 글쓰기 시작',
        evidence: '글쓰기를 시작하셨습니다.'
      });
    }
    
    return {
      formality,
      complexity,
      tone,
      strengths,
      weaknesses
    };
  }
  
  // 문장 길이 분석 - 실제 문장 예시 사용
  const goodLengthSentences = sentences.filter(s => s.trim().length >= 10 && s.trim().length <= 30);
  const shortSentences = sentences.filter(s => s.trim().length < 10);
  const longSentences = sentences.filter(s => s.trim().length > 30);
  
  if (goodLengthSentences.length > 0) {
    const example = goodLengthSentences[0].trim();
    strengths.push({
      point: '적절한 문장 길이',
      evidence: `"${example}"와 같이 적절한 길이의 문장을 사용했습니다.`
    });
  }
  
  if (shortSentences.length > 0) {
    const example = shortSentences[0].trim();
    weaknesses.push({
      point: '문장이 너무 짧음',
      evidence: `"${example}"와 같은 짧은 문장이 많아 내용이 부족합니다.`,
      suggestion: '짧은 문장들을 연결하거나 구체적인 묘사를 추가하여 내용을 풍성하게 만들어보세요.'
    });
  }
  
  if (longSentences.length > 0) {
    const example = longSentences[0].trim();
    weaknesses.push({
      point: '문장이 너무 김',
      evidence: `"${example.substring(0, 30)}..."와 같은 긴 문장이 읽기 어렵습니다.`,
      suggestion: '긴 문장을 두 개로 나누어 읽기 쉽게 만들어보세요.'
    });
  }
  
  // 어휘 다양성 분석
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^\w가-힣]/g, '')));
  const diversity = words.length > 0 ? (uniqueWords.size / words.length) * 100 : 0;
  
  if (diversity >= 60) {
    strengths.push({
      point: '다양한 어휘 사용',
      evidence: `${Math.round(diversity)}%의 어휘 다양성을 보여 다양한 표현을 사용했습니다.`
    });
  } else if (diversity < 30) {
    weaknesses.push({
      point: '어휘 다양성 부족',
      evidence: `${Math.round(diversity)}%의 어휘 다양성으로 단조로운 표현이 많습니다.`,
      suggestion: '동의어나 다른 표현을 사용하여 어휘 다양성을 높여보세요.'
    });
  }
  
  // 문단 구조 분석
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) {
    const firstParagraph = paragraphs[0].substring(0, 30) + (paragraphs[0].length > 30 ? '...' : '');
    strengths.push({
      point: '적절한 문단 구분',
      evidence: `"${firstParagraph}"와 같이 문단이 잘 구분되어 읽기 쉽습니다.`
    });
  }
  
  // 감정 표현 분석 - 실제 감정 단어가 포함된 문장 발취
  const emotionalWords = ['사랑', '미워', '기쁘', '슬프', '화나', '무서', '즐거', '재미', '따뜻', '차갑', '외로', '행복'];
  const foundEmotionalWords = emotionalWords.filter(word => text.includes(word));
  if (foundEmotionalWords.length > 0) {
    const emotionalSentences = sentences.filter(s => 
      foundEmotionalWords.some(word => s.includes(word))
    );
    if (emotionalSentences.length > 0) {
      const example = emotionalSentences[0].trim();
      strengths.push({
        point: '감정 표현 활용',
        evidence: `"${example}"와 같이 감정 표현이 잘 사용되었습니다.`
      });
    }
  }
  
  // 묘사 표현 분석 - 실제 묘사 문장 발취
  const descriptiveWords = ['아름다운', '푸른', '밝은', '어두운', '큰', '작은', '부드러운', '따뜻한', '차가운', '깊은', '넓은'];
  const foundDescriptiveWords = descriptiveWords.filter(word => text.includes(word));
  if (foundDescriptiveWords.length > 0) {
    const descriptiveSentences = sentences.filter(s => 
      foundDescriptiveWords.some(word => s.includes(word))
    );
    if (descriptiveSentences.length > 0) {
      const example = descriptiveSentences[0].trim();
      strengths.push({
        point: '묘사 표현 활용',
        evidence: `"${example}"와 같이 구체적인 묘사가 잘 사용되었습니다.`
      });
    }
  }
  
  // 연결어 사용 분석 - 실제 연결어가 포함된 문장 발취
  const connectiveWords = ['그리고', '그러나', '하지만', '그런데', '그래서', '또한', '또는', '그때', '그러다가'];
  const foundConnectiveWords = connectiveWords.filter(word => text.includes(word));
  if (foundConnectiveWords.length > 0) {
    const connectiveSentences = sentences.filter(s => 
      foundConnectiveWords.some(word => s.includes(word))
    );
    if (connectiveSentences.length > 0) {
      const example = connectiveSentences[0].trim();
      strengths.push({
        point: '문장 연결',
        evidence: `"${example}"와 같이 연결어를 사용하여 문장 간 흐름이 자연스럽습니다.`
      });
    }
  }
  
  return {
    formality,
    complexity,
    tone,
    strengths,
    weaknesses
  };
}

// 개선 제안 생성
function generateSuggestions(analysis: TextAnalysis, grammar: GrammarCheck, style: StyleAnalysis, category: string): string[] {
  const suggestions: string[] = [];
  
  // 매우 짧은 글에 대한 특별 제안
  if (analysis.characterCount < 20) {
    suggestions.push('글쓰기를 시작하셨습니다. 이제 구체적인 내용을 추가해 보세요.');
    suggestions.push('주어진 문제나 주제에 맞는 내용을 작성해 보세요.');
    suggestions.push('최소 100자 이상으로 글을 완성해 보세요.');
    return suggestions;
  }
  
  // 글자 수 관련
  if (analysis.characterCount < 100) {
    suggestions.push('더 구체적인 내용을 추가하여 글을 풍성하게 만들어 보세요.');
    suggestions.push('주어진 문제나 주제에 대한 구체적인 생각을 표현해 보세요.');
  } else if (analysis.characterCount > 2000) {
    suggestions.push('핵심 내용을 중심으로 글을 정리해 보세요.');
  }
  
  // 문장 길이 관련
  if (analysis.averageSentenceLength < 8) {
    suggestions.push('문장을 연결하여 더 자연스러운 흐름을 만들어 보세요.');
  } else if (analysis.averageSentenceLength > 25) {
    suggestions.push('긴 문장을 나누어 읽기 쉽게 만들어 보세요.');
  }
  
  // 어휘 다양성 관련
  if (analysis.vocabularyDiversity < 40) {
    suggestions.push('다양한 단어와 표현을 사용해 보세요.');
  }
  
  // 문법 오류 관련
  if (grammar.score < 80) {
    suggestions.push('문법 오류를 수정하여 더 정확한 글을 써 보세요.');
  }
  
  // 스타일 관련
  if (style.weaknesses.length > 0) {
    style.weaknesses.forEach(weakness => {
      if (weakness.point.includes('짧음')) {
        suggestions.push(weakness.suggestion);
      } else if (weakness.point.includes('김')) {
        suggestions.push(weakness.suggestion);
      } else if (weakness.point.includes('어휘')) {
        suggestions.push(weakness.suggestion);
      }
    });
  }
  
  // 카테고리별 특화 제안
  if (category === '소설') {
    if (style.tone !== 'narrative' && style.tone !== 'descriptive') {
      suggestions.push('등장인물의 감정이나 상황을 더 구체적으로 묘사해 보세요.');
    }
    if (analysis.characterCount < 200) {
      suggestions.push('소설은 등장인물, 배경, 사건을 포함한 완성된 이야기가 필요합니다.');
    }
  } else if (category === '시') {
    if (analysis.averageSentenceLength > 15) {
      suggestions.push('시적 표현을 위해 더 간결하고 함축적인 문장을 사용해 보세요.');
    }
  } else if (category === '에세이') {
    if (style.formality === 'casual') {
      suggestions.push('에세이의 특성상 조금 더 격식 있는 어조를 사용해 보세요.');
    }
  }
  
  return suggestions.slice(0, 5); // 최대 5개 제안
}

// 전체 점수 계산
function calculateOverallScore(analysis: TextAnalysis, grammar: GrammarCheck, style: StyleAnalysis): number {
  let score = 0;
  
  // 글자 수 점수 (30점) - 매우 짧은 글에 대해 엄격하게 평가
  if (analysis.characterCount < 10) {
    score += 5; // 매우 짧은 글은 최소 점수만
  } else if (analysis.characterCount < 50) {
    score += 10; // 짧은 글은 낮은 점수
  } else if (analysis.characterCount >= 100 && analysis.characterCount <= 2000) {
    score += 30; // 적절한 길이
  } else if (analysis.characterCount >= 50 && analysis.characterCount <= 3000) {
    score += 20; // 보통 길이
  } else {
    score += 15; // 너무 길거나 짧음
  }
  
  // 문장 길이 점수 (20점)
  if (analysis.averageSentenceLength >= 8 && analysis.averageSentenceLength <= 25) {
    score += 20;
  } else if (analysis.averageSentenceLength >= 5 && analysis.averageSentenceLength <= 30) {
    score += 15;
  } else if (analysis.averageSentenceLength < 3) {
    score += 5; // 매우 짧은 문장은 낮은 점수
  } else {
    score += 10;
  }
  
  // 어휘 다양성 점수 (20점) - 단어가 매우 적을 때 낮은 점수
  if (analysis.wordCount < 3) {
    score += 5; // 단어가 매우 적으면 낮은 점수
  } else if (analysis.vocabularyDiversity >= 50) {
    score += 20;
  } else if (analysis.vocabularyDiversity >= 30) {
    score += 15;
  } else {
    score += 10;
  }
  
  // 문법 점수 (20점)
  score += (grammar.score / 100) * 20;
  
  // 스타일 점수 (10점)
  const styleScore = 10 - (style.weaknesses.length * 2);
  score += Math.max(0, styleScore);
  
  // 최종 점수 조정: 매우 짧은 글에 대해 추가 페널티
  if (analysis.characterCount < 20) {
    score = Math.max(10, score * 0.5); // 최소 10점 보장하되 절반으로 감점
  }
  
  return Math.round(score);
}

export async function POST(req: NextRequest) {
  try {
    const { content, category = '소설' } = await req.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content provided' }, { status: 400 });
    }
    
    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Empty content provided' }, { status: 400 });
    }
    
    // 텍스트 분석
    const analysis = analyzeText(content);
    const grammar = checkGrammar(content);
    const style = analyzeStyle(content, category);
    const suggestions = generateSuggestions(analysis, grammar, style, category);
    const overallScore = calculateOverallScore(analysis, grammar, style);
    
    const result: FeedbackResult = {
      analysis,
      grammar,
      style,
      suggestions,
      overallScore,
      category
    };
    
    return NextResponse.json({ result });
    
  } catch (error) {
    console.error('Basic Feedback API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 