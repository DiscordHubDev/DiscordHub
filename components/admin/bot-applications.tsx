'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
import { Bot, ExternalLink, Check, X, Search, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BotType } from '@/lib/prisma_type';
import { updateBotStatus } from '@/lib/actions/update-bot-status';
import { sendNotification } from '@/lib/actions/sendNotification';
import RejectBotDialog from '@/components/RejectBotDialog';
import { updateBotServerCount } from '@/lib/actions/bots';
import MarkdownRenderer from '../MarkdownRenderer';
import Link from 'next/link';
import { useError } from '@/context/ErrorContext';
import { sendApprovedWebhook } from '@/lib/webhook';
import DOMPurify from 'isomorphic-dompurify';

type BotApplicationsProps = {
  applications: BotType[];
};

// 常量定義
const STATUS_CONFIG = {
  pending: { label: '待處理', className: 'bg-[#FEE75C] text-black' },
  approved: { label: '已批准', className: 'bg-[#57F287]' },
  rejected: { label: '已拒絕', className: 'bg-red-700' },
} as const;

// 子組件：狀態徽章
const StatusBadge = React.memo(({ status }: { status: BotType['status'] }) => {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <Badge
      className={`${config.className} whitespace-nowrap text-xs sm:text-sm`}
    >
      {config.label}
    </Badge>
  );
});
StatusBadge.displayName = 'StatusBadge';

// 子組件：操作按鈕組
const ActionButtons = React.memo(
  ({
    app,
    onApprove,
    onReject,
  }: {
    app: BotType;
    onApprove: () => void;
    onReject: () => void;
  }) => {
    if (app.status !== 'pending') return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2 w-full">
        <Button
          size="sm"
          className="bg-[#57F287] hover:bg-[#57F287]/90 text-black cursor-pointer flex-1 min-w-[80px]"
          onClick={e => {
            e.stopPropagation();
            onApprove();
          }}
        >
          <Check className="h-4 w-4 mr-1" /> 批准
        </Button>
        <Button
          asChild
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={e => e.stopPropagation()}
        >
          <Link
            href={app.inviteUrl ?? ''}
            className="discord flex items-center justify-center space-x-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Link2 className="h-4 w-4" />
            <span>邀請</span>
          </Link>
        </Button>
        <Button
          size="sm"
          className="bg-red-700/80 hover:bg-red-700 cursor-pointer flex-1 min-w-[80px]"
          onClick={e => {
            e.stopPropagation();
            onReject();
          }}
        >
          <X className="h-4 w-4 mr-1" /> 拒絕
        </Button>
      </div>
    );
  },
);
ActionButtons.displayName = 'ActionButtons';

