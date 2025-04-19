'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  ExternalLink,
  Check,
  X,
  Search,
  MailPlus,
  Link2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BotWithRelations } from '@/lib/prisma_type';
import { updateBotStatus } from '@/lib/actions/update-bot-status';
import { sendNotification } from '@/lib/actions/sendNotification';
import RejectBotDialog from '@/components/RejectBotDialog';
import { toast } from 'react-toastify';
import { updateBotServerCount } from '@/lib/actions/bots';
import MarkdownRenderer from '../MarkdownRenderer';
import Link from 'next/link';

const webhookUrl =
  'https://discord.com/api/webhooks/1361355742015263042/a0VNI1v7S9tUWISWmchBAFu3K8-ILtyeI3GKObc9XN__zohKBu2oZJ8PHhqEtMdvI0dH';

type BotApplicationsProps = {
  applications: BotWithRelations[];
};

export default function BotApplications({
  applications: initialData,
}: BotApplicationsProps) {
  const [applications, setApplications] = useState(initialData);
  const [selectedApp, setSelectedApp] = useState<BotWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openRejectDialog = (app: BotWithRelations) => {
    setSelectedApp(app);
    setRejectDialogOpen(true);
  };

  const handleRejectBot = (id: string, reason: string) => {
    handleReview(id, 'rejected', reason);
  };

  const handleFetchBotServerCount = async (botId: string) => {
    try {
      const response = await fetch('/api/get_bot_server_count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bot_id: botId }),
      });

      if (!response.ok) {
        throw new Error('網路錯誤或伺服器錯誤');
      }

      const data = await response.json();

      if (data.server_count !== undefined) {
        await updateBotServerCount(botId, data.server_count);
      } else {
        toast.error('伺服器回傳錯誤');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(`發生錯誤：${err.message}`);
      } else {
        toast.error('發生未知錯誤');
      }
    }
  };

  const handleReview = async (
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ) => {
    const isApproved = status === 'approved';

    await updateBotStatus(id, status, rejectionReason);

    setApplications(
      applications.map(app => (app.id === id ? { ...app, status } : app)),
    );

    const app = applications.find(app => app.id === id);

    if (app) {
      await Promise.all(
        app.developers.map(dev =>
          sendNotification({
            subject: isApproved
              ? '您的機器人申請已通過 ✅'
              : '您的機器人申請未通過 ❌',
            teaser: isApproved
              ? `${app.name} 已通過審核`
              : `${app.name} 的申請未被接受`,
            content: isApproved
              ? `您好！我們已審查您提交的機器人「${app.name}」，並已核准上架。感謝您的耐心等待，祝您的機器人越來越好！`
              : `您好，我們已審查您提交的機器人「${app.name}」，很遺憾，未能通過審核。\n\n拒絕原因：${rejectionReason || '未提供原因'}。\n\n若有疑問，歡迎再次申請。`,
            priority: isApproved ? 'success' : 'warning',
            userIds: app.developers.map(dev => dev.id),
          }),
        ),
      );

      // 發送Webhook消息
      if (isApproved) {
        await handleFetchBotServerCount(app.id);

        const developerNames = app.developers
          .map(dev => dev.username || '未知')
          .join('\n');
        const embed = {
          title: `<:pixel_symbol_exclamation_invert:1361299311131885600> | 新機器人發佈通知！`,
          description: `➤機器人名稱：**${app.name}**\n➤機器人前綴：**${app.prefix}**\n➤簡短描述：\`\`\`${app.description}\`\`\`\n➤開發者：\`\`\`${developerNames}\`\`\`\n➤邀請鏈結：\n> ${app.inviteUrl}\n➤網站連結：\n> https://dchubs.org/bots/${app.id || '無'}\n➤類別：\`\`\`${app.tags.join('\n')}\`\`\``,
          color: 0x4285f4,
          footer: {
            text: '由 DiscordHubs 系統發送',
            icon_url:
              'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
          },
          thumbnail: {
            url: app.icon || '',
          },
          image: {
            url: app.banner || '',
          },
        };

        const webhookData = {
          content: '<@&1355617017549426919>',
          embeds: [embed],
          username: 'DcHubs機器人通知',
          avatar_url:
            'https://cdn.discordapp.com/icons/1297055626014490695/365d960f0a44f9a0c2de4672b0bcdcc0.webp?size=512&format=webp',
        };

        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData),
          });

          if (!response.ok) {
            console.error('Webhook 發送失敗:', response.statusText);
          } else {
          }
        } catch (webhookError) {
          console.error('發送 Webhook 時出錯:', webhookError);
        }
      }
    }

    setIsDialogOpen(false);
  };

  const viewDetails = (app: BotWithRelations) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const filteredApplications = applications
    .filter(
      app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developers.some(dev =>
          dev.username?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    )
    .map(app => ({
      ...app,
      tags: Array.isArray(app.tags) ? app.tags.map(tag => tag.trim()) : [],
    }));

  return (
    <Card className="bg-[#2F3136] border-[#202225] text-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Bot className="h-5 w-5 text-[#5865F2]" />
          機器人應用
        </CardTitle>
        <CardDescription className="text-gray-400">
          審核和管理待處理的機器人應用
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋應用..."
              className="bg-[#202225] border-[#1E1F22] pl-9 text-white placeholder:text-gray-400 focus-visible:ring-[#5865F2]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              {searchQuery ? '沒有符合搜尋的應用' : '沒有待處理的應用'}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredApplications.map(app => (
                <div
                  key={app.id}
                  onClick={() => viewDetails(app)} // 👈 你自己的處理函式
                  className="flex flex-col justify-between gap-4 p-4 rounded-md bg-[#36393F] border border-[#202225] hover:border-[#5865F2] transition-colors h-full overflow-hidden cursor-pointer"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1">
                        {app.name}
                      </h3>
                      {app.status === 'pending' && (
                        <Badge className="bg-[#FEE75C] text-black whitespace-nowrap">
                          待處理
                        </Badge>
                      )}
                      {app.status === 'approved' && (
                        <Badge className="bg-[#57F287] whitespace-nowrap">
                          已批准
                        </Badge>
                      )}
                      {app.status === 'rejected' && (
                        <Badge className="bg-red-700 whitespace-nowrap">
                          已拒絕
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 break-words">
                      <p className="font-medium text-white">提交者：</p>
                      <ul className="ml-4 list-disc">
                        {app.developers.map(dev => (
                          <li key={dev.id}>{dev.username}</li>
                        ))}
                      </ul>
                      <p>
                        提交時間：
                        {formatDate(app.createdAt!.toString())}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm mt-2 line-clamp-2 break-words">
                      {app.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2 overflow-hidden">
                      {app.tags!.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-[#4E5058] border-none text-xs whitespace-nowrap"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-[#57F287] hover:bg-[#57F287]/90 text-black"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleReview(app.id, 'approved');
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" /> 批准
                        </Button>
                        <Button
                          asChild
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                          }}
                        >
                          <Link
                            href={app.inviteUrl ?? ''}
                            className="discord flex items-center space-x-2"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Link2 className="h-4 w-4" />
                            <span>點我邀請</span>
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-700/80 hover:bg-red-700"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openRejectDialog(app);
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> 拒絕
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {selectedApp && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#5865F2]" /> {selectedApp.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                機器人應用詳情
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs sm:text-sm text-gray-400 break-words">
                    <h4 className="text-sm font-medium text-gray-400">
                      開發者：
                    </h4>
                    <ul className="ml-4 list-disc">
                      {selectedApp.developers.map(dev => (
                        <li key={dev.id}>{dev.username}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">
                    提交時間
                  </h4>
                  <p>{formatDate(selectedApp.createdAt!.toString())}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">前綴</h4>
                  <p className="break-words">{selectedApp.prefix}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">網站</h4>
                  {selectedApp.website ? (
                    <a
                      href={selectedApp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5865F2] hover:underline flex items-center gap-1 break-words overflow-hidden text-ellipsis"
                    >
                      {selectedApp.website}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-400">
                      <ExternalLink className="h-3 w-3 flex-shrink-0" /> 無
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">簡短描述</h4>
                <p className="mt-1 break-words whitespace-pre-wrap">
                  {selectedApp.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">詳細描述</h4>
                <MarkdownRenderer
                  content={selectedApp.longDescription || '無'}
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">標籤</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApp.tags.map(tag => (
                    <Badge
                      key={tag}
                      className="bg-[#5865f2] hover:bg-[#4752c4]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400">截圖</h4>
              <div className="mt-2 flex gap-4 overflow-x-auto">
                {selectedApp.screenshots.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Screenshot ${index + 1}`}
                    className="h-32 rounded cursor-pointer object-cover"
                    onClick={() => setSelectedImage(url)}
                  />
                ))}
              </div>

              {/* 放大 modal */}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                  onClick={() => setSelectedImage(null)}
                >
                  <img
                    src={selectedImage}
                    alt="Full View"
                    className="max-w-[90%] max-h-[90%] rounded shadow-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              {selectedApp.status === 'pending' && (
                <>
                  <Button
                    className="bg-[#57F287] hover:bg-[#57F287]/90 text-black"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleReview(selectedApp.id, 'approved');
                      setIsDialogOpen(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" /> 批准
                  </Button>
                  <Button
                    asChild
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                    }}
                  >
                    <Link
                      href={selectedApp.inviteUrl ?? ''}
                      className="discord flex items-center space-x-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link2 className="h-4 w-4" />
                      <span>點我邀請</span>
                    </Link>
                  </Button>
                  <Button
                    className="bg-red-700/80 hover:bg-red-700"
                    onClick={() => openRejectDialog(selectedApp)}
                  >
                    <X className="h-4 w-4 mr-1" /> 拒絕
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {selectedApp && (
        <RejectBotDialog
          botId={selectedApp.id}
          isOpen={isRejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          onConfirm={handleRejectBot}
        />
      )}
    </Card>
  );
}
