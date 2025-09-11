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

  const server = await prisma.server.findUnique({
    where: { id },
    select: { admins: true },
  });

  if (!server) {
    return new Response(JSON.stringify({ message: '機器人不存在' }), {
      status: 404,
    });
  }

  const admins = server.admins.find(a => a.id === req.headers.get('x-user-id'));

  if (!admins) {
    return new Response(
      JSON.stringify({ message: '你並非此伺服器的管理員', success: false }),
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
      type: 'server',
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
  });
}
