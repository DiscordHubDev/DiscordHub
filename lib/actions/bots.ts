import { prisma } from '@/lib/prisma';

export async function getAllBots() {
  const bots = await prisma.bot.findMany({
    where: {
      status: 'approved',
    },
    include: {
      developers: true,
      commands: true,
    },
  });

  return bots;
}

export async function getBot(id: string) {
  const bot = await prisma.bot.findFirst({
    where: {
      id,
      status: 'approved',
    },
    include: {
      developers: true,
      commands: true,
      favoritedBy: true,
    },
  });
  return bot;
}

export async function getPendingBots() {
  const bots = await prisma.bot.findMany({
    where: {
      status: 'pending',
    },
    include: {
      developers: true,
      commands: true,
    },
    orderBy: {
      upvotes: 'desc',
    },
  });

  return bots;
}
