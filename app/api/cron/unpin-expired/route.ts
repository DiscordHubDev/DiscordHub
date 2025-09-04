import { NextRequest, NextResponse } from 'next/server';
import { VoteType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  // 驗證請求來源
  if (
    req.headers.get('Authorization') !== `Bearer ${process.env.API_CRON_TOKEN}`
  ) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { type }: { type: VoteType } = await req.json();

  try {
    // 使用 UTC 時間進行比較
    const nowUTC = new Date();

    const updated =
      type === 'server'
        ? await prisma.server.updateMany({
            where: {
              pin: true,
              pinExpiry: {
                lte: nowUTC, // 使用 UTC 時間比較
              },
            },
            data: {
              pin: false,
              pinExpiry: null,
            },
          })
        : await prisma.bot.updateMany({
            where: {
              pin: true,
              pinExpiry: {
                lte: nowUTC, // 使用 UTC 時間比較
              },
            },
            data: {
              pin: false,
              pinExpiry: null,
            },
          });

    console.log(`Unpinned ${updated.count} expired ${type}s successfully`);
    console.log(`Current UTC time: ${nowUTC.toISOString()}`); // 添加日誌以便調試

    return NextResponse.json(
      {
        message: 'Cron job completed',
        unpinnedCount: updated.count,
        currentTime: nowUTC.toISOString(), // 返回當前時間以便調試
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ message: 'Cron job failed' }, { status: 500 });
  }
}
