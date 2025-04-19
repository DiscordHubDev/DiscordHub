'use server';

import {
  CreateServerInput,
  ServerType,
  ServerWithMinimalFavorited,
} from '@/lib/prisma_type';
import { prisma } from '@/lib/prisma';
import { fetchUserInfo } from '../utils';
import { getHaveGuildManagePermissionMembers } from '../get-user-guild';

export async function fetchAdminIdsForGuild(
  guildId: string,
): Promise<string[]> {
  return await getHaveGuildManagePermissionMembers(guildId);
}

export async function buildConnectOrCreateAdmins(
  admins: (string | { id: string })[],
) {
  return await Promise.all(
    admins
      .map(admin => (typeof admin === 'string' ? admin : admin.id))
      .filter(Boolean)
      .map(async userId => {
        const info = await fetchUserInfo(userId);
        return {
          where: { id: userId },
          create: {
            id: userId,
            username: info.global_name ?? 'Unknown',
            avatar: info.avatar_url ?? '',
            banner: info.banner_url ?? null,
            joinedAt: new Date(),
            social: {},
          },
        };
      }),
  );
}

export async function updateServer(
  data: CreateServerInput,
  connectOrCreateAdmins?: any[],
) {
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
        secret: data.secret,
        VoteNotificationURL: data.VoteNotificationURL,
        rules: data.rules,
        features: data.features ?? [],
        screenshots: data.screenshots ?? [],

        // connect owner
        owner: data.owner?.connectOrCreate
          ? {
              connect: {
                id: data.owner.connectOrCreate.where.id,
              },
            }
          : undefined,

        // connectOrCreate admins
        admins:
          connectOrCreateAdmins && connectOrCreateAdmins.length > 0
            ? {
                set: [],
                connectOrCreate: connectOrCreateAdmins,
              }
            : undefined,
      },
    });

    console.log(
      `✅ 已更新伺服器 ${data.name}，並同步 ${connectOrCreateAdmins?.length ?? 0} 位管理員`,
    );
    return updatedServer;
  } catch (error) {
    console.error('❌ 更新伺服器失敗:', error);
    throw error;
  }
}

export async function insertServer(
  data: CreateServerInput,
  connectOrCreateAdmins?: any[],
) {
  try {
    const createdServer = await prisma.server.create({
      data: {
        ...data,
        admins: {
          connectOrCreate: connectOrCreateAdmins,
        },
      },
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
        admins: true,
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
): Promise<ServerType | undefined> => {
  try {
    const server = await prisma.server.findFirst({
      where: { id: guildId },
      include: {
        owner: true,
        favoritedBy: true,
        admins: true,
      },
    });

    if (!server) {
      return undefined;
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
