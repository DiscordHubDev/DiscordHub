import { getAllBots } from "@/lib/actions/get-all-bots";
import DiscordBotListPageClient from "./discord-bot-list";

export default async function DiscordBotListPage() {
  const allBots = await getAllBots();
  return <DiscordBotListPageClient allBots={allBots} />;
}
