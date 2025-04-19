import { Simplify } from '@/lib/utils';
import {
  Prisma,
  ReportSeverity,
  ReportStatus,
  User,
  VoteType,
} from '@prisma/client';
import { UploadedFile } from './types';

type BotCommandInsert = Omit<Prisma.BotCommandCreateInput, 'id' | 'bot'>;

export type UserType = Prisma.UserGetPayload<{
  include: {
    favoriteServers: true;
    favoriteBots: true;
    ownedServers: true;
    developedBots: true;
    adminIn: true;
  };
}>;

export type BotWithRelations = Simplify<
  Omit<
    Prisma.BotCreateInput,
    'commands' | 'developers' | 'tags' | 'screenshots' | 'features'
  > & {
    commands: BotCommandInsert[];
    developers: User[];
    tags: string[];
    screenshots: string[];
    features: string[];
  }
>;

export type BotWithRelationsInput = Omit<BotWithRelations, 'developers'> & {
  developers: { id: string }[];
};

export type BotWithFavorites = Prisma.BotGetPayload<{
  include: {
    favoritedBy: true;
    developers: true;
    commands: true;
  };
}>;

export type CreateServerInput = Prisma.ServerCreateInput;

export type ReportSeverityType = 'severe' | 'moderate' | 'low' | 'untagged'; // severe: 嚴重, moderate: 中等, low: 輕微, untagged: 未標記

export type { VoteType };

export type { ReportStatus };

export type { ReportSeverity };

export type { BotCommandInsert };

export type BotUpdateInput = Prisma.BotUpdateArgs['data'];

export type ServerType = Prisma.ServerGetPayload<{
  include: {
    owner: true;
    favoritedBy: true;
    admins: true;
  };
}>;

// 原本 Prisma 回傳的型別
type ReportRawType = Prisma.ReportGetPayload<{
  include: { reportedBy: true; handledBy: true };
}>;

// 複寫 attachments 欄位的版本 ✅
export type ReportInBoxType = Omit<ReportRawType, 'attachments'> & {
  attachments: UploadedFile[];
};

export type ServerWithMinimalFavorited = Prisma.ServerGetPayload<{
  include: {
    owner: true;
    favoritedBy: {
      select: { id: true };
    };
  };
}>;
