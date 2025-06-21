import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { VoteType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { type, item_id }: { type: VoteType; item_id: string } =
      await request.json();

    if (!item_id) {
      return NextResponse.json(
        { message: 'Type ID is required' },
        { status: 400 },
      );
    }

    // 先查詢是否已經被 pin
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

    if (existing.pin && existing.pinExpiry && existing.pinExpiry > new Date()) {
      return NextResponse.json({
        message: `${type} already pinned`,
        pinned: true,
        pinExpiry: existing.pinExpiry,
      });
    }

    // 尚未 pin 或已過期，則設定 pin 與期限
    const expiry = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const updated =
      type === 'server'
        ? await prisma.server.update({
            where: { id: item_id },
            data: {
              pin: true,
              pinExpiry: expiry,
            },
          })
        : await prisma.bot.update({
            where: { id: item_id },
            data: {
              pin: true,
              pinExpiry: expiry,
            },
          });

    return NextResponse.json({
      message: `${type} (${item_id}) pinned successfully`,
      pinned: false,
      pinExpiry: expiry,
      post: updated,
    });
  } catch (error) {
    console.error(`Error pinning:`, error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
