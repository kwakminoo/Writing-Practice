import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../../../../lib/auth';
import { supabaseServer } from '../../../../../../lib/supabaseClient';

// 댓글 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { commentId } = params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = authResult.user;

    // 댓글 소유자 확인
    const { data: comment, error: commentError } = await supabaseServer
      .from('community_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    // 댓글 수정
    const { data, error } = await supabaseServer
      .from('community_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error('댓글 수정 오류:', error);
      return NextResponse.json({ error: '댓글 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 댓글 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = params;

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = authResult.user;

    // 댓글 소유자 확인
    const { data: comment, error: commentError } = await supabaseServer
      .from('community_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    // 댓글 삭제
    const { error } = await supabaseServer
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('댓글 삭제 오류:', error);
      return NextResponse.json({ error: '댓글 삭제에 실패했습니다.' }, { status: 500 });
    }

    // 게시글의 댓글 수 감소
    const { data: currentPost } = await supabaseServer
      .from('community_posts')
      .select('comments_count')
      .eq('id', id)
      .single();
    
    await supabaseServer
      .from('community_posts')
      .update({ comments_count: Math.max(0, (currentPost?.comments_count || 0) - 1) })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

