"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Users, ArrowUp, Bot } from "lucide-react";
import VoteCard from "@/components/vote-card";
import { servers, bots } from "@/lib/mock-data";
import MobileMenu from "@/components/mobile-menu";

export default function VotePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServers, setFilteredServers] = useState(servers);
  const [filteredBots, setFilteredBots] = useState(bots);

  // 處理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.toLowerCase();

    if (!query.trim()) {
      setFilteredServers(servers);
      setFilteredBots(bots);
      return;
    }

    // 過濾伺服器
    const matchedServers = servers.filter(
      (server) =>
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query)
    );

    // 過濾機器人
    const matchedBots = bots.filter(
      (bot) =>
        bot.name.toLowerCase().includes(query) ||
        bot.description.toLowerCase().includes(query)
    );

    setFilteredServers(matchedServers);
    setFilteredBots(matchedBots);
  };

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#5865f2] to-[#8c54ff] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            為您喜愛的伺服器和機器人投票
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            支持您喜愛的 Discord 伺服器和機器人，幫助它們獲得更多曝光和關注
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Input
              placeholder="搜尋伺服器或機器人..."
              className="pl-10 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
              size={20}
            />
            <Button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#5865f2] hover:bg-white/90 hidden sm:flex"
            >
              搜尋
            </Button>
            <Button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-white text-[#5865f2] hover:bg-white/90 sm:hidden"
              size="icon"
            >
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="servers" className="mb-8">
          <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
            <TabsTrigger
              value="servers"
              className="data-[state=active]:bg-[#36393f]"
            >
              伺服器投票
            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="data-[state=active]:bg-[#36393f]"
            >
              機器人投票
            </TabsTrigger>
            <TabsTrigger
              value="top"
              className="data-[state=active]:bg-[#36393f]"
            >
              排行榜
            </TabsTrigger>
          </TabsList>

          {/* 伺服器投票 */}
          <TabsContent value="servers" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">伺服器投票</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServers.map((server) => (
                <VoteCard
                  key={server.id}
                  id={server.id}
                  type="server"
                  name={server.name}
                  description={server.description}
                  icon={server.icon}
                  votes={server.upvotes}
                  members={server.members}
                />
              ))}
            </div>
          </TabsContent>

          {/* 機器人投票 */}
          <TabsContent value="bots" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">機器人投票</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBots.map((bot) => (
                <VoteCard
                  key={bot.id}
                  id={bot.id}
                  type="bot"
                  name={bot.name}
                  description={bot.description}
                  icon={bot.icon}
                  votes={bot.upvotes}
                  servers={bot.servers}
                  verified={bot.verified}
                />
              ))}
            </div>
          </TabsContent>

          {/* 排行榜 */}
          <TabsContent value="top" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 伺服器排行榜 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">伺服器排行榜</h2>
                <div className="bg-[#2b2d31] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#1e1f22] bg-[#36393f]">
                    <h3 className="font-medium">本月最受歡迎伺服器</h3>
                  </div>
                  <div className="divide-y divide-[#1e1f22]">
                    {servers
                      .sort((a, b) => b.upvotes - a.upvotes)
                      .slice(0, 5)
                      .map((server, index) => (
                        <Link
                          href={`/servers/${server.id}`}
                          key={server.id}
                          className="block"
                        >
                          <div className="p-4 hover:bg-[#36393f] transition-colors flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 mr-3">
                              #{index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                              <img
                                src={
                                  server.icon ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                                alt={server.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{server.name}</div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <Users size={12} className="mr-1" />
                                <span>
                                  {server.members.toLocaleString()} 成員
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center text-[#5865f2]">
                              <ArrowUp size={14} className="mr-1" />
                              <span className="font-bold">
                                {server.upvotes.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                  <div className="p-3 border-t border-[#1e1f22] bg-[#36393f]">
                    <Link
                      href="/"
                      className="text-sm text-[#5865f2] hover:underline"
                    >
                      查看所有伺服器
                    </Link>
                  </div>
                </div>
              </div>

              {/* 機器人排行榜 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">機器人排行榜</h2>
                <div className="bg-[#2b2d31] rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-[#1e1f22] bg-[#36393f]">
                    <h3 className="font-medium">本月最受歡迎機器人</h3>
                  </div>
                  <div className="divide-y divide-[#1e1f22]">
                    {bots
                      .sort((a, b) => b.upvotes - a.upvotes)
                      .slice(0, 5)
                      .map((bot, index) => (
                        <Link
                          href={`/bots/${bot.id}`}
                          key={bot.id}
                          className="block"
                        >
                          <div className="p-4 hover:bg-[#36393f] transition-colors flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 mr-3">
                              #{index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                              <img
                                src={
                                  bot.icon ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                                alt={bot.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 flex items-center">
                              <div>
                                <div className="font-medium flex items-center">
                                  {bot.name}
                                  {bot.verified && (
                                    <span className="ml-1 text-[#5865f2]">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-badge-check"
                                      >
                                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                                        <path d="m9 12 2 2 4-4" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center">
                                  <Bot size={12} className="mr-1" />
                                  <span>
                                    {bot.servers.toLocaleString()} 伺服器
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center text-[#5865f2]">
                              <ArrowUp size={14} className="mr-1" />
                              <span className="font-bold">
                                {bot.upvotes.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                  <div className="p-3 border-t border-[#1e1f22] bg-[#36393f]">
                    <Link
                      href="/bots"
                      className="text-sm text-[#5865f2] hover:underline"
                    >
                      查看所有機器人
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-[#2b2d31] mt-12 py-8 border-t border-[#1e1f22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">DiscordList</h3>
              <p className="text-gray-400 text-sm">
                最佳的 Discord
                伺服器和機器人列表平台，幫助您發現和加入有趣的社群，為伺服器增添功能。
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">連結</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    伺服器列表
                  </Link>
                </li>
                <li>
                  <Link href="/bots" className="hover:text-white">
                    機器人列表
                  </Link>
                </li>
                <li>
                  <Link href="/vote" className="hover:text-white">
                    投票
                  </Link>
                </li>
                <li>
                  <Link href="/add-server" className="hover:text-white">
                    新增伺服器
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">資源</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Discord 官方
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    開發者文檔
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    機器人指南
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    常見問題
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">法律</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    服務條款
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    隱私政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie 政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    DMCA
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#1e1f22] flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 DiscordList. 保留所有權利。
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
