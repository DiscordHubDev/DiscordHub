import { notFound } from "next/navigation";
import BotDetailClient from "./client";
import { getAllBots, getBot } from "@/lib/actions/bots";

export default async function BotDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const bot = await getBot(params.id);
  const allBots = await getAllBots();

  if (!bot) {
    notFound();
  }

  const isFavorited = !!bot.favoritedBy?.length;

  return (
    <BotDetailClient allBots={allBots} bot={bot} isFavorited={isFavorited} />
  );
}
