"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";

interface BoardPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: 'notice' | 'event' | 'suggestion' | 'contest' | 'general';
  pinned: boolean;
  view_count: number;
  likes: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

const categoryLabels = {
  notice: '공지사항',
  event: '이벤트',
  suggestion: '건의사항',
  contest: '공모전',
  general: '일반',
};

const categoryColors = {
  notice: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  event: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  suggestion: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  contest: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  general: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

export default function BoardPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState<'notice' | 'event' | 'suggestion' | 'contest' | 'general'>('general');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/board/${postId}`, {
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      const res = await fetch(`/api/board/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          category: editCategory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowEditForm(false);
        fetchPost();
      } else {
        alert(data.error || '게시글 수정에 실패했습니다.');
      }
    } catch (err) {
      console.error('게시글 수정 오류:', err);
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

      const res = await fetch(`/api/board/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/board');
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
          href="/board"
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
            {showEditForm ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">게시글 수정</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      내용
                    </label>
                    <textarea
                      id="edit-content"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white resize-y"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      카테고리
                    </label>
                    <select
                      id="edit-category"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as typeof editCategory)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white"
                      required
                    >
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditTitle(post.title);
                        setEditContent(post.content);
                        setEditCategory(post.category);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '수정 중...' : '수정하기'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.pinned && (
                          <span className="text-yellow-500 text-sm font-semibold">📌 고정</span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColors[post.category]}`}>
                          {categoryLabels[post.category]}
                        </span>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{post.title}</h1>
                    </div>
                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowEditForm(true)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          수정
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
                    <span>좋아요 {post.likes || 0}</span>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                      {post.content}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

