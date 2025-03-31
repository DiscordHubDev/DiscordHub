import { z } from "zod";

export const addBotSchema = z.object({
  name: z.string().min(2, "名稱至少要 2 個字"),
  description: z.string().min(10, "請輸入機器人簡介（支援 Markdown）"),
  tags: z.array(z.string().min(1)).min(1, "請至少輸入一個分類"),
  category: z.string().min(1, "請選擇分類"),
});