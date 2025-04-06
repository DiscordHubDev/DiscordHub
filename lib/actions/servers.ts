"use server";

import {
  CreateServerInput,
  ServerType,
  ServerWithMinimalFavorited,
} from "@/lib/prisma_type";
import { prisma } from "@/lib/prisma";

export async function insertServer(data: CreateServerInput) {
  try {
    const createdServer = await prisma.server.create({
      data,
    });

    console.log("✅ 新增伺服器成功:", createdServer);
    return createdServer;
  } catch (error) {
    console.error("❌ 新增伺服器失敗:", error);
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
        createdAt: "desc",
      },
    });

    return servers;
  } catch (error) {
    console.error("❌ 無法獲取伺服器列表:", error);
    throw error;
  }
};

// 獲取單一伺服器
export const getServerByGuildId = async (
  userId: string | undefined,
  guildId: string
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
      throw new Error("找不到該伺服器");
    }

    return server;
  } catch (error) {
    console.error(`❌ 無法獲取伺服器 (${guildId}):`, error);
    throw error;
  }
};
