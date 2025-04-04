import { Prisma, User } from "@prisma/client";

import { Simplify } from "@/lib/utils";

type BotCommandInsert = Omit<Prisma.BotCommandCreateInput, "id" | "bot">;

export type BotWithRelations = Simplify<
  Omit<
    Prisma.BotCreateInput,
    "commands" | "developers" | "tags" | "screenshots" | "features"
  > & {
    commands: BotCommandInsert[];
    developers: User[];
    tags: string[];
    screenshots: string[];
    features: string[];
  }
>;

export type BotWithRelationsInput = Omit<BotWithRelations, "developers"> & {
  developers: { id: string }[];
};
