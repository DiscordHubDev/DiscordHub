'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  ArrowUp,
  Clock,
  Globe,
  MessageSquare,
  Terminal,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Link from 'next/link';
import VoteButton from '@/components/vote-button';

import { BotWithFavorites, BotWithRelations } from '@/lib/prisma_type';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FavoriteButton } from '@/components/favorite-button';
import { ReportDialog } from '@/components/ReportDialog';

type BotDetailProps = {
  allBots: BotWithRelations[];
  bot: BotWithFavorites;
  isFavorited: boolean;
};

export default function BotDetailClient({
  bot,
  allBots,
  isFavorited,
}: BotDetailProps) {
  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* Banner */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-[#36393f] overflow-hidden">
        {bot.banner ? (
          <div className="relative w-full h-full">
            <img
              src={bot.banner || '/placeholder.svg?height=300&width=1200'}
              alt={`${bot.name} banner`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f22] opacity-60" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#5865f2] to-[#8c54ff]" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 機器人圖標和基本資訊 */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#36393f] border-4 border-[#1e1f22] overflow-hidden">
              <Avatar className="w-32 h-32">
                {' '}
                {/* 你可以自由調整尺寸 */}
                <AvatarImage src={bot.icon || undefined} alt={bot.name} />
                <AvatarFallback>{bot.name?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {bot.name}
                </h1>
                {bot.verified && (
                  <span className="ml-2 text-[#5865f2]">
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
                      className="lucide lucide-badge-check"
                    >
                      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300 mt-2">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  <span>{bot.servers.toLocaleString()} 伺服器</span>
                </div>
                <div className="flex items-center">
                  <ArrowUp size={16} className="mr-1" />
                  <span>{bot.upvotes.toLocaleString()} 投票</span>
                </div>
                {bot.prefix && (
                  <div className="flex items-center">
                    <Terminal size={16} className="mr-1" />
                    <span className="font-mono bg-[#36393f] px-1.5 py-0.5 rounded text-xs">
                      {bot.prefix}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>
                    {formatDistanceToNow(new Date(bot.approvedAt!), {
                      addSuffix: true,
                      locale: zhTW,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 標籤 */}
        <div className="flex flex-wrap gap-2 mt-6">
          {bot.tags.map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-[#36393f] hover:bg-[#4f545c] text-gray-300"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 邀請機器人按鈕 */}
        <div className="mt-6 mb-4 flex flex-wrap gap-x-4 gap-y-4">
          <Button
            size="lg"
            className="w-full md:w-auto bg-[#5865f2] hover:bg-[#4752c4] text-white transition-all duration-150 transform hover:scale-105"
          >
            邀請機器人
          </Button>

          <ReportDialog itemId={bot.id} itemName={bot.name} type="bot" />
          <FavoriteButton target="bot" id={bot.id} isFavorited={isFavorited} />
        </div>

        {/* 主要內容 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* 側邊欄 */}
          <div className="lg:col-span-1">
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">機器人資訊</h3>
              <div className="space-y-4">
                {bot.developers && (
                  <div className="mb-4">
                    <h4 className="text-gray-400 mb-2">開發者</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 group rounded-lg transition duration-200 hover:bg-white/10 transform group-hover:-translate-y-1">
                      {bot.developers.map(dev => (
                        <Link
                          key={dev.id}
                          href={`/users/${dev.id}`}
                          className=""
                        >
                          <div className="flex items-center p-4 space-x-4 transition duration-200 group">
                            <img
                              src={dev.avatar}
                              alt={`${dev.username} avatar`}
                              className="w-10 h-10 rounded-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                            />
                            <p className="font-medium whitespace-nowrap transition-colors duration-200">
                              {dev.username}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <span className="text-gray-400 w-24">創建於:</span>
                  <span className="text-gray-300">
                    {new Date(bot.approvedAt!).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                {bot.website && (
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">網站:</span>
                    <a
                      href={bot.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5865f2] hover:underline flex items-center"
                    >
                      <Globe size={14} className="mr-1" />
                      <span>訪問網站</span>
                    </a>
                  </div>
                )}
                {bot.supportServer && (
                  <div className="flex items-center">
                    <span className="text-gray-400 w-24">支援伺服器:</span>
                    <a
                      href={bot.supportServer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5865f2] hover:underline flex items-center"
                    >
                      <MessageSquare size={14} className="mr-1" />
                      <span>加入支援伺服器</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 投票卡片 */}
            <div className="bg-[#2b2d31] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-4">支持此機器人</h3>
              <p className="text-gray-300 text-sm mb-4">
                喜歡這個機器人嗎？投票支持它，幫助更多人發現這個機器人！
              </p>
              <div className="bg-[#36393f] p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">當前票數</span>
                  <div className="flex items-center text-[#5865f2]">
                    <ArrowUp size={16} className="mr-1" />
                    <span className="font-bold">
                      {bot.upvotes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <VoteButton
                id={bot.id}
                type="bot"
                initialVotes={bot.upvotes}
                className="w-full bg-[#5865f2] hover:bg-[#4752c4]"
              />
              <p className="text-gray-400 text-xs mt-2 text-center">
                每 12 小時可投一次票
              </p>
            </div>

            <div className="bg-[#2b2d31] rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-4">相關機器人</h3>
              <div className="space-y-3">
                {allBots
                  .filter(
                    b =>
                      b.id !== bot.id &&
                      b.tags.some(tag => bot.tags.includes(tag)),
                  )
                  .slice(0, 3)
                  .map(relatedBot => (
                    <Link
                      key={relatedBot.id}
                      href={`/bots/${relatedBot.id}`}
                      className="flex items-center p-2 rounded hover:bg-[#36393f] transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden mr-3">
                        <img
                          src={
                            relatedBot.icon ||
                            '/placeholder.svg?height=40&width=40'
                          }
                          alt={relatedBot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium flex items-center">
                          {relatedBot.name}
                          {relatedBot.verified && (
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
                          <Users size={12} className="mr-1" />
                          <span>
                            {relatedBot.servers.toLocaleString()} 伺服器
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  關於機器人
                </TabsTrigger>
                <TabsTrigger
                  value="commands"
                  className="data-[state=active]:bg-[#36393f]"
                >
                  指令列表
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
                  <h2 className="text-xl font-bold mb-4">機器人介紹</h2>

                  <MarkdownRenderer
                    content={bot.longDescription || '**暫無介紹**'}
                  />

                  {bot.features && bot.features.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3">機器人特色</h3>
                      <ul className="space-y-2 text-gray-300">
                        {bot.features.map((feature, index) => (
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

              <TabsContent value="commands" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">指令列表</h2>
                  {bot.commands && bot.commands.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#1e1f22]">
                            <th className="py-3 px-4 text-gray-300">指令</th>
                            <th className="py-3 px-4 text-gray-300">描述</th>
                            <th className="py-3 px-4 text-gray-300">用法</th>
                            {bot.commands.some(cmd => cmd.category) && (
                              <th className="py-3 px-4 text-gray-300">分類</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {bot.commands.map((command, index) => (
                            <tr
                              key={index}
                              className="border-b border-[#1e1f22] hover:bg-[#36393f]"
                            >
                              <td className="py-3 px-4 font-mono text-[#5865f2]">
                                {command.name}
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                {command.description}
                              </td>
                              <td className="py-3 px-4 font-mono text-xs text-gray-400">
                                {command.usage}
                              </td>
                              {bot.commands.some(cmd => cmd.category) && (
                                <td className="py-3 px-4 text-gray-300">
                                  {command.category && (
                                    <Badge
                                      variant="outline"
                                      className="bg-[#36393f]/50 text-gray-300 border-[#5865f2]"
                                    >
                                      {command.category}
                                    </Badge>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400">此機器人尚未提供指令列表。</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="screenshots" className="mt-6">
                <div className="bg-[#2b2d31] rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">機器人截圖</h2>
                  {bot.screenshots && bot.screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bot.screenshots.map((screenshot, index) => (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden bg-[#36393f]"
                        >
                          <img
                            src={screenshot || '/placeholder.svg'}
                            alt={`${bot.name} screenshot ${index + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">此機器人尚未提供截圖。</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
