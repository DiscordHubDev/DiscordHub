import { getAllServerIdsChunked } from '@/lib/actions/servers';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.BOT_TOKEN;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES = 2000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function safeFetchWithRateLimit(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`Fetch failed: ${res.status} ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

/**
 * 取得伺服器 owner 的 Guild Member（含 user 物件）
 * 需要機器人已在該 guild，且有 GUILD_MEMBERS 相關權限 / Intent
 */
async function fetchGuildOwnerMember(guildId: string, userId: string) {
  return await safeFetchWithRateLimit(
    `https://discord.com/api/guilds/${guildId}/members/${userId}`,
    {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    },
  );
}

function buildUserFieldsFromDiscordUser(user: any) {
  const avatarExt = user?.avatar?.startsWith?.('a_') ? 'gif' : 'png';
  const bannerExt = user?.banner?.startsWith?.('a_') ? 'gif' : 'png';

  const username = user?.global_name ?? user?.username ?? null;

  const avatar = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const banner = user?.banner
    ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${bannerExt}?size=4096`
    : null;

  return { username, avatar, banner };
}

async function ensureOwnerUserUpsert(ownerId: string, member?: any) {
  const { username, avatar, banner } = buildUserFieldsFromDiscordUser(
    member?.user ?? { id: ownerId },
  );

  const safeUsername = username ?? `user_${ownerId}`;
  const safeAvatar = avatar ?? 'https://cdn.discordapp.com/embed/avatars/0.png';

  await prisma.user.upsert({
    where: { id: ownerId },
    create: {
      id: ownerId,
      username: safeUsername,
      avatar: safeAvatar,
      banner: banner ?? null,
    },
    update: {
      ...(member?.user
        ? {
            username: safeUsername,
            avatar: safeAvatar,
            banner: banner ?? null,
          }
        : {}),
    },
  });
}

async function updateServerStats(guildId: string) {
  console.log(`[Guild:${guildId}] 開始更新伺服器統計資料`);

  const data = await safeFetchWithRateLimit(
    `https://discord.com/api/guilds/${guildId}?with_counts=true`,
    { headers: { Authorization: `Bot ${BOT_TOKEN}` } },
  );

  if (!data) {
    console.warn(`[Guild:${guildId}] 沒有拿到 Discord API 回傳的資料，跳過`);
    return;
  }

  const ownerId: string | undefined = data.owner_id;
  console.log(`[Guild:${guildId}] 擁有者 ID: ${ownerId ?? '無'}`);

  let member: any = null;
  if (ownerId) {
    console.log(`[Guild:${guildId}] 嘗試抓取擁有者的 guild member`);
    member = await fetchGuildOwnerMember(guildId, ownerId);

    if (member) {
      console.log(
        `[Guild:${guildId}] 成功取得擁有者 guild member: ${member.user?.username}`,
      );
    } else {
      console.warn(
        `[Guild:${guildId}] 找不到擁有者的 guild member，將使用最小化 user 資料`,
      );
    }
  }

  if (ownerId) {
    console.log(`[Guild:${guildId}] Upsert 擁有者 User 資料到資料庫`);
    await ensureOwnerUserUpsert(ownerId, member);
  }

  const updateData: any = {
    ...(data.name != null && { name: data.name }),
    ...(data.icon != null && {
      icon: `https://cdn.discordapp.com/icons/${guildId}/${data.icon}.png`,
    }),
    ...(data.banner != null && {
      banner: `https://cdn.discordapp.com/banners/${guildId}/${data.banner}.png`,
    }),
    members: data.approximate_member_count,
    online: data.approximate_presence_count,
    ...(ownerId && { owner: { connect: { id: ownerId } } }),
  };

  console.log(`[Guild:${guildId}] 更新資料庫中的伺服器紀錄`, {
    name: updateData.name,
    members: updateData.members,
    online: updateData.online,
    hasOwner: !!ownerId,
  });

  try {
    await prisma.server.update({
      where: { id: guildId },
      data: updateData,
    });
    console.log(`[Guild:${guildId}] ✅ 更新成功`);
  } catch (error) {
    console.error(`[Guild:${guildId}] ❌ 更新失敗`, error);
  }

  console.log(`[Guild:${guildId}] 完成一次更新流程`);
}

// 將陣列分割成指定大小的批次
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const serverIds = await getAllServerIdsChunked();
  console.log(
    `Processing ${serverIds.length} servers in batches of ${BATCH_SIZE}`,
  );

  // 將伺服器 ID 分成批次
  const batches = chunkArray(serverIds, BATCH_SIZE);

  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(
      `Processing batch ${i + 1}/${batches.length} with ${
        batch.length
      } servers`,
    );

    for (let j = 0; j < batch.length; j++) {
      const guildId = batch[j];
      try {
        await updateServerStats(guildId);
        successCount++;
      } catch (error) {
        console.error(`Error processing guildId ${guildId}:`, error);
        errorCount++;
      }
      processedCount++;

      if (j < batch.length - 1) {
        await sleep(300);
      }
    }

    console.log(
      `Batch ${i + 1} completed. Progress: ${processedCount}/${
        serverIds.length
      }`,
    );

    if (i < batches.length - 1) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  console.log(
    `Update completed. Total: ${serverIds.length}, Success: ${successCount}, Errors: ${errorCount}`,
  );

  return NextResponse.json({
    ok: true,
    processed: processedCount,
    success: successCount,
    errors: errorCount,
    total: serverIds.length,
  });
}
