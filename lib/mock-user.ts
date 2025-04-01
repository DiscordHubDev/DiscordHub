import type { UserType } from "./types"
import { servers, bots } from "./mock-data"

// 創建模擬用戶數據
export const mockUser: UserType = {
  id: "user1",
  username: "DawnGS",
  email: "user@example.com",
  avatar: "https://i.postimg.cc/ydMd8jtw/discord.webp",
  banner: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&h=300&fit=crop&auto=format",
  bio: "Discord 愛好者，熱愛探索各種有趣的伺服器和機器人。喜歡遊戲、程式設計和動漫。",
  joinedAt: "2022-05-15T08:30:00Z",
  servers: [servers[0], servers[2]], // 用戶擁有的伺服器
  bots: [bots[1], bots[4]], // 用戶擁有的機器人
  favorites: {
    servers: ["1", "4", "6"], // 收藏的伺服器 ID
    bots: ["3", "7", "9"], // 收藏的機器人 ID
  },
  social: {
    discord: "DawnGS#181",
    twitter: "DawnGS181",
    github: "DGSBOT",
    website: "https://dawngs.xyz/",
  },
}

