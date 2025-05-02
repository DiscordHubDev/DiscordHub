import { NextResponse } from 'next/server';
import { getBotGuildIds } from '@/lib/utils';
import { getAllServerIdsChunked } from '@/lib/actions/servers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const botGuildIds = await getBotGuildIds();

    const allPublishedIds = await getAllServerIdsChunked();
    const toDelete = allPublishedIds.filter(id => !botGuildIds.includes(id));

    const deleteResult = await prisma.server.deleteMany({
      where: { id: { in: toDelete } },
    });

    return NextResponse.json({
      deletedCount: deleteResult.count,
      deletedIds: toDelete,
    });
  } catch (error: any) {
    console.error('❌ sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 },
    );
  }
}
