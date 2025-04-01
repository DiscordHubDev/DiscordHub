"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bot, Star, Settings, Plus } from "lucide-react";
import UserHeader from "@/components/user-header";
import { mockUser } from "@/lib/mock-user";
import { servers, bots } from "@/lib/mock-data";

export default function ProfilePage() {
  const [user] = useState(mockUser);

  // 獲取用戶收藏的伺服器和機器人
  const favoriteServers = servers.filter((server) =>
    user.favorites.servers.includes(server.id)
  );
  const favoriteBots = bots.filter((bot) =>
    user.favorites.bots.includes(bot.id)
  );

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Navigation */}
      <nav className="bg-[#2b2d31] border-b border-[#1e1f22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="text-xl font-bold text-white flex items-center"
                >
                  <span className="text-[#5865f2] mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square-more"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 10h.01" />
                      <path d="M12 10h.01" />
                      <path d="M16 10h.01" />
                    </svg>
                  </span>
                  DiscordHubs
                </Link>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  <Link href="/" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f]"
                    >
                      伺服器列表
                    </Button>
                  </Link>
                  <Link href="/bots" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f]"
                    >
                      機器人列表
                    </Button>
                  </Link>
                  <Link href="/add-server" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f]"
                    >
                      新增伺服器
                    </Button>
                  </Link>
                  <Link href="/add-bot" passHref>
                    <Button
                      variant="ghost"
                      className="text-white hover:bg-[#36393f]"
                    >
                      新增機器人
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Link href="/profile">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  個人資料
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* User Header */}
      <UserHeader user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="servers" className="mb-8">
          <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
            <TabsTrigger
              value="servers"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Users size={16} className="mr-2" />
              我的伺服器
            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Bot size={16} className="mr-2" />
              我的機器人
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Star size={16} className="mr-2" />
              我的收藏
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Settings size={16} className="mr-2" />
              帳號設置
            </TabsTrigger>
          </TabsList>

          {/* 我的伺服器 */}
          <TabsContent value="servers" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">我的伺服器</h2>
              <Link href="/add-server">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                  <Plus size={16} className="mr-2" />
                  新增伺服器
                </Button>
              </Link>
            </div>

            {user.servers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.servers.map((server) => (
                  <Link
                    href={`/servers/${server.id}`}
                    key={server.id}
                    className="block"
                  >
                    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                            <img
                              src={
                                server.icon ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={server.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-white">
                              {server.name}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {server.members.toLocaleString()} 成員
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {server.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {server.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#36393f] text-gray-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
                        >
                          管理伺服器
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">您還沒有創建任何伺服器</p>
                <Link href="/add-server">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                    <Plus size={16} className="mr-2" />
                    新增伺服器
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 我的機器人 */}
          <TabsContent value="bots" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">我的機器人</h2>
              <Link href="/add-bot">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                  <Plus size={16} className="mr-2" />
                  新增機器人
                </Button>
              </Link>
            </div>

            {user.bots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.bots.map((bot) => (
                  <Link href={`/bots/${bot.id}`} key={bot.id} className="block">
                    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                            <img
                              src={
                                bot.icon ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={bot.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center">
                            <CardTitle className="text-white">
                              {bot.name}
                            </CardTitle>
                            {bot.verified && (
                              <span className="ml-2 text-[#5865f2]">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
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
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {bot.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {bot.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#36393f] text-gray-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mt-2">
                          <Users size={14} className="mr-1" />
                          <span>{bot.servers.toLocaleString()} 伺服器</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
                        >
                          管理機器人
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">您還沒有創建任何機器人</p>
                <Link href="/add-bot">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                    <Plus size={16} className="mr-2" />
                    新增機器人
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 我的收藏 */}
          <TabsContent value="favorites" className="mt-6">
            <div className="space-y-8">
              {/* 收藏的伺服器 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">收藏的伺服器</h2>
                {favoriteServers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteServers.map((server) => (
                      <Link
                        href={`/servers/${server.id}`}
                        key={server.id}
                        className="block"
                      >
                        <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                                <img
                                  src={
                                    server.icon ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={server.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <CardTitle className="text-white">
                                  {server.name}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  {server.members.toLocaleString()} 成員
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {server.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2b2d31] rounded-lg p-6 text-center">
                    <p className="text-gray-300">您還沒有收藏任何伺服器</p>
                  </div>
                )}
              </div>

              {/* 收藏的機器人 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">收藏的機器人</h2>
                {favoriteBots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteBots.map((bot) => (
                      <Link
                        href={`/bots/${bot.id}`}
                        key={bot.id}
                        className="block"
                      >
                        <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                                <img
                                  src={
                                    bot.icon ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={bot.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center">
                                <CardTitle className="text-white">
                                  {bot.name}
                                </CardTitle>
                                {bot.verified && (
                                  <span className="ml-2 text-[#5865f2]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
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
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {bot.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2b2d31] rounded-lg p-6 text-center">
                    <p className="text-gray-300">您還沒有收藏任何機器人</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 帳號設置 */}
          <TabsContent value="settings" className="mt-6">
            <div className="bg-[#2b2d31] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">帳號設置</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      用戶名
                    </label>
                    <input
                      type="text"
                      defaultValue={user.username}
                      className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      電子郵件
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    個人簡介
                  </label>
                  <textarea
                    defaultValue={user.bio}
                    rows={4}
                    className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">社交連結</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Discord
                      </label>
                      <input
                        type="text"
                        defaultValue={user.social.discord}
                        className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Twitter
                      </label>
                      <input
                        type="text"
                        defaultValue={user.social.twitter}
                        className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        GitHub
                      </label>
                      <input
                        type="text"
                        defaultValue={user.social.github}
                        className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        個人網站
                      </label>
                      <input
                        type="text"
                        defaultValue={user.social.website}
                        className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">更改密碼</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        當前密碼
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        新密碼
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 bg-[#36393f] border border-[#1e1f22] rounded-md text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                    保存更改
                  </Button>
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
              <h3 className="text-lg font-semibold mb-4">DiscordHubs</h3>
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
                  <Link href="/add-server" className="hover:text-white">
                    新增伺服器
                  </Link>
                </li>
                <li>
                  <Link href="/add-bot" className="hover:text-white">
                    新增機器人
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
              © 2025 DiscordHubs. 保留所有權利。
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
