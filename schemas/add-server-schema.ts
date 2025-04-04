import { z } from "zod";

export const ServerFormSchema = z.object({
  serverName: z.string().min(1, { message: "伺服器名稱為必填項" }),
  shortDescription: z
    .string()
    .min(1, { message: "簡短描述為必填項" })
    .max(200, { message: "簡短描述最多 200 字" }),
  longDescription: z
    .string()
    .max(2000, { message: "詳細描述最多 2000 字" })
    .optional(),
  inviteLink: z.string().url({ message: "請輸入有效的 Discord 邀請連結" }),
  websiteLink: z.string().url({ message: "請輸入有效的網站連結" }).optional(),
  servertags: z
    .array(z.string())
    .min(1, { message: "請至少選擇一個標籤" })
    .max(5, { message: "最多選擇 5 個標籤" }),
});
