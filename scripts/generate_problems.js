// 연습방식별 예시 문제 자동 생성 스크립트
const fs = require('fs');

const practiceTypes = [
  // 소설
  { category: '소설', type: '문제 풀이' },
  { category: '소설', type: '테마별 글쓰기' },
  { category: '소설', type: '필사 연습' },
  { category: '소설', type: '재작성 훈련' },
  // 시나리오
  { category: '시나리오', type: '상황극/역할극' },
  { category: '시나리오', type: '장면 전환' },
  { category: '시나리오', type: '대사 작성' },
  { category: '시나리오', type: '시나리오 구조화' },
  { category: '시나리오', type: '장면 묘사' },
  { category: '시나리오', type: '즉흥 시나리오' },
  { category: '시나리오', type: '장르 변환' },
  { category: '시나리오', type: '한 문장 시나리오' },
  // 시
  { category: '시', type: '이미지화' },
  { category: '시', type: '운율 맞추기' },
  { category: '시', type: '시어 변형' },
  { category: '시', type: '필사 연습' },
  { category: '시', type: '즉흥시' },
  { category: '시', type: '모방시' },
  { category: '시', type: '주제 변주' },
  { category: '시', type: '한 문장 시' },
  // 에세이
  { category: '에세이', type: '주제 에세이' },
  { category: '에세이', type: '경험담' },
  { category: '에세이', type: '논증/설득' },
  { category: '에세이', type: '요약/확장' },
  { category: '에세이', type: '인용문 활용' },
  { category: '에세이', type: '감상문' },
  { category: '에세이', type: '비유/은유' },
  { category: '에세이', type: '30분 타이머 글쓰기' },
  // 사극/각색극
  { category: '사극', type: '문제 풀이' },
  { category: '사극', type: '테마별 글쓰기' },
  { category: '사극', type: '필사 연습' },
  { category: '사극', type: '재작성 훈련' },
  { category: '사극', type: '5감각 묘사' },
  { category: '사극', type: '한 문장 사극' },
  { category: '사극', type: '이어쓰기' },
  { category: '사극', type: '시점 변화 연습' },
  // 기타
  { category: '기타', type: '한줄소설쓰기' },
  { category: '기타', type: '한줄시쓰기' },
  { category: '기타', type: '이어쓰기' },
  { category: '기타', type: '필사하기' },
  { category: '기타', type: '문제풀이' },
];

function getRandomTagPool(category) {
  if (category === '소설') return ['일상', '감동', '반전', '사랑', '우정', '성장', '추억', '비밀', '여행', '가족'];
  if (category === '시나리오') return ['긴장', '유머', '감정', '갈등', '화해', '이별', '만남', '꿈', '현실', '미래'];
  if (category === '시') return ['자연', '계절', '감성', '추억', '희망', '고독', '빛', '어둠', '바람', '별'];
  if (category === '에세이') return ['성장', '도전', '실패', '성공', '습관', '일상', '감사', '후회', '기억', '배움'];
  if (category === '사극') return ['역사', '궁중', '전쟁', '충성', '명예', '가문', '의리', '비밀', '사랑', '운명'];
  return ['창의', '상상', '감성', '일상', '도전', '우정', '사랑', '희망', '비밀', '성장'];
}

function makePrompt(category, type, idx) {
  // 간단한 프롬프트 생성 규칙(실제 서비스에서는 더 다양하게 확장 가능)
  if (type.includes('필사')) return `아래 문장을 그대로 필사해보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('이어쓰기')) return `아래 문장으로 이야기를 이어 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('한 문장')) return `아래 주제로 한 문장 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('문제 풀이')) return `아래 상황에 맞는 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('경험담')) return `최근 경험한 인상 깊은 일을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('감상문')) return `최근 감명 깊게 본 작품에 대해 감상문을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('비유') || type.includes('은유')) return `아래 주제를 비유적으로 풀어 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('주제')) return `아래 주제로 자유롭게 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('장면')) return `아래 장면을 묘사해보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('대사')) return `아래 상황에 어울리는 대사를 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('시점')) return `아래 문장을 다양한 시점으로 바꿔 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('구조화')) return `아래 주제로 시나리오 구조를 설계해보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('즉흥')) return `아래 프롬프트로 즉흥적으로 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('장르')) return `아래 상황을 다양한 장르로 바꿔 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('운율')) return `아래 문장에 운율을 맞춰 시를 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('이미지')) return `아래 단어를 시적 이미지로 표현해보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('모방')) return `아래 시인의 스타일로 시를 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('논증') || type.includes('설득')) return `아래 주장에 대해 논리적으로 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('요약') || type.includes('확장')) return `아래 글을 요약하거나 확장해보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('인용문')) return `아래 인용문을 활용해 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('30분')) return `타이머를 30분 설정 후 아래 주제로 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
  if (type.includes('5감각')) return `아래 장면을 오감으로 묘사해보세요. (${category} ${type} 예시 ${idx + 1})`;
  return `아래 주제로 글을 써보세요. (${category} ${type} 예시 ${idx + 1})`;
}

const problems = [];
practiceTypes.forEach(({ category, type }) => {
  const tagPool = getRandomTagPool(category);
  for (let i = 0; i < 200; i++) {
    // 태그 2~3개 랜덤 선택
    const tags = tagPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);
    problems.push({
      category,
      type,
      prompt: makePrompt(category, type, i),
      tags
    });
  }
});

fs.writeFileSync('problems.json', JSON.stringify(problems, null, 2), 'utf-8');
console.log('문제 데이터가 problems.json 파일로 저장되었습니다.'); 