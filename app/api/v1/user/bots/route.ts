import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

const BotAPISelect = {
  id: true,
  name: true,
  icon: true,
  description: true,
  longDescription: true,
  inviteUrl: true,
  prefix: true,
  verified: true,
  approvedAt: true,
  tags: true,
  servers: true,
  upvotes: true,
  banner: true,
  website: true,
  supportServer: true,
  screenshots: true,
  features: true,
  commands: {
    select: {
      id: true,
      name: true,
      description: true,
      usage: true,
      category: true,
    },
  },
  developers: {
    select: {
      id: true,
      username: true,
      avatar: true,
      social: true,
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
      developedBots: {
        select: BotAPISelect,
      },
    },
  });

  const bots = data?.developedBots;

  if (!bots) {
    return new Response(
      JSON.stringify({ message: '沒有任何機器人', success: false }),
      {
        status: 404,
      },
    );
  }

  const dev = bots.find(d => d.developers.find(dev => dev.id === userId));

  if (!dev) {
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

  return new Response(JSON.stringify(bots, null, 2), {
    status: 200,
  });
}
