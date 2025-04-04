import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { upsertUserFromSession } from "@/lib/actions/user";

export type UserType = Prisma.UserGetPayload<{
  include: {
    favoriteServers: true;
    favoriteBots: true;
    ownedServers: true;
    developedBots: true;
  };
}>;

export async function getUser(): Promise<UserType | null> {
  const session = await getServerSession(authOptions);
  return upsertUserFromSession(session!);
}
