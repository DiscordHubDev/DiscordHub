"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

interface ServerCardProps {
  server: {
    id: string;
    name: string;
    icon: string;
    banner: string;
    memberCount?: number;
    isInServer: boolean;
  };
}

export function ServerCard({ server }: ServerCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="overflow-hidden bg-[#2f3136] border-[#1e1f22] transition-all duration-200 hover:shadow-md hover:shadow-[#5865f2]/10 hover:-translate-y-1">
      {/* Banner */}
      <div className="relative h-24 w-full">
        {server.banner !== "" ? (
          <Image
            src={server.banner}
            alt={`${server.name} banner`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#2f3136]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#2f3136] to-transparent/0 opacity-70" />
      </div>

      {/* Server Icon */}
      <div className="relative -mt-8 ml-4">
        <Avatar className="h-16 w-16 border-4 border-[#2f3136] bg-[#36393f]">
          <AvatarImage
            src={!imgError && server.icon !== "" ? server.icon : undefined}
            alt={`${server.name} icon`}
            onError={() => setImgError(true)}
          />
          <AvatarFallback>
            {server.name?.charAt(0).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      <CardContent className="pt-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-white text-lg truncate max-w-[200px]">
              {server.name}
            </h3>
            {server.isInServer && server.memberCount && (
              <p className="text-[#b9bbbe] text-sm">
                {server.memberCount.toLocaleString()} members
              </p>
            )}
          </div>
          <Badge
            className={cn(
              "mt-1",
              server.isInServer
                ? "bg-[#3ba55c] hover:bg-[#3ba55c]/90"
                : "bg-[#ed4245] hover:bg-[#ed4245]/90"
            )}
          >
            {server.isInServer ? "已加入" : "未加入"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="border-t border-[#40444b] pt-3 pb-4">
        <button
          className={cn(
            "w-full py-2 rounded-md font-medium text-sm transition-colors",
            server.isInServer
              ? "bg-[#4f545c] hover:bg-[#686d73] text-white"
              : "bg-[#5865f2] hover:bg-[#4752c4] text-white"
          )}
        >
          {server.isInServer ? "發布伺服器" : "邀請機器人"}
        </button>
      </CardFooter>
    </Card>
  );
}
