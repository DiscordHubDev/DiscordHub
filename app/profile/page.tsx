import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bot, Star, Settings, Plus } from "lucide-react";
import UserHeader from "@/components/user-header";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import UserSettingsForm from "./settings";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    return redirect("/api/auth/signin/discord?callbackUrl=/profile");
  }

  // 獲取用戶收藏的伺服器和機器人
  const favoriteServers = user?.favoriteServers;
  const favoriteBots = user?.favoriteBots;

  return (
    <div className="min-h-screen bg-[#1e1f22] text-white">
      {/* User Header */}
      <UserHeader user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="servers" className="mb-8">
          <TabsList className="bg-[#2b2d31] border-b border-[#1e1f22] w-full overflow-x-auto">
            <TabsTrigger
              value="servers"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Users size={16} className="mr-2" />
              我的伺服器
            </TabsTrigger>
            <TabsTrigger
              value="bots"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Bot size={16} className="mr-2" />
              我的機器人
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Star size={16} className="mr-2" />
              我的收藏
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#36393f]"
            >
              <Settings size={16} className="mr-2" />
              帳號設置
            </TabsTrigger>
          </TabsList>

          {/* 我的伺服器 */}
          <TabsContent value="servers" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">我的伺服器</h2>
              <Link href="/add-server">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  <Plus size={16} />
                  新增伺服器
                </Button>
              </Link>
            </div>

            {user.ownedServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.ownedServers.map((server) => (
                  <Link
                    href={`/servers/${server.id}`}
                    key={server.id}
                    className="block"
                  >
                    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                            <img
                              src={
                                server.icon ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={server.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <CardTitle className="text-white">
                              {server.name}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {server.members.toLocaleString()} 成員
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {server.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {server.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#36393f] text-gray-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
                        >
                          管理伺服器
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">您還沒有創建任何伺服器</p>
                <Link href="/add-server">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                    <Plus size={16} />
                    新增伺服器
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 我的機器人 */}
          <TabsContent value="bots" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">我的機器人</h2>
              <Link href="/add-bot">
                <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white">
                  <Plus size={16} />
                  新增機器人
                </Button>
              </Link>
            </div>

            {user.developedBots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.developedBots.map((bot) => (
                  <Link href={`/bots/${bot.id}`} key={bot.id} className="block">
                    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                            <img
                              src={
                                bot.icon ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={bot.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center">
                            <CardTitle className="text-white">
                              {bot.name}
                            </CardTitle>
                            {bot.verified && (
                              <span className="ml-2 text-[#5865f2]">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
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
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {bot.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {bot.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#36393f] text-gray-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 mt-2">
                          <Users size={14} className="mr-1" />
                          <span>{bot.servers.toLocaleString()} 伺服器</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
                        >
                          管理機器人
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#2b2d31] rounded-lg p-8 text-center">
                <p className="text-gray-300 mb-4">您還沒有創建任何機器人</p>
                <Link href="/add-bot">
                  <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
                    <Plus size={16} className="mr-2" />
                    新增機器人
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* 我的收藏 */}
          <TabsContent value="favorites" className="mt-6">
            <div className="space-y-8">
              {/* 收藏的伺服器 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">收藏的伺服器</h2>
                {favoriteServers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteServers.map((server) => (
                      <Link
                        href={`/servers/${server.id}`}
                        key={server.id}
                        className="block"
                      >
                        <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                                <img
                                  src={
                                    server.icon ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={server.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <CardTitle className="text-white">
                                  {server.name}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  {server.members.toLocaleString()} 成員
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {server.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2b2d31] rounded-lg p-6 text-center">
                    <p className="text-gray-300">您還沒有收藏任何伺服器</p>
                  </div>
                )}
              </div>

              {/* 收藏的機器人 */}
              <div>
                <h2 className="text-2xl font-bold mb-4">收藏的機器人</h2>
                {favoriteBots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteBots.map((bot) => (
                      <Link
                        href={`/bots/${bot.id}`}
                        key={bot.id}
                        className="block"
                      >
                        <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
                          <CardHeader className="pb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
                                <img
                                  src={
                                    bot.icon ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={bot.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex items-center">
                                <CardTitle className="text-white">
                                  {bot.name}
                                </CardTitle>
                                {bot.verified && (
                                  <span className="ml-2 text-[#5865f2]">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
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
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {bot.description}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#2b2d31] rounded-lg p-6 text-center">
                    <p className="text-gray-300">您還沒有收藏任何機器人</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 帳號設置 */}
          <TabsContent value="settings" className="mt-6">
            <div className="bg-[#2b2d31] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">帳號設置</h2>

              <UserSettingsForm user={user} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
