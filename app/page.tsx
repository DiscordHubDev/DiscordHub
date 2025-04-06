import { getAllServers } from "@/lib/actions/servers";
import type React from "react";
import DiscordServerListPageClient from "./client";

export default async function DiscordServerListPage() {
  const servers = await getAllServers();
  return (
    <>
      <DiscordServerListPageClient servers={servers} />
    </>
  );
}
