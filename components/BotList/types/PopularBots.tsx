import React from "react";
import { Bot } from "./BotTypes";
import { useRouter } from "next/navigation";

const bots: Bot[] = [
  {
    name: "DGS弦樂式",
    description:
      "音樂已復活穩定！商用伺服器🤖AI人工智能系統、🎹音樂及歌單功能（可顯示歌詞，支持YT、Spotify、YT Music、bilibili、SoundCloud連結及關鍵字）、各種防護功能、客戶單系統、動態語音房、投票系統、各種遊戲娛樂功能、自定義功能、各種定時通知功能、身份組及管理功能、各種日誌紀錄",
    tags: ["娛樂", "管理", "音樂", "小工具", "小遊戲"],
    votes: 181181,
    status: "上線中",
    servers: 10500,
    isVerified: true,
  },
  {
    name: "YEE式機器龍",
    description:
      "一隻全中文的機器人，並結合了音樂系統、RPG、動態語音頻道、跨群聊天等功能，讓Discord不再只是聊天軟體",
    tags: ["娛樂", "管理", "音樂", "小工具", "小遊戲"],
    votes: 143020,
    status: "上線中",
    servers: 320000,
    isVerified: true,
  },
  {
    name: "桜の夜",
    description:
      "遊戲、音樂與安全的結合！ 服務包含音樂播放(支援Youtube、Spotify、SoundCloud連結及關鍵字播放)，各種簡單的管理功能和最新災害資訊，以及各種有趣的休閒小遊戲",
    tags: ["娛樂", "管理", "音樂"],
    votes: 350,
    status: "上線中",
    servers: 7730,
    isVerified: true,
  },
];

const PopularBotsList: React.FC = () => {
  const router = useRouter();

  const handleBotClick = (botId: string) => {
    router.push(`/thebots/${botId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2"># 熱門機器人</h2>
      <div className="flex space-x-2 overflow-x-auto">
        {[...new Set(bots.flatMap((bot) => bot.tags))].map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-700 rounded-md text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      {bots.map((bot, index) => (
        <div
          key={index}
          className="p-4 border-b border-gray-700"
          onClick={() => handleBotClick(bot.name)} // 这里用bot.name作为标识，实际应用中应该用唯一ID
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">{bot.name}</h3>
            <div className="flex space-x-2">
              {bot.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-gray-700 rounded-md text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm mb-2">{bot.description}</p>
          <div className="flex space-x-2 items-center">
            <div className="flex items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7-7 7 7"
                />
              </svg>
              <span className="text-xs">{bot.votes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17l-4-4m0 0l-4 4m4-4v12"
                />
              </svg>
              <span className="text-xs">{bot.status}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                />
              </svg>
              <span className="text-xs">{bot.servers}</span>
            </div>
            {bot.isVerified && (
              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md">
                Discord驗證機器人
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularBotsList;
