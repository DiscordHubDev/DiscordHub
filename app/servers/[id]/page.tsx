"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ArrowUp, Clock, Globe } from "lucide-react";
import { servers } from "@/lib/mock-data";
import type { ServerType } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import Link from "next/link";
import VoteButton from "@/components/vote-button";

export default function ServerDetailPage() {
  const params = useParams();
  const [server, setServer] = useState<ServerType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 在實際應用中，這裡會從 API 獲取伺服器詳細資訊
    const foundServer = servers.find((s) => s.id === params.id);

    if (foundServer) {
      setServer(foundServer);
    }

    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1f22] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5865f2]"></div>
      </div>
    );
  }

  if (!server) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Banner */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-[#36393f] overflow-hidden">
        <img
          src={server.banner || "/placeholder.svg?height=300&width=1200"}
          alt={`${server.name} banner`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f22] opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 伺服器圖標和基本資訊 */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#36393f] border-4 border-[#1e1f22] overflow-hidden">
              <img
                src={server.icon || "/placeholder.svg?height=128&width=128"}
                alt={server.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {server.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mt-2">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{server.members.toLocaleString()} 成員</span>
                </div>
                <div className="flex items-center">
                  <ArrowUp size={16} className="mr-1" />
                  <span>{server.upvotes.toLocaleString()} 投票</span>
                </div>
                {server.online && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span>{server.online.toLocaleString()} 在線</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(server.createdAt), {
                      addSuffix: true,
                      locale: zhTW,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 加入伺服器按鈕 */}
        </div>

        {/* 加入伺服器按鈕 */}
        <div className="mt-6 mb-4">
          <Button
            size="lg"
            className="w-full md:w-auto bg-[#5865f2] hover:bg-[#4752c4] text-white"
          >
            加入伺服器
          </Button>
        </div>

        {/* 標籤 */}
        <div className="flex flex-wrap gap-2 mt-6">
          {server.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 主要內容 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* 側邊欄 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  關於伺服器
                </TabsTrigger>
                <TabsTrigger
                  value="rules"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  規則
                </TabsTrigger>
                <TabsTrigger
                  value="screenshots"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  截圖
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">伺服器介紹</h2>
                  <p className="text-gray-300 whitespace-pre-line mb-6">
                    {server.longDescription}
                  </p>

                  {server.features && server.features.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">伺服器特色</h3>
                      <ul className="space-y-2 text-gray-300">
                        {server.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-[#5865f2] mr-2">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rules" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">伺服器規則</h2>
                  {server.rules && server.rules.length > 0 ? (
                    <ol className="space-y-4 text-gray-300 list-decimal pl-5">
                      {server.rules.map((rule, index) => (
                        <li key={index} className="pl-2">
                          {rule}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400">此伺服器尚未提供規則。</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="screenshots" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">伺服器截圖</h2>
                  {server.screenshots && server.screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {server.screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden bg-[#36393f]"
                        >
                          <img
                            src={screenshot || "/placeholder.svg"}
                            alt={`${server.name} screenshot ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">此伺服器尚未提供截圖。</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">伺服器資訊</h3>
              <div className="space-y-4">
                {server.owner && (
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">擁有者:</span>
                    <span className="text-gray-300">{server.owner}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="text-gray-400 w-24">創建於:</span>
                  <span className="text-gray-300">
                    {new Date(server.createdAt).toLocaleDateString("zh-TW")}
                  </span>
                </div>
                {server.website && (
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">網站:</span>
                    <a
                      href={server.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5865f2] hover:underline flex items-center"
                    >
                      <Globe size={14} className="mr-1" />
                      <span>訪問網站</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
            {/* 投票卡片 */}
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">支持此伺服器</h3>
              <p className="text-gray-300 text-sm mb-4">
                喜歡這個伺服器嗎？投票支持它，幫助更多人發現這個伺服器！
              </p>
              <div className="bg-[#36393f] p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">當前票數</span>
                  <div className="flex items-center text-[#5865f2]">
                    <ArrowUp size={16} className="mr-1" />
                    <span className="font-bold">
                      {server.upvotes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <VoteButton
                id={server.id}
                type="server"
                initialVotes={server.upvotes}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4]"
              />
              <p className="text-gray-400 text-xs mt-2 text-center">
                每 12 小時可投一次票
              </p>
            </div>
            <div className="bg-[#2b2d31] rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">相關伺服器</h3>
              <div className="space-y-3">
                {servers
                  .filter(
                    (s) =>
                      s.id !== server.id &&
                      s.tags.some((tag) => server.tags.includes(tag))
                  )
                  .slice(0, 3)
                  .map((relatedServer) => (
                    <Link
                      key={relatedServer.id}
                      href={`/servers/${relatedServer.id}`}
                      className="flex items-center p-2 rounded hover:bg-[#36393f] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                        <img
                          src={
                            relatedServer.icon ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={relatedServer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{relatedServer.name}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Users size={12} className="mr-1" />
                          <span>
                            {relatedServer.members.toLocaleString()} 成員
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2b2d31] mt-12 py-8 border-t border-[#1e1f22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">DiscordList</h3>
              <p className="text-gray-400 text-sm">
                最佳的 Discord 伺服器列表平台，幫助您發現和加入有趣的社群。
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">連結</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    首頁
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
                    社群指南
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
