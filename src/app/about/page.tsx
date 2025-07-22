export default function About() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-4">서비스 소개</h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        <b>글쓰기 연습소</b>는 다양한 장르의 글쓰기를 연습하고, AI 피드백을 받을 수 있는 웹사이트입니다.<br />
        소설, 사극, 시나리오, 시, 에세이 등 원하는 방식으로 자유롭게 글을 써보세요.
      </p>
      <h3 className="text-xl font-semibold mt-8 mb-2">제작자</h3>
      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
        <li>팀 연습소 (dummy@writingstudio.kr)</li>
      </ul>
    </div>
  );
} 