import { getBotListChunked } from '@/lib/actions/bots';
import { prisma } from '@/lib/prisma';
import { fetchBotInfo } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface BotInfo {
  global_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  verified?: boolean;
}

async function fetchUpdatedBotInfo(botId: string): Promise<BotInfo | null> {
  try {
    const data = await fetchBotInfo(botId);
    if (!data.info) {
      return null;
    }
    const rpc = data.rpcData;
    const info = data.info;

    if (!data) {
      console.error(`❌ 無法取得 ${botId} 的資訊`);
      return null;
    }

    const global_name =
      typeof info.global_name === 'string' ? info.global_name : null;
    const avatar_url =
      typeof info.avatar_url === 'string' ? info.avatar_url : null;
    const banner_url =
      typeof info.banner_url === 'string' ? info.banner_url : null;

    return {
      global_name,
      avatar_url,
      banner_url,
      verified: rpc?.is_verified || false,
    };
  } catch (error) {
    console.error(`❌ ${botId} 發生錯誤：`, error);
    return null;
  }
}

async function fetchBotServerCount(botId: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://getbotserver.dawngs.top/get_bot_server_count`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bot_id: botId }),
      },
    );

    if (!res.ok) {
      console.error(`❌ 無法取得 ${botId} 的 server count`);
      return null;
    }

    const data = await res.json();
    const server_count = Array.isArray(data)
      ? data.find(item => typeof item.server_count === 'number')?.server_count
      : null;

    return server_count ?? null;
  } catch (error) {
    console.error(`❌ ${botId} 發生錯誤：`, error);
    return null;
  }
}

async function processBotData(bot: any) {
  console.log(`🔄 開始處理 bot: ${bot.name} (${bot.id})`);

  // 先並行發起兩個請求
  const serverCountPromise = fetchBotServerCount(bot.id);
  const infoPromise = fetchUpdatedBotInfo(bot.id);

  // 等待 server count 請求完成（這個比較慢）
  const updatedServerCount = await serverCountPromise;
  console.log(`✅ ${bot.name} server count 已取得: ${updatedServerCount}`);

  // 如果 server count 獲取失敗，直接返回 null
  if (updatedServerCount === null) {
    console.log(`❌ ${bot.name} server count 獲取失敗，跳過更新`);
    return null;
  }

  // 等待 info 請求完成
  const info = await infoPromise;
  console.log(`✅ ${bot.name} info 已取得`);

  // 更新資料庫
  await prisma.bot.update({
    where: { id: bot.id },
    data: {
      servers: updatedServerCount,
      name: info?.global_name ?? bot.name,
      icon: info?.avatar_url ?? bot.icon,
      banner: info?.banner_url ?? bot.banner,
      verified: info?.verified ?? bot.verified,
    },
  });

  console.log(`✅ ${bot.name} 資料庫更新完成`);

  return {
    name: bot.name,
    prevServers: bot.servers,
    servers: updatedServerCount,
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const bots = await getBotListChunked();
    console.log(`📋 總共需要處理 ${bots.length} 個 bots`);

    // 批次處理，每批 5 個，避免同時發送太多請求
    const BATCH_SIZE = 5;
    const BATCH_DELAY = 1000; // 每批之間延遲 1 秒
    const updatedBots = [];

    for (let i = 0; i < bots.length; i += BATCH_SIZE) {
      const batch = bots.slice(i, i + BATCH_SIZE);
      console.log(
        `🔄 處理第 ${Math.floor(i / BATCH_SIZE) + 1} 批 (${
          batch.length
        } 個 bots)`,
      );

      // 為每個 bot 添加不同的延遲，避免完全同時發送
      const batchPromises = batch.map(
        (bot, index) =>
          new Promise(
            resolve =>
              setTimeout(() => resolve(processBotData(bot)), index * 500), // 每個 bot 間隔 500ms
          ),
      );

      const batchResults = await Promise.all(batchPromises);
      const successfulResults = batchResults.filter(result => result !== null);
      updatedBots.push(...successfulResults);

      console.log(
        `✅ 第 ${Math.floor(i / BATCH_SIZE) + 1} 批完成，成功 ${
          successfulResults.length
        }/${batch.length} 個`,
      );

      // 如果不是最後一批，則等待一段時間再處理下一批
      if (i + BATCH_SIZE < bots.length) {
        console.log(`⏳ 等待 ${BATCH_DELAY}ms 後處理下一批...`);
        await sleep(BATCH_DELAY);
      }
    }

    console.log(`✅ 全部處理完成，成功更新 ${updatedBots.length} 個 bots`);

    return NextResponse.json({
      ok: true,
      updated: updatedBots,
      total: bots.length,
      successful: updatedBots.length,
    });
  } catch (err) {
    console.error('❌ 更新時發生錯誤', err);
    return NextResponse.json({ ok: false, error: '更新失敗' }, { status: 500 });
  }
}
