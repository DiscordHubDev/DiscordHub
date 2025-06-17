'use server';

import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';

export async function checkBotPermission(botId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const bot = await prisma.bot.findUnique({
    where: { id: botId },
    include: {
      developers: true,
    },
  });

  if (!bot) {
    notFound();
  }

  const isDeveloper = bot.developers.some(dev => dev.id === userId);

  if (!isDeveloper) {
    redirect('/unauthorized/');
  }

  return { success: true, bot };
}

export async function checkServerPermission(serverId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.discordProfile?.id;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      owner: true,
      admins: true,
    },
  });

  if (!server) {
    notFound();
  }

  const isOwner = server.ownerId === userId;
  const isAdmin = server.admins.some(admin => admin.id === userId);

  if (!isOwner && !isAdmin) {
    redirect('/unauthorized/');
  }

  return { success: true, server };
}
