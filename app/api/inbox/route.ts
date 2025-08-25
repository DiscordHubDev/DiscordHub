import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);

  const userId = session.discordProfile?.id;

  const { data, error } = await supabase
    .from('Notification')
    .select('*')
    .or(`userId.eq.${userId},userId.is.null`)
    .order('createdAt', { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);

  const userId = session.discordProfile?.id;

  const { id } = await req.json();

  // 強制把 userId 也放進 where 條件，避免改到別人的
  const { error } = await supabase
    .from('Notification')
    .update({ read: true })
    .match({ id, userId });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);

  const userId = session.discordProfile?.id;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('Notification')
    .delete()
    .match({ id, userId });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
