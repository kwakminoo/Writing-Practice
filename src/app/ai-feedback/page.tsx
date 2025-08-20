"use client";
import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";

export default function AiFeedback() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackMain, setFeedbackMain] = useState("");
  const [feedbackTech, setFeedbackTech] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userCoins, setUserCoins] = useState<number | null>(null);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // 유틸: 다음 섹션 헤더(코멘트/기술/총평/결론 등) 시작 전까지만 남기기
  const clipAtNextSection = (md: string) => {
    if (!md) return md;
    // 다음 섹션 헤더 후보들(필요시 더 추가)
    const NEXT_HEAD = /(^|\n)(?=#{1,6}\s*(?:\d+\.\s*)?(?:코멘트|comment|코치|응원|격려|기술|technical|기술적\s*피드백|총평|결론|추천|다음\s*제안)\b)/i;
    const parts = md.split(NEXT_HEAD);
    return parts[0]?.trim() || md.trim();
  };

  // 서버 섹션 안에 코멘트 헤더가 섞여온 흔적 확인
  const looksMixed = (s: string) => /(^|\n)#{1,6}\s*(?:\d+\.\s*)?코멘트\b/i.test(s || "");

  // 표시용: 모든 헤더에서 숫자 제거 (예: "## 1. 별점 평가" → "## 별점 평가")
  const removeNumbersFromHeaders = (md: string) => {
    if (!md) return md;
    return md.replace(/^(#{1,6})\s*\d+\.\s*/gm, '$1 ');
  };

  type Section = { title: string; content: string };
  const extractSections = (md: string): Section[] => {
    if (!md) return [];
    // Match headings like ## 제목 (숫자 제거됨)
    const regex = /(^|\n)(#{1,6})\s*([^\n]+?)\s*(\r?\n)/g;
    const indices: Array<{ index: number; level: number; title: string }> = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(md)) !== null) {
      indices.push({ index: m.index + (m[1] ? m[1].length : 0), level: m[2].length, title: m[3].trim() });
    }
    if (indices.length === 0) return [{ title: "", content: md.trim() }];
    const sections: Section[] = [];
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i].index;
      const end = i + 1 < indices.length ? indices[i + 1].index : md.length;
      const headingLineEnd = md.indexOf("\n", start);
      const title = md.slice(start, headingLineEnd).replace(/^#{1,6}\s*/, "").trim();
      const content = md.slice(headingLineEnd + 1, end).trim();
      sections.push({ title, content: `## ${title}\n\n${content}`.trim() });
    }
    return sections;
  };
  const sections = useMemo(() => extractSections(feedback), [feedback]);
  const isTechTitle = (title: string) => /기술적\s*피드백|기술\s*피드백|테크니컬|technical|문법|표현|구조/i.test(title);
  const isCommentTitle = (title: string) => /코멘트|comment|코치|응원|격려|한줄\s*코멘트|한마디/i.test(title);
  const techSection = useMemo(() => sections.find(s => isTechTitle(s.title)) || null, [sections]);
  const commentSection = useMemo(() => sections.find(s => isCommentTitle(s.title)) || null, [sections]);
  const mainSections = useMemo(() => sections.filter(s => s !== techSection && s !== commentSection), [sections, techSection, commentSection]);
  let mainMd = useMemo(() => (mainSections.length ? mainSections.map(s => s.content).join("\n\n") : feedback), [mainSections, feedback]) as string;
  let techMd = techSection?.content || "";
  let commentMd = commentSection?.content || "";

  // Fallback: 헤더 마크다운이 없을 때(plain 텍스트 헤더) 라인 기준으로 분리
  const needFallback = useMemo(() => (
    (!techMd && /(^|\n)\s*(?:#{1,6}\s*)?(?:기술적\s*피드백|기술\s*피드백|테크니컬|technical)\s*(\r?\n)/i.test(feedback)) ||
    (!commentMd && /(^|\n)\s*(?:#{1,6}\s*)?(?:코멘트|comment|코치|응원|격려|한줄\s*코멘트|한마디)\s*(\r?\n)/i.test(feedback))
  ), [techMd, commentMd, feedback]);
  if (needFallback) {
    const findPos = (text: string, label: string) => {
      const r = new RegExp(`(^|\\n)\\s*(?:#{1,6}\\s*)?${label}\\s*(\\r?\\n)`, 'i');
      const m = r.exec(text);
      return m ? (m.index + (m[1] ? m[1].length : 0)) : -1;
    };
    const iTech = findPos(feedback, '(?:기술적\\s*피드백|기술\\s*피드백|테크니컬|technical)');
    const iCmt = findPos(feedback, '(?:코멘트|comment|코치|응원|격려|한줄\\s*코멘트|한마디)');
    if (iTech !== -1 || iCmt !== -1) {
      const cut = (start: number) => {
        const lineEnd = feedback.indexOf('\n', start);
        const title = feedback.slice(start, lineEnd).replace(/^#{1,6}\s*/, '').trim();
        const nextStart = [iTech, iCmt].filter(v => v > start).sort((a,b)=>a-b)[0] ?? feedback.length;
        const body = feedback.slice(lineEnd + 1, nextStart).trim();
        return `## ${title}\n\n${body}`.trim();
      };
      if (iTech !== -1) techMd = cut(iTech);
      if (iCmt !== -1) commentMd = cut(iCmt);
      const mainParts: string[] = [];
      const ranges = [iTech, iCmt].filter(v => v !== -1).sort((a,b)=>a-b);
      let cursor = 0;
      for (const r of ranges) {
        if (r > cursor) mainParts.push(feedback.slice(cursor, r).trim());
        const nextStart = ranges.find(v => v > r) ?? feedback.length;
        cursor = nextStart;
      }
      if (cursor < feedback.length) mainParts.push(feedback.slice(cursor).trim());
      mainMd = mainParts.filter(Boolean).join('\n\n');
      if (!mainMd) mainMd = feedback;
    }
  }

  useEffect(() => {
    if (user) {
      fetchUserCoins();
    }
  }, [user]);

  const fetchUserCoins = async () => {
    try {
      setLoadingCoins(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/coins/balance', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserCoins(data.balance);
      } else {
        console.error('코인 잔액 조회 오류:', data.error);
        setUserCoins(0);
      }
    } catch (err) {
      console.error('코인 잔액 조회 중 오류:', err);
      setUserCoins(0);
    } finally {
      setLoadingCoins(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      setError("분석할 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError("");
    setSuccess("");
    setFeedback("");
    setFeedbackMain("");
    setFeedbackTech("");
    setFeedbackComment("");

    // 로딩 진행 상황 시뮬레이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          content: content,
          category: 'general',
          practiceType: 'free'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setFeedback(data.feedback || '');
        // 서버 섹션 우선 적용
        if (data.sections) {
          let { main, technical, comment } = data.sections as { main?: string; technical?: string; comment?: string };
          // ✅ 서버 분할 결과를 '다음 헤더 전까지만' 안전하게 잘라서 저장
          setFeedbackMain(clipAtNextSection(main || ""));
          setFeedbackTech(clipAtNextSection(technical || ""));
          setFeedbackComment(comment || ""); // 코멘트는 굳이 자를 필요 적지만 필요시 동일 처리
        }
        setSuccess('AI 피드백이 생성되었습니다!');
        // 동기화
        await queryClient.invalidateQueries({ queryKey: ["coin-balance", user.id] });
        await fetchUserCoins();
      } else {
        setError(data.error || 'AI 피드백 생성 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('AI 피드백 오류:', err);
      setError('AI 피드백 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
    }
  };

  // 최종 표시 컨텐츠: 클라이언트 분할 결과를 우선 사용
  const usedServerSplit = Boolean(feedbackMain || feedbackTech || feedbackComment);
  const usedClientSplit = Boolean(techMd || commentMd);
  const displayMain = removeNumbersFromHeaders(usedClientSplit ? mainMd : (feedbackMain || mainMd));
  // ✅ 클라이언트가 찾아낸 섹션을 우선 사용
  const displayTech = techMd || feedbackTech;
  const displayComment = commentMd || feedbackComment;

  // 디버깅 로그
  console.log('섹션 분리 디버깅:', {
    sections: sections.map(s => s.title),
    techSection: techSection?.title,
    commentSection: commentSection?.title,
    techMd: techMd ? '있음' : '없음',
    commentMd: commentMd ? '있음' : '없음',
    displayTech: displayTech ? '있음' : '없음',
    displayComment: displayComment ? '있음' : '없음'
  });

  // 섹션 카드 내부에서는 섹션 헤더(예: "## 6. 기술적 피드백", "## 7. 코멘트")와
  // 그 바로 뒤 빈 줄을 제거해 카드 상단 여백 문제가 생기지 않도록 정리
  const stripLeadingSectionHeading = (md: string) => {
    if (!md) return md;
    // 1) 맨 앞의 H1~H6 헤더 한 줄 제거 (번호/점/공백 허용)
    let out = md.replace(/^[\s\uFEFF\u200B]*#{1,6}\s*(?:\d+\s*\.\s*)?[^\n]*\n+/i, "");
    // 2) 남아있는 선행 공백/빈 줄 정리
    out = out.replace(/^\s+/, "");
    return out;
  };

  const renderTech = removeNumbersFromHeaders(stripLeadingSectionHeading(displayTech));
  const renderComment = removeNumbersFromHeaders(stripLeadingSectionHeading(displayComment));
  const hasSplit = useMemo(() => Boolean(displayTech || displayComment), [displayTech, displayComment]);

  // 단일 렌더링 시 코멘트 헤더를 안정적으로 정규화(여백·레벨·숫자 접두 포함)
  const normalizedFeedback = useMemo(() => {
    if (!feedback) return feedback;
    let v = feedback;
    // H1~H6 + 선택적 번호 + 코멘트 → 통일된 h3 헤더로 치환, 뒤 공백은 1줄만
    v = v.replace(/(\r?\n|^)#{1,6}\s*(?:\d+\.\s*)?코멘트\s*(\r?\n)+/gi, "\n### 코멘트\n");
    // 과도한 연속 빈 줄 정리
    v = v.replace(/(\r?\n){3,}/g, "\n\n");
    return v;
  }, [feedback]);

  // 코멘트 섹션을 AST 단계에서 카드로 감싸는 rehype 플러그인
  const rehypeWrapComment = () => {
    return (tree: any) => {
      if (!tree || !Array.isArray(tree.children)) return;
      const children = tree.children as any[];
      const getText = (node: any): string => {
        if (!node) return "";
        if (node.type === 'text') return node.value || '';
        if (Array.isArray(node.children)) return node.children.map(getText).join('');
        return '';
      };
      const isHeading = (n: any) => n && n.type === 'element' && /^h[1-6]$/.test(n.tagName);
      const isCommentHeading = (n: any) => {
        if (!isHeading(n)) return false;
        const t = getText(n).replace(/^[\s\uFEFF\u200B]+|[\s\uFEFF\u200B]+$/g, '').trim();
        return /^(?:\d+\.?\s*)?(코멘트|comment|코치|응원|격려|한줄\s*코멘트|한마디)\s*$/i.test(t);
      };
      let start = -1;
      for (let i = 0; i < children.length; i++) {
        if (isCommentHeading(children[i])) { start = i; break; }
      }
      if (start === -1) return;
      let end = children.length;
      for (let j = start + 1; j < children.length; j++) {
        if (isHeading(children[j])) { end = j; break; }
      }
      const heading = children[start];
      heading.tagName = 'h3';
      heading.properties = heading.properties || {};
      const cls = Array.isArray(heading.properties.className) ? heading.properties.className : [];
      heading.properties.className = Array.from(new Set([...cls, 'text-lg', 'font-semibold', 'text-gray-900', 'dark:text-white', 'mb-1']))
        .filter(Boolean);
      const wrapped = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: [
            'bg-white', 'dark:bg-gray-800', 'rounded-lg', 'p-6', 'shadow-sm',
            'border', 'border-gray-200', 'dark:border-gray-700',
          ]
        },
        children: children.slice(start, end)
      } as any;
      tree.children = [...children.slice(0, start), wrapped, ...children.slice(end)];
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 AI 피드백
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI가 여러분의 글을 분석하고 맞춤형 피드백을 제공합니다 (10코인 소모)
          </p>
          {user && (
            <div className="mt-4">
              {loadingCoins ? (
                <p className="text-sm text-gray-500">코인 잔액 확인 중...</p>
              ) : (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  현재 보유 코인: {userCoins}코인
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              분석할 글 입력
            </h2>
            
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  AI 피드백을 받으려면 로그인이 필요합니다.
                </p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  로그인하기
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    글 내용
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="분석받고 싶은 글을 입력해주세요..."
                    disabled={loading}
                  />
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300">
                    {success}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !content.trim() || (userCoins !== null && userCoins < 10)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading || !content.trim() || (userCoins !== null && userCoins < 10)
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      분석 중... ({Math.round(loadingProgress)}%)
                    </div>
                  ) : (
                    'AI 피드백 받기 (10코인)'
                  )}
                </button>
                
                {loading && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>AI가 글을 분석하고 있습니다. 보통 10-15초 정도 소요됩니다.</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {userCoins !== null && userCoins < 10 && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    코인이 부족합니다. 코인을 충전해주세요.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* 피드백 결과 */}
          {feedback && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI 피드백 결과</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">전문가의 상세한 분석</p>
                  </div>
                </div>
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
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
                        if (text.includes('별점 평가')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 dark:text-yellow-400 text-sm">⭐</span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('감상')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-sm">📝</span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('좋았던 점')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-sm">✅</span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('개선이 가능한 부분')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 dark:text-orange-400 text-sm">🔧</span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('글 스타일 분석')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-400 text-sm">🎨</span>
                              </div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white" {...props}>
                                {children}
                              </h2>
                            </div>
                          );
                        } else if (text.includes('코멘트')) {
                          return (
                            <div className="flex items-center gap-3 mb-6 mt-8">
                              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                                <span className="text-pink-600 dark:text-pink-400 text-sm">💬</span>
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
                        <ul className="space-y-3 my-4" {...props}>
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
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4" {...props}>
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {feedback}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* 피드백이 없을 때 */}
          {!feedback && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI 피드백을 받아보세요
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  왼쪽에 글을 입력하고 AI 피드백을 받아보세요!
                </p>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
} 