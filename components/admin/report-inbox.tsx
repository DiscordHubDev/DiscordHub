"use client";

import {
  ForwardRefExoticComponent,
  RefAttributes,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  Search,
  User,
  Check,
  X,
  FileText,
  Image,
  Paperclip,
  AlertTriangle,
  AlertCircle,
  Info,
  LucideProps,
  Flame,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Server } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ReportInBoxType,
  ReportSeverityType,
  ReportStatusType,
} from "@/lib/prisma_type";
import { report } from "process";
import AttachmentPreview from "../ReportAttachmentPreview";

// 定義嚴重程度等級
const severityLevels: {
  value: ReportSeverityType;
  label: string;
  color: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}[] = [
  {
    value: "untagged",
    label: "未標記",
    color: "gray",
    icon: AlertCircle,
  },
  {
    value: "low",
    label: "低",
    color: "green",
    icon: Info,
  },
  {
    value: "moderate",
    label: "中",
    color: "yellow",
    icon: AlertTriangle,
  },
  {
    value: "severe",
    label: "高",
    color: "red",
    icon: Flame,
  },
];

type ReportProps = {
  reports: ReportInBoxType[];
};

export default function ReportInbox({ reports: allReports }: ReportProps) {
  const [reports, setReports] = useState(allReports);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<ReportInBoxType | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [changeSeverityDialogOpen, setChangeSeverityDialogOpen] =
    useState(false);

  const handleStatusChange = (
    reportId: string,
    newStatus: ReportStatusType
  ) => {
    setReports(
      reports.map((report) =>
        report.id === reportId ? { ...report, status: newStatus } : report
      )
    );

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus });
    }
  };

  const viewReport = (report: ReportInBoxType) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityInfo = (severityValue: ReportSeverityType) => {
    return (
      severityLevels.find((level) => level.value === severityValue) ||
      severityLevels[3]
    );
  };

  const handleSeverityChange = (
    reportId: string,
    newSeverity: ReportSeverityType
  ) => {
    setReports(
      reports.map((report) =>
        report.id === reportId ? { ...report, severity: newSeverity } : report
      )
    );
  };

  const filteredReports = useMemo(() => {
    const search = searchQuery.toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        report.subject.toLowerCase().includes(search) ||
        report.content.toLowerCase().includes(search) ||
        report.reportedBy.username?.toLowerCase().includes(search) ||
        report.itemName.toLowerCase().includes(search) ||
        getSeverityInfo(report.severity).label.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      const matchesSeverity =
        severityFilter === "all" || report.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [reports, searchQuery, statusFilter, severityFilter]);

  return (
    <Card className="bg-[#2F3136] border-[#202225] text-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Flag className="h-5 w-5 text-[#5865F2]" />
          檢舉收件匣
        </CardTitle>
        <CardDescription className="text-gray-400">
          審核和管理用戶檢舉
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋檢舉..."
                className="bg-[#202225] border-[#1E1F22] pl-9 text-white placeholder:text-gray-400 focus-visible:ring-[#5865F2]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-[#202225] border-[#1E1F22] text-white focus:ring-[#5865F2]">
                  <SelectValue placeholder="狀態" />
                </SelectTrigger>
                <SelectContent className="bg-[#2F3136] border-[#202225] text-white">
                  <SelectItem value="all">所有狀態</SelectItem>
                  <SelectItem value="pending">待處理</SelectItem>
                  <SelectItem value="accepted">已接受</SelectItem>
                  <SelectItem value="rejected">已駁回</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-[#202225] border-[#1E1F22] text-white focus:ring-[#5865F2]">
                  <SelectValue placeholder="嚴重程度" />
                </SelectTrigger>
                <SelectContent className="bg-[#2F3136] border-[#202225] text-white">
                  <SelectItem value="all">所有嚴重程度</SelectItem>
                  {severityLevels.map((level) => (
                    <SelectItem
                      key={level.value}
                      value={level.value}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: level.color }}
                        />
                        {level.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="text-center py-6 text-gray-400">未找到檢舉</div>
            ) : (
              filteredReports.map((report) => {
                const severityInfo = getSeverityInfo(report.severity);
                const SeverityIcon = severityInfo.icon;

                return (
                  <div
                    key={report.id}
                    className="flex flex-col justify-between gap-4 p-4 rounded-md bg-[#36393F] border border-[#202225] hover:border-[#5865F2] transition-colors cursor-pointer overflow-hidden"
                    onClick={() => viewReport(report)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                      <div className="flex-1 min-w-0 max-w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base break-words line-clamp-1">
                            {report.subject}
                          </h3>
                          {report.status === "pending" && (
                            <Badge className="bg-[#FEE75C] text-black whitespace-nowrap">
                              待處理
                            </Badge>
                          )}
                          {report.status === "resolved" && (
                            <Badge className="bg-[#57F287] whitespace-nowrap">
                              已接受
                            </Badge>
                          )}
                          {report.status === "rejected" && (
                            <Badge className="bg-[#ED4245] whitespace-nowrap">
                              已駁回
                            </Badge>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="border-none flex items-center gap-1 ml-1 whitespace-nowrap"
                                  style={{
                                    backgroundColor: severityInfo.color,
                                    color:
                                      severityInfo.value === "moderate"
                                        ? "black"
                                        : "white",
                                  }}
                                >
                                  <SeverityIcon className="h-3 w-3" />
                                  {severityInfo.label}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>嚴重程度: {severityInfo.label}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400 break-words line-clamp-1">
                          檢舉者 {report.reportedBy.username} •{" "}
                          {formatDate(new Date(report.reportedAt).toString())}
                        </p>
                        <p className="text-xs sm:text-sm break-words line-clamp-2 mt-1 max-w-full">
                          {report.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        {report.attachments.length > 0 && (
                          <Badge
                            variant="outline"
                            className="border-[#4E5058] text-gray-400 whitespace-nowrap"
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            {report.attachments.length}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="border-[#4E5058] text-gray-400 whitespace-nowrap"
                        >
                          {report.type === "bot" ? (
                            <Bot className="h-3 w-3 mr-1" />
                          ) : (
                            <Server className="h-3 w-3 mr-1" />
                          )}
                          <span className="truncate max-w-[100px]">
                            {report.itemName}
                          </span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#4E5058] hover:bg-[#4E5058] text-white whitespace-nowrap"
                            >
                              設置嚴重程度
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#2F3136] border-[#202225] text-white">
                            {severityLevels.map((level) => {
                              const LevelIcon = level.icon;
                              return (
                                <DropdownMenuItem
                                  key={level.value}
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSeverityChange(
                                      report.id,
                                      level.value
                                    );
                                  }}
                                >
                                  <div
                                    className="flex items-center gap-2"
                                    style={{ color: level.color }}
                                  >
                                    <LevelIcon className="h-4 w-4" />
                                    {level.label}
                                  </div>
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#57F287] hover:bg-[#57F287]/90 text-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(report.id, "resolved");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#ED4245] hover:bg-[#ED4245]/90"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(report.id, "rejected");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>

      {/* 檢舉詳情對話框 */}
      {selectedReport && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Flag className="h-5 w-5 text-[#5865F2]" />
                檢舉詳情
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                查看完整檢舉信息
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold break-words">
                    {selectedReport.subject}
                  </h3>
                  <Badge
                    className={`
                    ${selectedReport.status === "pending" ? "bg-[#FEE75C] text-black" : ""}
                    ${selectedReport.status === "resolved" ? "bg-[#57F287]" : ""}
                    ${selectedReport.status === "rejected" ? "bg-[#ED4245]" : ""}
                  `}
                  >
                    {selectedReport.status === "pending"
                      ? "待處理"
                      : selectedReport.status === "resolved"
                        ? "已接受"
                        : "已駁回"}
                  </Badge>

                  {(() => {
                    const severityInfo = getSeverityInfo(
                      selectedReport.severity
                    );
                    const SeverityIcon = severityInfo.icon;
                    return (
                      <Badge
                        variant="outline"
                        className="border-none flex items-center gap-1"
                        style={{
                          backgroundColor: severityInfo.color,
                          color:
                            severityInfo.value === "moderate"
                              ? "black"
                              : "white",
                        }}
                      >
                        <SeverityIcon className="h-3 w-3" />
                        {severityInfo.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  檢舉時間{" "}
                  {formatDate(new Date(selectedReport.reportedAt).toString())}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">檢舉者</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="break-words">
                      {selectedReport.reportedBy.username}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">
                    檢舉項目
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    {selectedReport.type === "bot" ? (
                      <Bot className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Server className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="break-words">
                      {selectedReport.itemName} (
                      {selectedReport.type === "bot" ? "機器人" : "伺服器"})
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">檢舉內容</h4>
                <div className="mt-2 p-3 bg-[#2F3136] rounded-md whitespace-pre-wrap break-words">
                  {selectedReport.content}
                </div>
              </div>

              {selectedReport.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400">附件</h4>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedReport.attachments.map((attachment) => (
                      <AttachmentPreview
                        key={attachment.public_id}
                        attachment={attachment}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedReport.severity}
                  onValueChange={(value) =>
                    handleSeverityChange(
                      selectedReport.id,
                      value as ReportSeverityType
                    )
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-[#202225] border-[#1E1F22] text-white focus:ring-[#5865F2]">
                    <SelectValue placeholder="設置嚴重程度" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2F3136] border-[#202225] text-white">
                    {severityLevels.map((level) => {
                      const LevelIcon = level.icon;
                      return (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <LevelIcon
                              className="h-4 w-4"
                              style={{ color: level.color }}
                            />
                            <span>{level.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedReport.status === "pending" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    className="bg-[#57F287] hover:bg-[#57F287]/90 text-black flex-1 sm:flex-none"
                    onClick={() =>
                      handleStatusChange(selectedReport.id, "resolved")
                    }
                  >
                    <Check className="h-4 w-4 mr-1" /> 接受檢舉
                  </Button>
                  <Button
                    className="bg-[#ED4245] hover:bg-[#ED4245]/90 flex-1 sm:flex-none"
                    onClick={() =>
                      handleStatusChange(selectedReport.id, "rejected")
                    }
                  >
                    <X className="h-4 w-4 mr-1" /> 駁回檢舉
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
