import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    // 只檢查官方機器人 token
    if (
      request.headers.get('authorization') !== `Bearer ${process.env.BOT_TOKEN}`
    ) {
      return NextResponse.json(
        {
          message: 'Unauthorized - Official Bot Only',
        },
        { status: 401 },
      );
    }

    const { type } = await request.json();
    const item_id = request.nextUrl.searchParams.get('itemId');

    if (!item_id || !type) {
      return NextResponse.json(
        { message: 'Type and itemId are required' },
        { status: 400 },
      );
    }
    const existing =
      type === 'server'
        ? await prisma.server.findUnique({ where: { id: item_id } })
        : await prisma.bot.findUnique({ where: { id: item_id } });

    if (!existing) {
      return NextResponse.json(
        { message: `${type} with ID ${item_id} not found` },
        { status: 404 },
      );
    }

    // 使用 UTC 時間進行比較
    const nowUTC = new Date();
    if (existing.pin && existing.pinExpiry && existing.pinExpiry > nowUTC) {
      return NextResponse.json({
        message: `${type} 已置頂過`,
        pinned: true,
        pinExpiry: existing.pinExpiry,
      });
    }

    // 設定 12 小時後的 UTC 時間作為過期時間
    const expiryUTC = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const updated =
      type === 'server'
        ? await prisma.server.update({
            where: { id: item_id },
            data: {
              pin: true,
              pinExpiry: expiryUTC,
            },
          })
        : await prisma.bot.update({
            where: { id: item_id },
            data: {
              pin: true,
              pinExpiry: expiryUTC,
            },
          });

    return NextResponse.json({
      message: `${type} (${item_id}) 置頂成功`,
      pinned: false,
      pinExpiry: expiryUTC,
      post: updated,
    });
  } catch (error) {
    console.error(`Error pinning by official bot:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
