'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Server,
  Search,
  Users,
  Calendar,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BotType, ServerType } from '@/lib/prisma_type';
import { deleteServerByGuildId } from '@/lib/actions/servers';
import { deleteBot } from '@/lib/actions/bots';

type BotServerManagementProps = {
  bots: BotType[];
  servers: ServerType[];
};

type ManagedItem =
  | (BotType & { type: 'bot' })
  | (ServerType & { type: 'servers' });

// 分離出卡片組件以提升性能
const ItemCard = ({
  item,
  onView,
  onDelete,
}: {
  item: ManagedItem;
  onView: (item: ManagedItem) => void;
  onDelete: (item: ManagedItem) => void;
}) => {
  const isBot = item.type === 'bot';
  const stat = isBot ? item.servers : item.members;
  const StatIcon = isBot ? Server : Users;

  return (
    <div
      className="flex flex-col justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-md bg-[#36393F] border border-[#202225] hover:border-[#5865F2] transition-colors cursor-pointer h-full overflow-hidden"
      onClick={() => onView(item)}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <img
            src={item.icon || '/placeholder.png'}
            alt={item.name}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0"
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 break-words line-clamp-2 mt-0.5">
              {item.description}
            </p>
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-[#4E5058] border-none text-xs whitespace-nowrap"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge
                variant="outline"
                className="bg-[#4E5058] border-none text-xs"
              >
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#202225]">
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
          <StatIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>{stat}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#ED4245] hover:text-white hover:bg-[#ED4245]"
          onClick={e => {
            e.stopPropagation();
            onDelete(item);
          }}
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
};

// 詳情對話框組件
const ItemDetailsDialog = ({
  item,
  isOpen,
  onClose,
  onDelete,
}: {
  item: ManagedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (item: ManagedItem) => void;
}) => {
  if (!item) return null;

  const isBot = item.type === 'bot';
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
      <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            {isBot ? (
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-[#5865F2] flex-shrink-0" />
            ) : (
              <Server className="h-4 w-4 sm:h-5 sm:w-5 text-[#5865F2] flex-shrink-0" />
            )}
            <span className="break-words line-clamp-2">{item.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isBot ? '機器人' : '伺服器'}詳情
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={item.icon || '/placeholder.png'}
              alt={item.name}
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full flex-shrink-0"
            />
            <div className="min-w-0 flex-1 w-full">
              <h3 className="text-base sm:text-lg font-semibold break-words">
                {item.name}
              </h3>
              {isBot ? (
                <div className="text-gray-400 space-y-2 mt-2">
                  <p className="font-semibold text-sm">開發者</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {item.developers.map(dev => (
                      <li key={dev.id} className="break-words">
                        {dev.username}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-gray-400 space-y-2 mt-2">
                  <p className="font-semibold text-sm">
                    擁有者：{item.owner!.username}
                  </p>
                  {item.admins && item.admins.length > 0 && (
                    <>
                      <p className="font-semibold text-sm">伺服器管理</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {item.admins.map(admin => (
                          <li key={admin.id} className="break-words">
                            {admin.username}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">描述</h4>
            <p className="text-sm break-words whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400">創建時間</h4>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="break-words">
                  {formatDate(
                    isBot
                      ? item.approvedAt?.toString() ?? ''
                      : item.createdAt?.toString() ?? '',
                  )}
                </span>
              </div>
            </div>

            {isBot ? (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">
                    伺服器數
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <Server className="h-4 w-4 text-gray-400" />
                    <span>{item.servers}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">前綴</h4>
                  <p className="mt-1 text-sm break-words">{item.prefix}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">網站</h4>
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    {item.website ? (
                      <>
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5865F2] hover:underline truncate"
                        >
                          {item.website}
                        </a>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </>
                    ) : (
                      <span className="text-gray-400">無</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h4 className="text-sm font-medium text-gray-400">成員數</h4>
                <div className="flex items-center gap-1 mt-1 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{item.members}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">
              {isBot ? '標籤' : '分類'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <Badge
                  key={tag}
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-xs sm:text-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
          <Button
            variant="outline"
            className="border-[#4E5058] hover:bg-[#4E5058] text-white w-full sm:w-auto"
            onClick={onClose}
          >
            關閉
          </Button>
          <Button
            className="bg-[#ED4245] hover:bg-[#ED4245]/90 w-full sm:w-auto"
            onClick={() => {
              onDelete(item);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" /> 刪除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// 刪除確認對話框組件
const DeleteConfirmDialog = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}: {
  item: ManagedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ED4245] flex-shrink-0" />
            確認刪除
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            此操作無法撤銷。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="break-words text-sm sm:text-base">
            您確定要刪除{item.type === 'bot' ? '機器人' : '伺服器'}{' '}
            <strong>{item.name}</strong> 嗎？
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            className="border-[#4E5058] hover:bg-[#4E5058] text-white w-full sm:w-auto"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            className="bg-[#ED4245] hover:bg-[#ED4245]/90 w-full sm:w-auto"
            onClick={onConfirm}
          >
            刪除
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function BotServerManagement({
  bots: botsWithRelations,
  servers: allServers,
}: BotServerManagementProps) {
  const [bots, setBots] = useState(botsWithRelations);
  const [servers, setServers] = useState(allServers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ManagedItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ManagedItem | null>(null);
  const [activeTab, setActiveTab] = useState('bots');

  // 使用 useMemo 優化搜尋過濾
  const filteredBots = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return bots;

    return bots.filter(
      bot =>
        bot.name.toLowerCase().includes(query) ||
        bot.description.toLowerCase().includes(query) ||
        bot.developers.some(dev => dev.username.toLowerCase().includes(query)),
    );
  }, [bots, searchQuery]);

  const filteredServers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return servers;

    return servers.filter(
      server =>
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        server.owner?.username.toLowerCase().includes(query),
    );
  }, [servers, searchQuery]);

  // 使用 useCallback 優化回調函數
  const handleDelete = useCallback(async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'bot') {
        setBots(prev => prev.filter(bot => bot.id !== itemToDelete.id));
        await deleteBot(itemToDelete.id);
      } else {
        setServers(prev =>
          prev.filter(server => server.id !== itemToDelete.id),
        );
        await deleteServerByGuildId(itemToDelete.id);
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);

      if (selectedItem?.id === itemToDelete.id) {
        setIsDialogOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  }, [itemToDelete, selectedItem]);

  const confirmDelete = useCallback((item: ManagedItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);

  const viewDetails = useCallback((item: ManagedItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }, []);

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8 sm:py-12 text-gray-400">
      <p className="text-sm sm:text-base">{message}</p>
    </div>
  );

  return (
    <Card className="bg-[#2F3136] border-[#202225] text-white">
      <CardHeader className="space-y-2 sm:space-y-1.5">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Server className="h-4 w-4 sm:h-5 sm:w-5 text-[#5865F2] flex-shrink-0" />
          <span>機器人和伺服器管理</span>
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          管理所有已批准的機器人和已連接的伺服器
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋機器人或伺服器..."
              className="bg-[#202225] border-[#1E1F22] pl-9 text-sm sm:text-base text-white placeholder:text-gray-400 focus-visible:ring-[#5865F2]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="bg-[#202225] text-white w-full grid grid-cols-2 h-auto p-1">
              <TabsTrigger
                value="bots"
                className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white text-sm sm:text-base py-2"
              >
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                機器人
              </TabsTrigger>
              <TabsTrigger
                value="servers"
                className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white text-sm sm:text-base py-2"
              >
                <Server className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                伺服器
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bots" className="mt-4">
              {filteredBots.length === 0 ? (
                <EmptyState
                  message={
                    searchQuery ? '沒有符合搜尋的機器人' : '沒有找到機器人'
                  }
                />
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                  {filteredBots.map(bot => (
                    <ItemCard
                      key={bot.id}
                      item={{ ...bot, type: 'bot' }}
                      onView={viewDetails}
                      onDelete={confirmDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="servers" className="mt-4">
              {filteredServers.length === 0 ? (
                <EmptyState
                  message={
                    searchQuery ? '沒有符合搜尋的伺服器' : '沒有找到伺服器'
                  }
                />
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                  {filteredServers.map(server => (
                    <ItemCard
                      key={server.id}
                      item={{ ...server, type: 'servers' }}
                      onView={viewDetails}
                      onDelete={confirmDelete}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      <ItemDetailsDialog
        item={selectedItem}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onDelete={confirmDelete}
      />

      <DeleteConfirmDialog
        item={itemToDelete}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
