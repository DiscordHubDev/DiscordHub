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
  userIds?: Array<string | null>;
  isSystem?: boolean;
};

export async function sendNotification({
  subject,
  teaser,
  content,
  priority = 'info',
  name = '系統通知',
  userIds = [], // 改為接收一個 id 列表，默認為空數組
  isSystem = true,
}: SendNotificationParams) {
  const supabase = createServerSupabaseClient();

  // 如果沒有提供 userIds，則設置為 [null]，表示廣播通知
  if (userIds.length === 0) userIds = [null];

  const notifications = userIds.map(userId => ({
    id: createId(),
    name,
    createdAt: new Date().toISOString(),
    subject,
    teaser,
    content,
    userId, // 每個通知對應一個 userId
    priority,
    isSystem,
    read: false,
  }));

  const { error } = await supabase.from('Notification').insert(notifications);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
