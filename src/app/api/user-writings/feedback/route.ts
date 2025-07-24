import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { writing_id, feedback } = await req.json();
  const { data, error } = await supabase
    .from('user_writings')
    .update({ feedback })
    .eq('id', writing_id);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
} 