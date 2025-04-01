import type { BotType } from "@/lib/types"
import BotCard from "./bot-card"

interface BotListProps {
  bots: BotType[]
}

export default function BotList({ bots }: BotListProps) {
  return (
    <div className="space-y-4">
      {bots.map((bot) => (
        <BotCard key={bot.id} bot={bot} />
      ))}
    </div>
  )
}

