import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../lib/auth';
import { supabaseServer } from '../../../lib/supabaseClient';

// 커뮤니티 게시글 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const category = searchParams.get('category');

    // 게시글 목록 조회
    let query = supabaseServer
      .from('community_posts')
      .select('*', { count: 'exact' });

    // 카테고리 필터 적용
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // 정렬: 최신순
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('게시글 목록 조회 오류:', error);
      return NextResponse.json({ error: '게시글 목록을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      posts: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 커뮤니티 게시글 작성
export async function POST(req: NextRequest) {
  try {
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

    // 게시글 작성
    const { data, error } = await supabaseServer
      .from('community_posts')
      .insert({
        user_id: user.id,
        title,
        content,
        category: postCategory,
        view_count: 0,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('게시글 작성 오류:', error);
      return NextResponse.json({ error: '게시글 작성에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

