import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../../../lib/auth';
import { supabaseServer } from '../../../../../lib/supabaseClient';

// 댓글 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 댓글 목록 조회
    const { data, error } = await supabaseServer
      .from('community_comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('댓글 목록 조회 오류:', error);
      return NextResponse.json({ error: '댓글 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 댓글 작성
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabaseServer
      .from('community_posts')
      .select('id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 댓글 작성
    const { data, error } = await supabaseServer
      .from('community_comments')
      .insert({
        post_id: id,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('댓글 작성 오류:', error);
      return NextResponse.json({ error: '댓글 작성에 실패했습니다.' }, { status: 500 });
    }

    // 게시글의 댓글 수 증가
    await supabaseServer.rpc('increment', {
      table_name: 'community_posts',
      column_name: 'comments_count',
      row_id: id,
      increment_value: 1
    }).catch(async () => {
      // RPC가 없으면 직접 업데이트
      const { data: currentPost } = await supabaseServer
        .from('community_posts')
        .select('comments_count')
        .eq('id', id)
        .single();
      
      await supabaseServer
        .from('community_posts')
        .update({ comments_count: (currentPost?.comments_count || 0) + 1 })
        .eq('id', id);
    });

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

