import prisma from "@/lib/prisma";

export async function getPendingBots() {
  const bots = await prisma.bot.findMany({
    where: {
      status: "pending",
    },
    include: {
      developers: true,
      commands: true,
    },
    orderBy: {
      upvotes: "desc",
    },
  });

  return bots;
}
