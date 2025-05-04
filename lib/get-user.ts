import { authOptions } from '@/lib/utils';
import { getServerSession } from 'next-auth';

import { upsertUserFromSession } from '@/lib/actions/user';
import { UserType } from './prisma_type';

export async function getUser(): Promise<UserType | null> {
  const session = await getServerSession(authOptions);
  return upsertUserFromSession(session!.discordProfile!);
}

export type { UserType };
