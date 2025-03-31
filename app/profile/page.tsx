"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BotCard from "@/components/ui/website/profile/botcard";
import AddBotDialog from "@/components/ui/website/profile/BotDialog";
import ItemCard from "@/components/ui/website/profile/card";
import { BotIcon, ServerIcon } from "lucide-react";
import { useState } from "react";
import AddServerDialog from "@/components/ui/website/profile/ServerDialog";

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"bot" | "server">("bot");

  const bots = [
    {
      id: "bot-1",
      name: "音樂機器人",
      description: "播放音樂",
      tags: ["音樂"],
    },
  ];

  const servers = [
    {
      id: "srv-1",
      name: "開發者基地",
      description: "開發者交流",
      tags: ["技術"],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">我的頁面</h1>
        {activeTab === "bot" ? <AddBotDialog /> : <AddServerDialog />}
      </div>

      <Tabs
        defaultValue="bot"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "bot" | "server")}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="bot">我的機器人</TabsTrigger>
          <TabsTrigger value="server">我的伺服器</TabsTrigger>
        </TabsList>

        <TabsContent value="bot" className="space-y-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} data={bot} />
          ))}
        </TabsContent>

        <TabsContent value="server" className="space-y-4">
          {servers.map((server) => (
            <ItemCard
              key={server.id}
              title={server.name}
              description={server.description}
              icon={<ServerIcon className="w-5 h-5 text-blue-500" />}
              tags={server.tags}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
