import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { user_id, problem_id, content } = await req.json();
  const { data, error } = await supabase
    .from('user_writings')
    .insert([{ user_id, problem_id, content }]);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
} 