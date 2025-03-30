import React from "react";
import { Server } from "./serverTypes";

const servers: Server[] = [
  {
    name: "Laibilia General Affairs Bureau",
    description:
      "您是一個身懷絕技又愛挑戰任何危險事務的人?您是一個為追求完美達成目標而不擇手段的人?您是一個喜歡上成為特務間諜如此神秘感的人?那麼向事務總局的招募人員遞交您的報名表！",
    tags: ["遊戲", "社群", "GTA", "休閒", "交友"],
    members: 81,
    likes: 14,
    rank: 1,
  },
  {
    name: "AARON",
    description:
      "這個俱樂部有10多個機械人至於功能是什麼就等你加入俱樂部探索！這個俱樂部還有交易頻道和抽獎！！",
    tags: ["社群", "Roblox", "休閒", "交友"],
    members: 76,
    likes: 47,
    rank: 2,
  },
  {
    name: "星の空",
    description: "星の空是一個新興伺服器",
    tags: ["遊戲", "Minecraft", "APEX", "Valorant"],
    members: 232,
    likes: 3,
    rank: 3,
    event: {
      start: "2024/11/24 20:30",
      end: "2025/11/25 23:45",
      status: "尚未開始",
      creator: "starrysky10507",
      reward: "伺服器200人抽10個Discord Nitro",
    },
  },
  {
    name: "VRChat // VRGame",
    description: "本群在遊戲方面主打VRChat，讓這裡成為VRChat常駐玩家的集合點",
    tags: ["遊戲", "社群", "交友"],
    members: 787,
    likes: 85,
    rank: 15,
  },
];

const PopularServers: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2"># 熱門伺服器</h2>
      <div className="flex space-x-2 overflow-x-auto mb-4 max-w-full">
        {[
          "遊戲",
          "社群",
          "GTA",
          "休閒",
          "交友",
          "Minecraft",
          "APEX",
          "Valorant",
          "Roblox",
        ].map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-700 rounded-md text-sm whitespace-nowrap"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="space-y-4">
        {servers.map((server, index) => (
          <div key={index} className="p-4 border-b border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <h3 className="text-lg font-bold mb-2 md:mb-0">{server.name}</h3>
              <div className="flex flex-wrap gap-2">
                {server.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-700 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm mb-2">{server.description}</p>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex space-x-2 items-center mb-2 md:mb-0">
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
                  <span className="text-xs">{server.rank}</span>
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
                  <span className="text-xs">{server.members}</span>
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
                  <span className="text-xs">{server.likes}</span>
                </div>
              </div>
              {server.event && (
                <div className="mt-2 text-xs text-gray-400">
                  <div className="flex flex-wrap gap-2">
                    <div>
                      <span className="font-bold">開始時間：</span>
                      <span>{server.event.start}</span>
                    </div>
                    <div>
                      <span className="font-bold">結束時間：</span>
                      <span>{server.event.end}</span>
                    </div>
                    <div>
                      <span className="font-bold">狀態：</span>
                      <span>{server.event.status}</span>
                    </div>
                    <div>
                      <span className="font-bold">建立者：</span>
                      <span>{server.event.creator}</span>
                    </div>
                  </div>
                  <p className="mt-1">{server.event.reward}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularServers;
