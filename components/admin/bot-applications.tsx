"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bot, ExternalLink, Check, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BotWithRelations } from "@/lib/prisma_type";
import { updateBotStatus } from "@/lib/actions/update-bot-status";

type BotApplicationsProps = {
  applications: BotWithRelations[];
};

export default function BotApplications({
  applications: initialData,
}: BotApplicationsProps) {
  const [applications, setApplications] = useState(initialData);
  const [selectedApp, setSelectedApp] = useState<BotWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = async (id: string) => {
    await updateBotStatus(id, "approved");
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: "approved" } : app
      )
    );
    setIsDialogOpen(false);
  };

  const handleReject = async (id: string) => {
    await updateBotStatus(id, "rejected");
    setApplications(
      applications.map((app) =>
        app.id === id ? { ...app, status: "rejected" } : app
      )
    );
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
      (app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developers.some((dev) =>
          dev.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .map((app) => ({
      ...app,
      tags: Array.isArray(app.tags) ? app.tags.map((tag) => tag.trim()) : [],
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              {searchQuery ? "沒有符合搜尋的應用" : "沒有待處理的應用"}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredApplications.map((app) => (
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
                      {app.status === "pending" && (
                        <Badge className="bg-[#FEE75C] text-black whitespace-nowrap">
                          待處理
                        </Badge>
                      )}
                      {app.status === "approved" && (
                        <Badge className="bg-[#57F287] whitespace-nowrap">
                          已批准
                        </Badge>
                      )}
                      {app.status === "rejected" && (
                        <Badge className="bg-[#ED4245] whitespace-nowrap">
                          已拒絕
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 break-words">
                      <p className="font-medium text-white">提交者：</p>
                      <ul className="ml-4 list-disc">
                        {app.developers.map((dev) => (
                          <li key={dev.id}>{dev.username}</li>
                        ))}
                      </ul>
                      <p>提交時間：{formatDate(app.createdAt!.toString())}</p>
                    </div>
                    <p className="text-xs sm:text-sm mt-2 line-clamp-2 break-words">
                      {app.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2 overflow-hidden">
                      {app.tags!.map((tag) => (
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
                    {app.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-[#57F287] hover:bg-[#57F287]/90 text-black"
                          onClick={() => handleApprove(app.id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> 批准
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#ED4245] hover:bg-[#ED4245]/90"
                          onClick={() => handleReject(app.id)}
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
                      {selectedApp.developers.map((dev) => (
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
                <p className="mt-1 break-words whitespace-pre-wrap">
                  {selectedApp.longDescription}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">標籤</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApp.tags.map((tag) => (
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

            <div className="flex justify-between items-center">
              {selectedApp.status === "pending" && (
                <>
                  <Button
                    className="bg-[#57F287] hover:bg-[#57F287]/90 text-black"
                    onClick={() => {
                      handleApprove(selectedApp.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" /> 批准
                  </Button>
                  <Button
                    className="bg-[#ED4245] hover:bg-[#ED4245]/90"
                    onClick={() => {
                      handleReject(selectedApp.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> 拒絕
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
