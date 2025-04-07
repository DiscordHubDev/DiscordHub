'use server';

import { createId } from '@paralleldrive/cuid2';
import type { EmailPriority } from '@/lib/types';
import { createServerSupabaseClient } from '../server_supabase';

type SendNotificationParams = {
  subject: string;
  teaser: string;
  content?: string;
  priority?: EmailPriority;
  name?: string;
  userId?: string | null;
  isSystem?: boolean;
};

export async function sendNotification({
  subject,
  teaser,
  content,
  priority = 'info',
  name = '系統通知',
  userId = null,
  isSystem = true,
}: SendNotificationParams) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('Notification').insert([
    {
      id: createId(),
      name,
      createdAt: new Date().toISOString(),
      subject,
      teaser,
      content,
      userId,
      priority: priority,
      isSystem: isSystem,
      read: false,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
