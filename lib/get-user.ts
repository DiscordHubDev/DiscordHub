import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

import { upsertUserFromSession } from '@/lib/actions/user';
import { UserType } from './prisma_type';

export async function getUser(): Promise<UserType | null> {
  const session = await getServerSession(authOptions);
  return upsertUserFromSession(session!);
}

export type { UserType };
