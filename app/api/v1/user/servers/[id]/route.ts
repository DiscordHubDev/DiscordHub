import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const server = await prisma.server.findUnique({
    where: { id },
    select: { admins: true },
  });

  if (!server) {
    return new Response(
      JSON.stringify({ message: '伺服器不存在', success: false }),
      {
        status: 404,
      },
    );
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

  return new Response(JSON.stringify({ server }), {
    status: 200,
  });
}
