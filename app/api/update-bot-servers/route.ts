import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 對內部 API 發送請求，拿 bot 的 server count
async function fetchBotServerCount(botId: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/api/get_bot_server_count`,
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
    return data.server_count ?? null;
  } catch (error) {
    console.error(`❌ ${botId} 發生錯誤：`, error);
    return null;
  }
}

export async function GET() {
  try {
    const bots = await prisma.bot.findMany();

    for (const bot of bots) {
      const count = await fetchBotServerCount(bot.id);

      if (count !== null) {
        await prisma.bot.update({
          where: { id: bot.id },
          data: {
            servers: count,
          },
        });
      }

      await sleep(3000);
    }

    return NextResponse.json({ ok: true, updated: bots.length });
  } catch (err) {
    console.error('❌ 更新時發生錯誤', err);
    return NextResponse.json({ ok: false, error: '更新失敗' }, { status: 500 });
  }
}
