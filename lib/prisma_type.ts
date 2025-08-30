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

export type BotType = Prisma.BotGetPayload<{
  include: {
    developers: {
      select: {
        id: true;
        username: true;
        avatar: true;
        banner: true;
        banner_color: true;
        bio: true;
        joinedAt: true;
        social: true;
      };
    };
    commands: {
      select: {
        id: true;
        name: true;
        description: true;
        usage: true;
        category: true;
      };
    };
    favoritedBy: {
      select: {
        id: true;
      };
    };
  };
  orderBy: {
    upvotes: 'desc';
  };
}>;

export const publicUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  username: true,
  avatar: true,
  banner: true,
  banner_color: true,
  bio: true,
  joinedAt: true,
  social: true,
});

export const publicCommandSelect = Prisma.validator<Prisma.BotCommandSelect>()({
  id: true,
  name: true,
  description: true,
  usage: true,
  category: true,
});

// ⛔ 不要把 secret / VoteNotificationURL 寫進來
export const publicBotSelect = Prisma.validator<Prisma.BotSelect>()({
  id: true,
  name: true,
  icon: true,
  description: true,
  servers: true,
  upvotes: true,
  isAdmin: true,
  verified: true,
  tags: true,
  prefix: true,
  approvedAt: true,
  banner: true,
  website: true,
  inviteUrl: true,
  supportServer: true,
  longDescription: true,
  features: true,
  screenshots: true,
  pin: true,
  pinExpiry: true,
  createdAt: true,
  developers: { select: publicUserSelect },
  commands: { select: publicCommandSelect },
  favoritedBy: {
    select: {
      id: true,
      username: true,
    },
  },
});

export type PublicBot = Prisma.BotGetPayload<{
  select: typeof publicBotSelect;
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

export type EditServerType = Prisma.ServerGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    longDescription: true; // 若不想公開就拿掉
    tags: true;
    members: true;
    online: true;
    upvotes: true;
    icon: true;
    banner: true;
    featured: true;
    createdAt: true;
    website: true;
    inviteUrl: true;
    pin: true;
    secret: true;
    VoteNotificationURL: true;
    owner: {
      select: {
        id: true;
        username: true;
        avatar: true;
        banner: true;
        banner_color: true;
      };
    };
    admins: {
      select: {
        id: true;
        username: true;
      };
    };
    favoritedBy: {
      select: {
        id: true;
        username: true;
      };
    };
    screenshots: true;
    rules: true;
    features: true;
  };
}>;

export type ServerType = Prisma.ServerGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    longDescription: true; // 若不想公開就拿掉
    tags: true;
    members: true;
    online: true;
    upvotes: true;
    icon: true;
    banner: true;
    featured: true;
    createdAt: true;
    website: true;
    inviteUrl: true;
    pin: true;
    owner: {
      select: {
        username: true;
        avatar: true;
        banner: true;
        banner_color: true;
      };
    };
    admins: {
      select: {
        id: true;
        username: true;
      };
    };
    favoritedBy: {
      select: {
        id: true;
        username: true;
      };
    };
    screenshots: true;
    rules: true;
    features: true;
  };
}>;

export const publicServerSelect = Prisma.validator<Prisma.ServerSelect>()({
  id: true,
  name: true,
  description: true,
  longDescription: true,
  tags: true,
  members: true,
  online: true,
  upvotes: true,
  icon: true,
  banner: true,
  featured: true,
  createdAt: true,
  website: true,
  inviteUrl: true,
  pin: true,
  pinExpiry: true,
  owner: {
    select: {
      username: true,
      avatar: true,
      banner: true,
      banner_color: true,
    },
  },
  _count: {
    select: {
      favoritedBy: true,
      admins: true,
    },
  },
  screenshots: true,
  rules: true,
  features: true,
});

export type PublicServer = Prisma.ServerGetPayload<{
  select: typeof publicServerSelect;
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
