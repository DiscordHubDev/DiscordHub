// app/api/auth/verify-db/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ⬅️ Force Node runtime here
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const secret = req.headers.get('x-internal-secret');
  if (secret !== process.env.API_CRON_TOKEN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { token } = await req.json();

  const isCorrectToken = await prisma.apiToken.findFirst({
    where: { accessToken: token },
  });

  if (!isCorrectToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
