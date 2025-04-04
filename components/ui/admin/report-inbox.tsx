"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, Server } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// 定義嚴重程度等級
const severityLevels = [
  { value: "severe", label: "嚴重", color: "#ED4245", icon: AlertCircle },
  { value: "moderate", label: "中等", color: "#FEE75C", icon: AlertTriangle },
  { value: "low", label: "輕微", color: "#57F287", icon: Info },
  { value: "untagged", label: "未標記", color: "#4E5058", icon: Flag },
]

// 報告的模擬數據
const mockReports = [
  {
    id: "report-1",
    subject: "不當機器人行為",
    content: "該機器人向用戶發送未經請求的訊息，並包含違反 Discord 服務條款的不當內容。",
    reportedBy: "user#1234",
    reportedAt: "2023-04-15T10:30:00Z",
    status: "pending",
    severity: "moderate",
    attachments: [{ id: "att-1", name: "screenshot.png", type: "image", url: "/placeholder.svg?height=200&width=300" }],
    reportedItem: {
      type: "bot",
      name: "SpamBot",
      id: "bot-123",
    },
  },
  {
    id: "report-2",
    subject: "伺服器宣傳非法內容",
    content: "這個伺服器被用來分發非法內容，應立即調查。我已附上截圖作為證據。",
    reportedBy: "moderator#5678",
    reportedAt: "2023-04-16T14:45:00Z",
    status: "pending",
    severity: "severe",
    attachments: [
      { id: "att-2", name: "evidence1.png", type: "image", url: "/placeholder.svg?height=200&width=300" },
      { id: "att-3", name: "evidence2.png", type: "image", url: "/placeholder.svg?height=200&width=300" },
    ],
    reportedItem: {
      type: "server",
      name: "可疑伺服器",
      id: "server-456",
    },
  },
  {
    id: "report-3",
    subject: "機器人令牌洩漏",
    content: "我發現一個機器人在回應中洩漏了它的令牌。這是一個需要解決的安全問題。",
    reportedBy: "security#9012",
    reportedAt: "2023-04-17T09:15:00Z",
    status: "pending",
    severity: "low",
    attachments: [
      {
        id: "att-4",
        name: "token_leak.txt",
        type: "text",
        content: "機器人令牌在回應中可見: MTk4NjIyNDgzNDcxOTI1MjQ4.Cl2FMQ.ZMCgqUYJFGYvkohm7QigOV",
      },
    ],
    reportedItem: {
      type: "bot",
      name: "不安全機器人",
      id: "bot-789",
    },
  },
  {
    id: "report-4",
    subject: "伺服器中的用戶騷擾",
    content: "多位用戶報告來自特定成員的騷擾。這需要解決，因為它正在創造一個有毒的環境。",
    reportedBy: "admin#4567",
    reportedAt: "2023-04-18T16:20:00Z",
    status: "pending",
    severity: "untagged",
    attachments: [],
    reportedItem: {
      type: "server",
      name: "遊戲社區",
      id: "server-101",
    },
  },
]

