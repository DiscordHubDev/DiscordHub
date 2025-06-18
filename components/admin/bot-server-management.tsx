'use client';

import { useState } from 'react';
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
import { BotWithRelations, ServerType } from '@/lib/prisma_type';
import { deleteServerByGuildId } from '@/lib/actions/servers';
import { deleteBot } from '@/lib/actions/bots';

type BotServerManagementProps = {
  bots: BotWithRelations[];
  servers: ServerType[];
};

type ManagedItem =
  | (BotWithRelations & { type: 'bot' })
  | (ServerType & { type: 'servers' });

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

  const handleDelete = async () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'bot') {
      setBots(bots.filter(bot => bot.id !== itemToDelete.id));
      await deleteBot(itemToDelete.id);
    } else {
      setServers(servers.filter(server => server.id !== itemToDelete.id));
      await deleteServerByGuildId(itemToDelete.id);
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);

    if (selectedItem && selectedItem.id === itemToDelete.id) {
      setIsDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const confirmDelete = (item: ManagedItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const viewDetails = (item: ManagedItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredBots = bots.filter(
    bot =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.developers
        .map(dev => dev.username.toLowerCase())
        .includes(searchQuery.toLowerCase()),
  );

  const filteredServers = servers.filter(
    server =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.owner?.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card className="bg-[#2F3136] border-[#202225] text-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Server className="h-5 w-5 text-[#5865F2]" />
          機器人和伺服器管理
        </CardTitle>
        <CardDescription className="text-gray-400">
          管理所有已批准的機器人和已連接的伺服器
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜尋機器人或伺服器..."
              className="bg-[#202225] border-[#1E1F22] pl-9 text-white placeholder:text-gray-400 focus-visible:ring-[#5865F2]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            defaultValue="bots"
            className="space-y-4"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-[#202225] text-white w-full flex">
              <TabsTrigger
                value="bots"
                className="flex-1 data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
              >
                <Bot className="h-4 w-4 mr-2" /> 機器人
              </TabsTrigger>
              <TabsTrigger
                value="servers"
                className="flex-1 data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
              >
                <Server className="h-4 w-4 mr-2" /> 伺服器
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bots" className="space-y-4">
              {filteredBots.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  {searchQuery ? '沒有符合搜尋的機器人' : '沒有找到機器人'}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {filteredBots.map(bot => (
                    <div
                      key={bot.id}
                      className="flex flex-col justify-between gap-4 p-4 rounded-md bg-[#36393F] border border-[#202225] hover:border-[#5865F2] transition-colors cursor-pointer h-full overflow-hidden"
                      onClick={() =>
                        viewDetails({
                          ...bot,
                          type: 'bot',
                        })
                      }
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={bot.icon || '/placeholder.svg'}
                              alt={bot.name}
                              className="h-10 w-10 rounded-full"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1">
                              {bot.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 break-words line-clamp-1">
                              {bot.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3 overflow-hidden">
                          {bot.tags.map(tag => (
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

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <Server className="h-4 w-4" />
                            <span>{bot.servers}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#ED4245] hover:text-white hover:bg-[#ED4245]"
                          onClick={e => {
                            e.stopPropagation();
                            confirmDelete({
                              ...bot,
                              type: 'bot',
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="servers" className="space-y-4">
              {filteredServers.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  {searchQuery ? '沒有符合搜尋的伺服器' : '沒有找到伺服器'}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {filteredServers.map(server => (
                    <div
                      key={server.id}
                      className="flex flex-col justify-between gap-4 p-4 rounded-md bg-[#36393F] border border-[#202225] hover:border-[#5865F2] transition-colors cursor-pointer h-full overflow-hidden"
                      onClick={() =>
                        viewDetails({
                          ...server,
                          type: 'servers',
                        })
                      }
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <img
                            src={server.icon || '/placeholder.svg'}
                            alt={server.name}
                            className="h-10 w-10 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1">
                              {server.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 break-words line-clamp-1">
                              {server.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3 overflow-hidden">
                          {server.tags.map(tag => (
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

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <Users className="h-4 w-4" />
                            <span>{server.members}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#ED4245] hover:text-white hover:bg-[#ED4245]"
                          onClick={e => {
                            e.stopPropagation();
                            confirmDelete({
                              ...server,
                              type: 'servers',
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      {/* 詳情對話框 */}
      {selectedItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                {selectedItem.type === 'bot' ? (
                  <Bot className="h-5 w-5 text-[#5865F2]" />
                ) : (
                  <Server className="h-5 w-5 text-[#5865F2]" />
                )}
                <span className="break-words line-clamp-1">
                  {selectedItem.name}
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedItem.type === 'bot' ? '機器人' : '伺服器'}
                詳情
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={selectedItem.icon || '/placeholder.svg'}
                  alt={selectedItem.name}
                  className="h-16 w-16 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold break-words line-clamp-1">
                    {selectedItem.name}
                  </h3>
                  {selectedItem.type === 'bot' ? (
                    <div className="text-gray-400 space-y-2">
                      <p className="font-semibold">開發者</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItem.developers.map(developer => (
                          <li key={developer.id}>{developer.username}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-gray-400 space-y-2">
                      <p className="font-semibold">
                        擁有者：{selectedItem.owner!.username}
                      </p>
                      <p className="font-semibold">伺服器管理</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItem.admins?.map(admin => (
                          <li key={admin.id}>{admin.username}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">描述</h4>
                <p className="mt-1 break-words whitespace-pre-wrap">
                  {selectedItem.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">
                    創建時間
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {selectedItem &&
                        formatDate(
                          selectedItem.type === 'bot'
                            ? (selectedItem.approvedAt?.toString() ?? '')
                            : (selectedItem.createdAt?.toString() ?? ''),
                        )}
                    </span>
                  </div>
                </div>

                {selectedItem.type === 'bot' ? (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        伺服器數
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Server className="h-4 w-4 text-gray-400" />
                        <span>{selectedItem.servers}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        前綴
                      </h4>
                      <p className="mt-1 break-words">{selectedItem.prefix}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        網站
                      </h4>
                      <div className="flex items-center gap-1 mt-1 break-words overflow-hidden text-ellipsis">
                        {selectedItem.website ? (
                          <a
                            href={selectedItem.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5865F2] hover:underline truncate"
                          >
                            {selectedItem.website}
                          </a>
                        ) : (
                          <span className="text-gray-400">無</span>
                        )}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">
                        成員數
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{selectedItem.members}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">
                  {selectedItem.type === 'bot' ? '標籤' : '分類'}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedItem.tags.map(tag => (
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

            <div className="flex justify-end gap-2 mt-4">
              <Button
                className="bg-[#ED4245] hover:bg-[#ED4245]/90"
                onClick={() => {
                  if (selectedItem.type === 'bot') {
                    confirmDelete({
                      ...selectedItem,
                      type: 'bot',
                    });
                  } else if (selectedItem.type === 'servers') {
                    confirmDelete({
                      ...selectedItem,
                      type: 'servers',
                    });
                  }
                  setIsDialogOpen(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> 刪除
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 刪除確認對話框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#36393F] text-white border-[#202225]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#ED4245]" />
              確認刪除
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>

          {itemToDelete && (
            <div className="py-4">
              <p className="break-words">
                您確定要刪除
                {itemToDelete.type === 'bot' ? '機器人' : '伺服器'}{' '}
                <strong>{itemToDelete.name}</strong> 嗎？
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              className="border-[#4E5058] hover:bg-[#4E5058] text-white"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              className="bg-[#ED4245] hover:bg-[#ED4245]/90"
              onClick={handleDelete}
            >
              刪除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
