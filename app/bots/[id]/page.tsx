import { notFound } from 'next/navigation';
import BotDetailClient from './client';
import { getAllBots, getBot } from '@/lib/actions/bots';

export default async function BotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const bot = await getBot(id);
  const allBots = await getAllBots();

  if (!bot) {
    notFound();
  }

  const isFavorited = !!bot.favoritedBy?.length;

  return (
    <BotDetailClient allBots={allBots} bot={bot} isFavorited={isFavorited} />
  );
}
