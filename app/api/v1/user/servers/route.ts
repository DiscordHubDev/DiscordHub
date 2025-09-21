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

export async function GET(req: NextRequest): Promise<Response> {
  const userId = req.headers.get('x-user-id');
  const data = await prisma.user.findUnique({
    where: {
      id: userId || '',
    },
    select: {
      ownedServers: {
        select: ServerAPISelect,
      },
    },
  });

  const servers = data?.ownedServers;

  if (!servers) {
    return new Response(
      JSON.stringify({ message: '沒有任何伺服器', success: false }),
      {
        status: 404,
      },
    );
  }

  const admins = servers.find(s => s.admins.find(dev => dev.id === userId));

  if (!admins) {
    return new Response(
      JSON.stringify(
        { message: '你並非此機器人的開發者', success: false },
        null,
        2,
      ),
      {
        status: 403,
      },
    );
  }

  return new Response(JSON.stringify(servers, null, 2), {
    status: 200,
  });
}
