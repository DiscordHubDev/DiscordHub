'use server';

import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';
import { getUser } from '../get-user';
import { UserType } from '../prisma_type';
import { JWTDiscordProfile } from '@/app/types/next-auth';
import { unstable_cache } from 'next/cache';

type UpdateState = {
  success?: string;
  error?: string;
};

export async function GetUserBySession(session: Session) {
  if (!session?.discordProfile) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.discordProfile.id },
    include: {
      favoriteServers: true,
      favoriteBots: true,
      ownedServers: true,
      developedBots: true,
      adminIn: true,
    },
  });

  return user;
}

export async function upsertUserFromSession(profile: JWTDiscordProfile) {
  if (!profile) return null;

  const { id, global_name, image_url, banner_url, banner_color, username } =
    profile;

  const user = await prisma.user.upsert({
    where: { id },
    create: {
      id,
      username: global_name ?? username,
      avatar: image_url,
      banner: banner_url,
      banner_color: banner_color || null,
    },
    update: {
      username: global_name ?? username,
      avatar: image_url,
      banner: banner_url,
      banner_color: banner_color || null,
    },
    include: {
      favoriteServers: true,
      favoriteBots: true,
      ownedServers: true,
      developedBots: true,
      adminIn: true,
    },
  });

  return user;
}

export async function updateUserSettings(
  prevState: UpdateState,
  formData: FormData,
): Promise<UpdateState> {
  const user = await getUser();
  if (!user) return { error: '未登入' };

  const rawBio = formData.get('bio');
  const bio = typeof rawBio === 'string' ? rawBio : '';

  const socialFromForm = Object.fromEntries(
    [...formData.entries()]
      .filter(([key]) => key.startsWith('social.'))
      .map(([key, value]) => [
        key.replace('social.', ''),
        typeof value === 'string' ? value : '',
      ]),
  );

  const updateData: { bio?: string; social?: Record<string, string> } = {};

  if ((user.bio ?? '') !== bio) {
    updateData.bio = bio;
  }

  const currentSocial = (user.social ?? {}) as Record<string, string>;
  const changedSocial: Record<string, string> = {};

  for (const key in socialFromForm) {
    const newVal = socialFromForm[key];
    const oldVal = currentSocial[key] ?? '';
    if (newVal !== oldVal) {
      changedSocial[key] = newVal;
    }
  }

  if (Object.keys(changedSocial).length > 0) {
    updateData.social = {
      ...currentSocial,
      ...changedSocial,
    };
  }

  if (Object.keys(updateData).length === 0) {
    return { success: '沒有任何變更' };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return { success: '已成功儲存' };
  } catch (error) {
    console.error(error);
    return { error: '儲存失敗' };
  }
}

export const getCachedUser = unstable_cache(
  async (id: string) => {
    if (!id) return null;
    return await getUserById(id);
  },
  ['get-user'],
  { revalidate: 60 },
);

export async function getUserById(id: string): Promise<UserType | null> {
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      favoriteServers: true,
      favoriteBots: true,
      ownedServers: true,
      developedBots: true,
      adminIn: true,
    },
    cacheStrategy: { ttl: 60 },
  });

  return user;
}
