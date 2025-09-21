import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

const ServerAPISelect = {
  id: true,
  name: true,
  description: true,
  longDescription: true,
  tags: true,
  members: true,
  online: true,
  upvotes: true,
  icon: true,
  banner: true,
  featured: true,
  createdAt: true,
  website: true,
  inviteUrl: true,
  rules: true,
  features: true,
  screenshots: true,
  pin: true,
  pinExpiry: true,
  owner: {
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  },
  admins: {
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  },
  favoritedBy: {
    select: {
      id: true,
      username: true,
    },
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const server = await prisma.server.findUnique({
    where: { id },
    select: ServerAPISelect,
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
      JSON.stringify(
        { message: '你並非此伺服器的管理員', success: false },
        null,
        2,
      ),
      {
        status: 403,
      },
    );
  }

  return new Response(JSON.stringify({ server }, null, 2), {
    status: 200,
  });
}
