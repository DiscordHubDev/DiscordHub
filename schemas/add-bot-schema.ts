import { z } from 'zod';

export const botFormSchema = z.object({
  botName: z.string().min(1, { message: '機器人名稱為必填' }),
  botPrefix: z.string().min(1, { message: '機器人前綴為必填' }),
  botDescription: z
    .string()
    .min(20, { message: '簡短描述最少需20字' })
    .max(200, { message: '簡短描述最多 200 字' }),
  botLongDescription: z
    .string()
    .min(50, { message: '詳細描述最少需50字' })
    .max(2000, { message: '詳細描述最多 2000 字' })
    .optional(),
  botInvite: z
    .string()
    .url({ message: '必須是有效的網址' })
    .refine(
      url => {
        try {
          const u = new URL(url);
          return (
            u.hostname === 'discord.com' &&
            u.pathname === '/oauth2/authorize' &&
            u.searchParams.has('client_id')
          );
        } catch {
          return false;
        }
      },
      {
        message: '請輸入有效的 Discord 機器人邀請連結',
      },
    ),
  botWebsite: z
    .string()
    .url({ message: '請輸入有效的網站連結' })
    .or(z.literal(''))
    .optional(),
  botSupport: z
    .string()
    .url({ message: '請輸入有效的支援伺服器連結' })
    .or(z.literal(''))
    .optional(),
  developers: z
    .array(
      z.object({
        name: z.string().min(1, '請輸入開發者 ID'),
      }),
    )
    .min(1, '至少需要一位開發者'),
  commands: z.array(
    z.object({
      name: z.string().min(1, { message: '指令名稱為必填' }),
      description: z.string().min(1, { message: '描述為必填' }),
      usage: z.string().min(1, { message: '用法為必填' }),
      category: z.string().optional(),
    }),
  ),
  tags: z
    .array(z.string())
    .min(1, { message: '請至少選擇一個標籤' })
    .max(5, { message: '最多選擇 5 個標籤' }),
  secret: z.string().min(1).optional(),
  webhook_url: z.string().url().optional(),
});
