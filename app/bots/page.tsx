import { getAllBots } from '@/lib/actions/bots';
import DiscordBotListPageClient from './discord-bot-list';

export const revalidate = 3600;

export default async function DiscordBotListPage() {
  const allBots = await getAllBots();
  return <DiscordBotListPageClient allBots={allBots} />;
}
