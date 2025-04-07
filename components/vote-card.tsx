import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, Users, Bot } from 'lucide-react';
import VoteButton from '@/components/vote-button';
import Link from 'next/link';

interface VoteCardProps {
  id: string;
  type: 'server' | 'bot';
  name: string;
  description: string;
  icon?: string;
  votes: number;
  members?: number;
  servers?: number;
  verified?: boolean;
}

export default function VoteCard({
  id,
  type,
  name,
  description,
  icon,
  votes,
  members,
  servers,
  verified,
}: VoteCardProps) {
  return (
    <Card className="bg-[#2b2d31] border-[#1e1f22] hover:border-[#5865f2] transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#36393f] overflow-hidden">
            <img
              src={icon || '/placeholder.svg?height=40&width=40'}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center">
            <CardTitle className="text-white">{name}</CardTitle>
            {verified && type === 'bot' && (
              <span className="ml-2 text-[#5865f2]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-badge-check"
                >
                  <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
        <div className="flex items-center text-sm text-gray-400 mt-2">
          {type === 'server' && members !== undefined && (
            <div className="flex items-center">
              <Users size={14} className="mr-1" />
              <span>{members.toLocaleString()} 成員</span>
            </div>
          )}
          {type === 'bot' && servers !== undefined && (
            <div className="flex items-center">
              <Bot size={14} className="mr-1" />
              <span>{servers.toLocaleString()} 伺服器</span>
            </div>
          )}
          <div className="flex items-center ml-4">
            <ArrowUp size={14} className="mr-1" />
            <span>{votes.toLocaleString()} 票</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Link
          href={`/${type === 'server' ? 'servers' : 'bots'}/${id}`}
          className="flex-1 mr-2"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#5865f2] text-[#5865f2] hover:bg-[#5865f2] hover:text-white"
          >
            查看詳情
          </Button>
        </Link>
        <VoteButton
          id={id}
          type={type}
          initialVotes={votes}
          size="sm"
          className="bg-[#5865f2] hover:bg-[#4752c4]"
        />
      </CardFooter>
    </Card>
  );
}
