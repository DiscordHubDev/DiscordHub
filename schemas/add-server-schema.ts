import { z } from 'zod';

export const ServerFormSchema = z.object({
  serverName: z.string().min(1, { message: '伺服器名稱為必填項' }),
  shortDescription: z
    .string()
    .min(1, { message: '簡短描述為必填項' })
    .max(200, { message: '簡短描述最多 200 字' }),
  longDescription: z
    .string()
    .min(50, { message: '詳細描述最少需50字' })
    .max(2000, { message: '詳細描述最多 2000 字' })
    .optional(),
  inviteLink: z
    .string()
    .url({ message: '請輸入有效的 Discord 邀請連結' })
    .refine(
      url => {
        try {
          const u = new URL(url);
          return u.hostname === 'discord.gg' || u.pathname === '/invite';
        } catch {
          return false;
        }
      },
      {
        message: '請輸入有效的邀請連結',
      },
    ),
  websiteLink: z
    .string()
    .url({ message: '請輸入有效的網站連結' })
    .or(z.literal(''))
    .optional(),
  tags: z
    .array(z.string())
    .min(1, { message: '請至少選擇一個標籤' })
    .max(5, { message: '最多選擇 5 個標籤' }),
  rules: z.array(z.string().min(1, { message: '請填寫規則內容' })).optional(),
  secret: z.string().trim().min(1, { message: '請至少輸入一個字' }).optional(),
  webhook_url: z.string().url({ message: '請輸入正確的連結' }).optional(),
});
