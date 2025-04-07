import type { BotType } from '@/lib/types';
import BotCard from './bot-card';
import { BotWithRelations } from '@/lib/prisma_type';

interface BotListProps {
  bots: BotWithRelations[];
}

export default function BotList({ bots }: BotListProps) {
  return (
    <div className="space-y-4">
      {bots.map(bot => (
        <BotCard key={bot.id} bot={bot} />
      ))}
    </div>
  );
}