// 子組件：應用卡片
const ApplicationCard = React.memo(
  ({
    app,
    onView,
    onApprove,
    onReject,
  }: {
    app: BotType;
    onView: () => void;
    onApprove: () => void;
    onReject: () => void;
  }) => {
    const formatDate = useCallback((dateString: string) => {
      return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }, []);

    return (
      <div
        onClick={onView}
        className="flex flex-col justify-between gap-3 p-3 sm:p-4 rounded-md bg-[#36393F] border border-[#202225] hover:border-[#5865F2] transition-all duration-200 h-full overflow-hidden cursor-pointer hover:shadow-lg"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1 flex-1">
              {app.name}
            </h3>
            <StatusBadge status={app.status} />
          </div>

          <div className="text-xs sm:text-sm text-gray-400 break-words space-y-1">
            <div>
              <p className="font-medium text-white inline">提交者：</p>
              <span className="ml-1">
                {app.developers.map(dev => dev.username).join(', ')}
              </span>
            </div>
            <p className="text-xs">{formatDate(app.createdAt!.toString())}</p>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 break-words">
            {app.description}
          </p>

          {app.tags && app.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {app.tags.slice(0, 5).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-[#4E5058] border-none text-xs whitespace-nowrap"
                >
                  {tag}
                </Badge>
              ))}
              {app.tags.length > 5 && (
                <Badge
                  variant="outline"
                  className="bg-[#4E5058] border-none text-xs"
                >
                  +{app.tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>

        <ActionButtons app={app} onApprove={onApprove} onReject={onReject} />
      </div>
    );
  },
);
ApplicationCard.displayName = 'ApplicationCard';

// 子組件：詳情對話框
const ApplicationDetailDialog = React.memo(
  ({
    app,
    isOpen,
    onClose,
    onApprove,
    onReject,
  }: {
    app: BotType | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
  }) => {
    if (!app) return null;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#5865F2] flex-shrink-0" />
              <span className="break-words">{app.name}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              機器人應用詳情
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">
                  開發者
                </h4>
                <ul className="ml-4 list-disc text-sm">
                  {app.developers.map(dev => (
                    <li key={dev.id} className="break-words">
                      {dev.username}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">
                  提交時間
                </h4>
                <p className="text-sm">
                  {formatDate(app.createdAt!.toString())}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">前綴</h4>
                <p className="break-words text-sm font-mono bg-[#2F3136] px-2 py-1 rounded">
                  {app.prefix || '無'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">網站</h4>
                {app.website ? (
                  <a
                    href={app.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5865F2] hover:underline flex items-center gap-1 break-all text-sm"
                  >
                    <span className="truncate">{app.website}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm">無</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                簡短描述
              </h4>
              <p className="text-sm break-words whitespace-pre-wrap bg-[#2F3136] p-3 rounded">
                {app.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                詳細描述
              </h4>
              <div className="bg-[#2F3136] p-3 rounded max-h-64 overflow-y-auto">
                <MarkdownRenderer
                  content={DOMPurify.sanitize(app.longDescription || '無')}
                />
              </div>
            </div>

            {app.tags && app.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">標籤</h4>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map(tag => (
                    <Badge
                      key={tag}
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-xs sm:text-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {app.screenshots && app.screenshots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">截圖</h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {app.screenshots.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="h-32 sm:h-40 rounded object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {app.status === 'pending' && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#202225]">
              <Button
                className="bg-[#57F287] hover:bg-[#57F287]/90 text-black cursor-pointer flex-1 min-w-[100px]"
                onClick={e => {
                  e.stopPropagation();
                  onApprove();
                }}
              >
                <Check className="h-4 w-4 mr-1" /> 批准
              </Button>
              <Button
                asChild
                className="flex-1 min-w-[100px]"
                onClick={e => e.stopPropagation()}
              >
                <Link
                  href={app.inviteUrl ?? ''}
                  className="discord flex items-center justify-center space-x-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Link2 className="h-4 w-4" />
                  <span>點我邀請</span>
                </Link>
              </Button>
              <Button
                className="bg-red-700/80 hover:bg-red-700 cursor-pointer flex-1 min-w-[100px]"
                onClick={onReject}
              >
                <X className="h-4 w-4 mr-1" /> 拒絕
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);
ApplicationDetailDialog.displayName = 'ApplicationDetailDialog';

// 主組件
export default function BotApplications({
  applications: initialData,
}: BotApplicationsProps) {
  const [applications, setApplications] = useState(initialData);
  const [selectedApp, setSelectedApp] = useState<BotType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
  const { showError } = useError();

  // 處理伺服器數量獲取
  const handleFetchBotServerCount = useCallback(
    async (botId: string) => {
      try {
        const response = await fetch('/get_bot_server_count', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bot_id: botId }),
        });

        if (!response.ok) throw new Error('網路錯誤或伺服器錯誤');

        const data = await response.json();
        const server_count = Array.isArray(data)
          ? data.find(item => typeof item.server_count === 'number')
              ?.server_count
          : null;

        if (server_count !== undefined) {
          await updateBotServerCount(botId, server_count);
        } else {
          showError('伺服器回傳錯誤');
        }
      } catch (err) {
        showError(
          `發生錯誤：${err instanceof Error ? err.message : '未知錯誤'}`,
        );
      }
    },
    [showError],
  );

  // 處理審核
  const handleReview = useCallback(
    async (
      id: string,
      status: 'approved' | 'rejected',
      rejectionReason?: string,
    ) => {
      const isApproved = status === 'approved';
      const app = applications.find(app => app.id === id);

      if (!app) return;

      try {
        await updateBotStatus(id, status, rejectionReason);

        setApplications(prev =>
          prev.map(app => (app.id === id ? { ...app, status } : app)),
        );

        // 發送通知
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
                : `您好，我們已審查您提交的機器人「${
                    app.name
                  }」，很遺憾，未能通過審核。\n\n拒絕原因：${
                    rejectionReason || '未提供原因'
                  }。\n\n若有疑問，歡迎再次申請。`,
              priority: isApproved ? 'success' : 'warning',
              userIds: app.developers.map(dev => dev.id),
            }),
          ),
        );

        if (isApproved) {
          await sendApprovedWebhook(app);
          await handleFetchBotServerCount(app.id);
        }

        setIsDialogOpen(false);
      } catch (err) {
        showError(
          `審核失敗：${err instanceof Error ? err.message : '未知錯誤'}`,
        );
      }
    },
    [applications, handleFetchBotServerCount, showError],
  );

  // 打開拒絕對話框
  const openRejectDialog = useCallback((app: BotType) => {
    setSelectedApp(app);
    setRejectDialogOpen(true);
  }, []);

  // 處理拒絕
  const handleRejectBot = useCallback(
    (id: string, reason: string) => {
      handleReview(id, 'rejected', reason);
    },
    [handleReview],
  );

  // 查看詳情
  const viewDetails = useCallback((app: BotType) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
  }, []);

  // 過濾應用列表（使用 useMemo 優化）
  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return applications
      .filter(
        app =>
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.developers.some(
            dev => dev.username?.toLowerCase().includes(query),
          ),
      )
      .map(app => ({
        ...app,
        tags: Array.isArray(app.tags) ? app.tags.map(tag => tag.trim()) : [],
      }));
  }, [applications, searchQuery]);

  return (
    <>
      <Card className="bg-[#2F3136] border-[#202225] text-white">
        <CardHeader className="space-y-2">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Bot className="h-5 w-5 text-[#5865F2] flex-shrink-0" />
            <span>機器人應用</span>
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            審核和管理待處理的機器人應用
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="搜尋應用..."
                className="bg-[#202225] border-[#1E1F22] pl-9 text-white placeholder:text-gray-400 focus-visible:ring-[#5865F2]"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{searchQuery ? '沒有符合搜尋的應用' : '沒有待處理的應用'}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {filteredApplications.map(app => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onView={() => viewDetails(app)}
                    onApprove={() => handleReview(app.id, 'approved')}
                    onReject={() => openRejectDialog(app)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ApplicationDetailDialog
        app={selectedApp}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onApprove={() =>
          selectedApp && handleReview(selectedApp.id, 'approved')
        }
        onReject={() => selectedApp && openRejectDialog(selectedApp)}
      />

      {selectedApp && (
        <RejectBotDialog
          userIds={selectedApp.developers}
          botId={selectedApp.id}
          isOpen={isRejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          onConfirm={handleRejectBot}
        />
      )}
    </>
  );
}
