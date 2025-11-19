"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: 'fiction' | 'poetry' | 'essay' | 'screenplay' | 'general';
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const categoryLabels = {
  fiction: '소설',
  poetry: '시',
  essay: '에세이',
  screenplay: '시나리오',
  general: '일반',
};

const categoryColors = {
  fiction: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  poetry: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300',
  essay: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  screenplay: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  general: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

export default function CommunityPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<'fiction' | 'poetry' | 'essay' | 'screenplay' | 'general'>('general');

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/community/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (res.ok) {
        setPost(data.post);
        setEditTitle(data.post.title);
        setEditContent(data.post.content);
        setEditCategory(data.post.category || 'general');
      } else {
        setError(data.error || '게시글을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('게시글 조회 오류:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/community/${postId}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (res.ok) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('댓글 조회 오류:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!commentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/community/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: commentContent,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCommentContent("");
        fetchComments();
        fetchPost(); // 댓글 수 갱신
      } else {
        alert(data.error || '댓글 작성에 실패했습니다.');
      }
    } catch (err) {
      console.error('댓글 작성 오류:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/community/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/community');
      } else {
        alert(data.error || '게시글 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/community/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        fetchComments();
        fetchPost(); // 댓글 수 갱신
      } else {
        alert(data.error || '댓글 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('댓글 삭제 오류:', err);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = user && post && user.id === post.user_id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/community"
          className="inline-block mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← 목록으로
        </Link>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : !post ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">게시글을 찾을 수 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[post.category]}`}>
                      {categoryLabels[post.category]}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditForm(!showEditForm)}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {showEditForm ? '취소' : '수정'}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? '삭제 중...' : '삭제'}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <span>익명</span>
                <span>{formatDate(post.created_at)}</span>
                <span>조회 {post.view_count || 0}</span>
                <span>댓글 {post.comments_count || 0}</span>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.content}
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                댓글 ({comments.length})
              </h2>

              {/* 댓글 작성 폼 */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y"
                    placeholder="댓글을 입력하세요..."
                    required
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submitting || !commentContent.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '작성 중...' : '댓글 작성'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    로그인하기
                  </Link>
                </div>
              )}

              {/* 댓글 목록 */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    아직 댓글이 없습니다.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">익명</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                        {user && user.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

