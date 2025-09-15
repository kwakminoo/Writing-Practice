"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIFeedbackRendererProps {
  feedback: string;
  className?: string;
}

export default function AIFeedbackRenderer({ feedback, className = "" }: AIFeedbackRendererProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI 피드백 결과</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">전문가의 상세한 분석</p>
        </div>
      </div>
      
      <div className="prose prose-lg dark:prose-invert max-w-none [&>*]:text-gray-700 [&>*]:dark:text-gray-300 [&>*]:leading-relaxed">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            // 별점 평가 테이블 스타일링
            table: ({children, ...props}) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm" {...props}>
                  {children}
                </table>
              </div>
            ),
            thead: ({children, ...props}) => (
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" {...props}>
                {children}
              </thead>
            ),
            th: ({children, ...props}) => (
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700" {...props}>
                {children}
              </th>
            ),
            td: ({children, ...props}) => (
              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800" {...props}>
                {children}
              </td>
            ),
            // 헤더 스타일링
            h2: ({children, ...props}) => {
              const text = children?.toString() || '';
                             const iconMap: Record<string, { icon: string; bgColor: string; textColor: string }> = {
                 '별점 평가': { icon: '⭐', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400' },
                 '감상': { icon: '📝', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
                 '좋았던 점': { icon: '✅', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-600 dark:text-green-400' },
                 '개선할 점': { icon: '🔧', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400' },
                 '코멘트': { icon: '💬', bgColor: 'bg-pink-100 dark:bg-pink-900/30', textColor: 'text-pink-600 dark:text-pink-400' }
               };

              const matchedKey = Object.keys(iconMap).find(key => text.includes(key));
              if (matchedKey) {
                const { icon, bgColor, textColor } = iconMap[matchedKey];
                return (
                  <div className="flex items-center gap-3 mb-6 mt-8">
                    <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
                      <span className={`${textColor} text-sm`}>{icon}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                      {children}
                    </h2>
                  </div>
                );
              }
              
              return (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8" {...props}>
                  {children}
                </h2>
              );
            },
            // 리스트 스타일링
            ul: ({children, ...props}) => (
              <ul className="space-y-3 my-4 list-none" {...props}>
                {children}
              </ul>
            ),
            li: ({children, ...props}) => (
              <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300" {...props}>
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>{children}</span>
              </li>
            ),
            // 단락 스타일링
            p: ({children, ...props}) => (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base" {...props}>
                {children}
              </p>
            ),
          }}
        >
          {feedback}
        </ReactMarkdown>
      </div>
    </div>
  );
}
