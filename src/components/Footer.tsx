export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 bg-gray-100 dark:bg-gray-900 text-center text-gray-600 dark:text-gray-400 mt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-2">
        <span>© {new Date().getFullYear()} 글쓰기 연습소. 모든 권리 보유.</span>
        <div className="flex gap-4">
          <a href="mailto:contact@writingstudio.kr" className="hover:underline">이메일</a>
          <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          <a href="https://twitter.com/your-twitter" target="_blank" rel="noopener noreferrer" className="hover:underline">Twitter</a>
        </div>
      </div>
    </footer>
  );
} 