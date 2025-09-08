import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
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

  return new Response(JSON.stringify({ bot }), {
    status: 200,
  });
}
