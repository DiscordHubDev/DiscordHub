'use server';

import { VoteType } from '@/lib/prisma_type';
import { getUser } from '../get-user';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function Pin(itemId: string, itemType: string) {
  const user = await getUser();
  const userId = user?.id;

  const normalizedType = itemType.toLowerCase() as VoteType;

  if (!userId) {
    return { success: false, error: 'NOT_LOGGED_IN' };
  }

  const req = await fetch(`${baseUrl}/api/pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item_id: itemId,
      type: normalizedType,
    }),
  });

  const pin = await req.json();

  const remaining = pin.pinExpiry
    ? Math.ceil((new Date(pin.pinExpiry).getTime() - Date.now()) / 1000)
    : 0;

  if (pin.pinned) {
    return { success: false, error: 'COOLDOWN', remaining };
  }

  return { success: true, remaining: remaining, pinned: pin.pinned };
}
