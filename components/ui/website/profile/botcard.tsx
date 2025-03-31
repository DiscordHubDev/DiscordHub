import ItemCard from "./card";
import { BotIcon } from "lucide-react";

type BotCardProps = {
  data: {
    id: string;
    name: string;
    description: string;
    tags?: string[];
  };
};

const BotCard = ({ data }: BotCardProps) => {
  return (
    <ItemCard
      title={data.name}
      description={data.description}
      icon={<BotIcon className="w-5 h-5 text-primary" />}
      tags={data.tags}
    />
  );
};

export default BotCard;
