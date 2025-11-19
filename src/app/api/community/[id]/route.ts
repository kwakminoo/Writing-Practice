import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../../lib/auth';
import { supabaseServer } from '../../../../lib/supabaseClient';

// 게시글 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 게시글 조회
    const { data: post, error: postError } = await supabaseServer
      .from('community_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 조회수 증가
    await supabaseServer
      .from('community_posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ post: { ...post, view_count: (post.view_count || 0) + 1 } });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 게시글 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, content, category } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 });
    }

    // 카테고리 검증
    const validCategories = ['fiction', 'poetry', 'essay', 'screenplay', 'general'];
    const postCategory = category && validCategories.includes(category) ? category : 'general';

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = authResult.user;

    // 게시글 소유자 확인
    const { data: post, error: postError } = await supabaseServer
      .from('community_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    // 게시글 수정
    const { data, error } = await supabaseServer
      .from('community_posts')
      .update({
        title,
        content,
        category: postCategory,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('게시글 수정 오류:', error);
      return NextResponse.json({ error: '게시글 수정에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 게시글 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 사용자 인증
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = authResult.user;

    // 게시글 소유자 확인
    const { data: post, error: postError } = await supabaseServer
      .from('community_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    // 게시글 삭제
    const { error } = await supabaseServer
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('게시글 삭제 오류:', error);
      return NextResponse.json({ error: '게시글 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

