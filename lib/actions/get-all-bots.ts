import prisma from "@/lib/prisma";

export async function getAllBots() {
  const bots = await prisma.bot.findMany({
    where: {
      status: "approved",
    },
    include: {
      developers: true,
      commands: true,
    },
  });

  return bots;
}
