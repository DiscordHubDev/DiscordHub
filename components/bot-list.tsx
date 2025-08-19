import BotCard from './bot-card';
import { BotType, PublicBot } from '@/lib/prisma_type';
import { BotListSkeleton } from './bot-skeleton';

export default function BotList({
  bots,
  isLoading = false,
}: {
  bots: PublicBot[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <BotListSkeleton />;
  }

  if (!bots || bots.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <p className="text-sm">找不到符合條件的機器人 🙁</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bots.map(bot => (
        <BotCard key={bot.id} bot={bot} />
      ))}
    </div>
  );
}
