import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BotApplications from "@/components/ui/admin/bot-applications";
import BotServerManagement from "@/components/ui/admin/bot-server-management";
import ReportInbox from "@/components/ui/admin/report-inbox";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getPendingBots } from "@/lib/actions/get-pending-bot";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const bots = await getPendingBots();

  return (
    <div className="space-y-6 p-13">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          歡迎回來，{session?.user?.name}！
        </h2>
        <p className="text-muted-foreground">這是 DiscordHubs 的管理後台。</p>
      </div>

      <Tabs defaultValue="applications" className="space-y-4 rounded-md">
        <TabsList className="bg-[#2F3136] text-white ">
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
          >
            待審核機器人
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
          >
            管理機器人和伺服器
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
          >
            檢舉收件匣
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <BotApplications applications={bots} />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <BotServerManagement />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportInbox />
        </TabsContent>
      </Tabs>
    </div>
  );
}