export default function ReportInbox() {
  const [reports, setReports] = useState(mockReports)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [changeSeverityDialogOpen, setChangeSeverityDialogOpen] = useState(false)

  const handleStatusChange = (reportId, newStatus) => {
    setReports(reports.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report)))

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, status: newStatus })
    }
  }

  const handleSeverityChange = (reportId, newSeverity) => {
    setReports(reports.map((report) => (report.id === reportId ? { ...report, severity: newSeverity } : report)))

    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, severity: newSeverity })
    }
  }

  const viewReport = (report) => {
    setSelectedReport(report)
    setIsDialogOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getSeverityInfo = (severityValue) => {
    return severityLevels.find((level) => level.value === severityValue) || severityLevels[3]
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSeverityInfo(report.severity).label.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesSeverity = severityFilter === "all" || report.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
  })

  return (
    <Card className="bg-[#2F3136] border-[#202225] text-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Flag className="h-5 w-5 text-[#5865F2]" />
          報告收件匣
        </CardTitle>
        <CardDescription className="text-gray-400">審核和管理用戶報告</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜尋報告..."
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
                  <SelectItem value="dismissed">已駁回</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-[140px] bg-[#202225] border-[#1E1F22] text-white focus:ring-[#5865F2]">
                  <SelectValue placeholder="嚴重程度" />
                </SelectTrigger>
                <SelectContent className="bg-[#2F3136] border-[#202225] text-white">
                  <SelectItem value="all">所有嚴重程度</SelectItem>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value} className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: level.color }} />
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
              <div className="text-center py-6 text-gray-400">未找到報告</div>
            ) : (
              filteredReports.map((report) => {
                const severityInfo = getSeverityInfo(report.severity)
                const SeverityIcon = severityInfo.icon

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
                            <Badge className="bg-[#FEE75C] text-black whitespace-nowrap">待處理</Badge>
                          )}
                          {report.status === "accepted" && (
                            <Badge className="bg-[#57F287] whitespace-nowrap">已接受</Badge>
                          )}
                          {report.status === "dismissed" && (
                            <Badge className="bg-[#ED4245] whitespace-nowrap">已駁回</Badge>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className="border-none flex items-center gap-1 ml-1 whitespace-nowrap"
                                  style={{
                                    backgroundColor: severityInfo.color,
                                    color: severityInfo.value === "moderate" ? "black" : "white",
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
                          報告者 {report.reportedBy} • {formatDate(report.reportedAt)}
                        </p>
                        <p className="text-xs sm:text-sm break-words line-clamp-2 mt-1 max-w-full">{report.content}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        {report.attachments.length > 0 && (
                          <Badge variant="outline" className="border-[#4E5058] text-gray-400 whitespace-nowrap">
                            <Paperclip className="h-3 w-3 mr-1" />
                            {report.attachments.length}
                          </Badge>
                        )}
                        <Badge variant="outline" className="border-[#4E5058] text-gray-400 whitespace-nowrap">
                          {report.reportedItem.type === "bot" ? (
                            <Bot className="h-3 w-3 mr-1" />
                          ) : (
                            <Server className="h-3 w-3 mr-1" />
                          )}
                          <span className="truncate max-w-[100px]">{report.reportedItem.name}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                              const LevelIcon = level.icon
                              return (
                                <DropdownMenuItem
                                  key={level.value}
                                  className="flex items-center gap-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSeverityChange(report.id, level.value)
                                  }}
                                >
                                  <div className="flex items-center gap-2" style={{ color: level.color }}>
                                    <LevelIcon className="h-4 w-4" />
                                    {level.label}
                                  </div>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-[#57F287] hover:bg-[#57F287]/90 text-black"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(report.id, "accepted")
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-[#ED4245] hover:bg-[#ED4245]/90"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(report.id, "dismissed")
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>

      {/* 報告詳情對話框 */}
      {selectedReport && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#36393F] text-white border-[#202225] max-w-3xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Flag className="h-5 w-5 text-[#5865F2]" />
                報告詳情
              </DialogTitle>
              <DialogDescription className="text-gray-400">查看完整報告信息</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold break-words">{selectedReport.subject}</h3>
                  <Badge
                    className={`
                    ${selectedReport.status === "pending" ? "bg-[#FEE75C] text-black" : ""}
                    ${selectedReport.status === "accepted" ? "bg-[#57F287]" : ""}
                    ${selectedReport.status === "dismissed" ? "bg-[#ED4245]" : ""}
                  `}
                  >
                    {selectedReport.status === "pending"
                      ? "待處理"
                      : selectedReport.status === "accepted"
                        ? "已接受"
                        : "已駁回"}
                  </Badge>

                  {(() => {
                    const severityInfo = getSeverityInfo(selectedReport.severity)
                    const SeverityIcon = severityInfo.icon
                    return (
                      <Badge
                        variant="outline"
                        className="border-none flex items-center gap-1"
                        style={{
                          backgroundColor: severityInfo.color,
                          color: severityInfo.value === "moderate" ? "black" : "white",
                        }}
                      >
                        <SeverityIcon className="h-3 w-3" />
                        {severityInfo.label}
                      </Badge>
                    )
                  })()}
                </div>
                <div className="text-sm text-gray-400 mt-1">報告時間 {formatDate(selectedReport.reportedAt)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">報告者</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="break-words">{selectedReport.reportedBy}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">報告項目</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {selectedReport.reportedItem.type === "bot" ? (
                      <Bot className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Server className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="break-words">
                      {selectedReport.reportedItem.name} (
                      {selectedReport.reportedItem.type === "bot" ? "機器人" : "伺服器"})
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400">報告內容</h4>
                <div className="mt-2 p-3 bg-[#2F3136] rounded-md whitespace-pre-wrap break-words">
                  {selectedReport.content}
                </div>
              </div>

              {selectedReport.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400">附件</h4>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedReport.attachments.map((attachment) => (
                      <div key={attachment.id} className="p-3 bg-[#2F3136] rounded-md">
                        {attachment.type === "image" ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Image className="h-4 w-4 text-gray-400" />
                              <span className="break-words">{attachment.name}</span>
                            </div>
                            <div className="w-full overflow-hidden rounded-md border border-[#202225]">
                              <img
                                src={attachment.url || "/placeholder.svg"}
                                alt={attachment.name}
                                className="w-full h-auto object-contain max-h-[300px]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="break-words">{attachment.name}</span>
                            </div>
                            <div className="p-2 bg-[#202225] rounded-md text-sm font-mono overflow-x-auto break-words whitespace-pre-wrap">
                              {attachment.content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center">
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedReport.severity}
                  onValueChange={(value) => handleSeverityChange(selectedReport.id, value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-[#202225] border-[#1E1F22] text-white focus:ring-[#5865F2]">
                    <SelectValue placeholder="設置嚴重程度" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2F3136] border-[#202225] text-white">
                    {severityLevels.map((level) => {
                      const LevelIcon = level.icon
                      return (
                        <SelectItem key={level.value} value={level.value} className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <LevelIcon className="h-4 w-4" style={{ color: level.color }} />
                            <span>{level.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedReport.status === "pending" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    className="bg-[#57F287] hover:bg-[#57F287]/90 text-black flex-1 sm:flex-none"
                    onClick={() => handleStatusChange(selectedReport.id, "accepted")}
                  >
                    <Check className="h-4 w-4 mr-1" /> 接受報告
                  </Button>
                  <Button
                    className="bg-[#ED4245] hover:bg-[#ED4245]/90 flex-1 sm:flex-none"
                    onClick={() => handleStatusChange(selectedReport.id, "dismissed")}
                  >
                    <X className="h-4 w-4 mr-1" /> 駁回報告
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

