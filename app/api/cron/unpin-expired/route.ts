import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, VoteType } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // 驗證是否為 cron job 請求
  const authHeader = req.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { type }: { type: VoteType } = await req.json();

  try {
    // 找到所有已過期的置頂文章，並取消置頂
    const updated =
      type === 'server'
        ? await prisma.server.updateMany({
            where: {
              pin: true,
              pinExpiry: {
                lte: new Date(), // 小於等於現在時間
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
                lte: new Date(), // 小於等於現在時間
              },
            },
            data: {
              pin: false,
              pinExpiry: null,
            },
          });

    console.log(`Unpinned ${updated.count} expired ${type}s successfully`);
    return NextResponse.json(
      {
        message: 'Cron job completed',
        unpinnedCount: updated.count,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ message: 'Cron job failed' }, { status: 500 });
  }
}
