export default function Footer() {
  return (
    <footer 
      className="w-full py-6 px-4 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400 mt-8 border-t border-gray-200 dark:border-gray-700"
      role="contentinfo"
      aria-label="사이트 푸터"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-2">
        <span 
          className="text-sm"
          aria-label={`© ${new Date().getFullYear()} 글쓰기 연습소. 모든 권리 보유.`}
        >
          © {new Date().getFullYear()} 글쓰기 연습소. 모든 권리 보유.
        </span>
        <nav 
          className="flex gap-4"
          role="navigation"
          aria-label="소셜 미디어 및 연락처 링크"
        >
          <a 
            href="mailto:contact@writingstudio.kr" 
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-1 transition-colors"
            aria-label="이메일로 문의하기 (새 이메일 창이 열립니다)"
            title="이메일로 문의하기"
          >
            이메일
          </a>
          <a 
            href="https://github.com/your-github" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-1 transition-colors"
            aria-label="GitHub 프로젝트 페이지로 이동 (새 창에서 열림)"
            title="GitHub 프로젝트 페이지"
          >
            GitHub
          </a>
          <a 
            href="https://twitter.com/your-twitter" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 py-1 transition-colors"
            aria-label="Twitter 프로필로 이동 (새 창에서 열림)"
            title="Twitter 프로필"
          >
            Twitter
          </a>
        </nav>
      </div>
    </footer>
  );
} 