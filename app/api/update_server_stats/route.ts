import { getAllServerIdsChunked } from '@/lib/actions/servers';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.BOT_TOKEN;
const BATCH_SIZE = 10; // 每批處理的伺服器數量
const DELAY_BETWEEN_BATCHES = 2000; // 批次間延遲（毫秒）

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

async function updateServerStats(guildId: string) {
  const data = await safeFetchWithRateLimit(
    `https://discord.com/api/guilds/${guildId}?with_counts=true`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    },
  );

  if (!data) {
    console.log(`Skipping guildId ${guildId} - no data received`);
    return;
  }

  const updateData = {
    ...(data.name != null && { name: data.name }),
    ...(data.icon != null && {
      icon: `https://cdn.discordapp.com/icons/${guildId}/${data.icon}.png`,
    }),
    ...(data.banner != null && {
      banner: `https://cdn.discordapp.com/banners/${guildId}/${data.banner}.png`,
    }),
    members: data.approximate_member_count,
    online: data.approximate_presence_count,
  };

  console.log('Updating server stats for guildId:', guildId);
  console.log('Update data:', updateData);

  try {
    await prisma.server.update({
      where: { id: guildId },
      data: updateData,
    });
    console.log(`Successfully updated guildId: ${guildId}`);
  } catch (error) {
    console.error(`Failed to update guildId ${guildId}:`, error);
  }
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
      `Processing batch ${i + 1}/${batches.length} with ${batch.length} servers`,
    );

    // 並行處理當前批次的所有伺服器
    const batchPromises = batch.map(async guildId => {
      try {
        await updateServerStats(guildId);
        successCount++;
      } catch (error) {
        console.error(`Error processing guildId ${guildId}:`, error);
        errorCount++;
      }
      processedCount++;
    });

    // 等待當前批次完成
    await Promise.allSettled(batchPromises);

    console.log(
      `Batch ${i + 1} completed. Progress: ${processedCount}/${serverIds.length}`,
    );

    // 在批次間添加延遲以避免 rate limiting
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
