'use server';

import {
  CreateServerInput,
  ServerType,
  ServerWithMinimalFavorited,
} from '@/lib/prisma_type';
import { prisma } from '@/lib/prisma';

export async function updateServer(data: CreateServerInput) {
  try {
    const updatedServer = await prisma.server.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        longDescription: data.longDescription,
        tags: data.tags,
        members: data.members,
        online: data.online,
        upvotes: data.upvotes,
        icon: data.icon,
        banner: data.banner,
        website: data.website,
        inviteUrl: data.inviteUrl,
        rules: data.rules,
        features: data.features ?? [],
        screenshots: data.screenshots ?? [],
        owner: data.owner?.connectOrCreate
          ? {
              connect: {
                id: data.owner.connectOrCreate.where.id,
              },
            }
          : undefined,
      },
    });

    return updatedServer;
  } catch (error) {
    console.error('❌ 更新伺服器失敗:', error);
    throw error;
  }
}

export async function insertServer(data: CreateServerInput) {
  try {
    const createdServer = await prisma.server.create({
      data,
    });

    return createdServer;
  } catch (error) {
    console.error('❌ 新增伺服器失敗:', error);
    throw error;
  }
}

export const isOwnerexist = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? true : false;
};

export const getAllServers = async () => {
  try {
    const servers = await prisma.server.findMany({
      include: {
        owner: true,
        favoritedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return servers;
  } catch (error) {
    console.error('❌ 無法獲取伺服器列表:', error);
    throw error;
  }
};

// 獲取單一伺服器
export const getServerWithFavoritedByGuildId = async (
  userId: string | undefined,
  guildId: string,
): Promise<ServerWithMinimalFavorited> => {
  try {
    const server = await prisma.server.findUnique({
      where: { id: guildId },
      include: {
        owner: true,
        favoritedBy: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!server) {
      throw new Error('找不到該伺服器');
    }

    return server;
  } catch (error) {
    console.error(`❌ 無法獲取伺服器 (${guildId}):`, error);
    throw error;
  }
};

export const getServerByGuildId = async (
  guildId: string,
): Promise<ServerType> => {
  try {
    const server = await prisma.server.findFirst({
      where: { id: guildId },
      include: {
        owner: true,
        favoritedBy: true,
      },
    });

    if (!server) {
      throw new Error('找不到該伺服器');
    }

    return server;
  } catch (error) {
    console.error(`❌ 無法獲取伺服器 (${guildId}):`, error);
    throw error;
  }
};

export const deleteServerByGuildId = async (
  guildId: string,
): Promise<{ success: boolean; error?: any }> => {
  try {
    await prisma.server.delete({
      where: { id: guildId },
    });

    return { success: true };
  } catch (error) {
    console.error(`❌ 無法刪除伺服器 (${guildId}):`, error);
    return { success: false, error };
  }
};
