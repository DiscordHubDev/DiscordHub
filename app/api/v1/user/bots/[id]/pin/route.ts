import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GetbaseUrl } from '@/lib/utils';
import { getCsrfToken } from 'next-auth/react';

const baseUrl = GetbaseUrl();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const bot = await prisma.bot.findUnique({
    where: { id },
    select: { developers: true },
  });

  if (!bot) {
    return new Response(
      JSON.stringify({ message: '機器人不存在', success: false }),
      {
        status: 404,
      },
    );
  }

  const dev = bot.developers.find(d => d.id === req.headers.get('x-user-id'));

  if (!dev) {
    return new Response(
      JSON.stringify({ message: '你並非此機器人的開發者', success: false }),
      {
        status: 403,
      },
    );
  }

  const res = await fetch(`${baseUrl}/api/pin?itemId=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.API_CRON_TOKEN}`,
      'x-csrf-token': (await getCsrfToken()) || '',
    },
    body: JSON.stringify({
      type: 'bot',
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
  });
}
