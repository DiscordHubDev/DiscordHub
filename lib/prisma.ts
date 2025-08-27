import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof extendedPrisma> | undefined;
};

// 強制開發環境用 non-pooling（避掉 Supabase pooler 的 prepared statement bug）
const dbUrl =
  process.env.NODE_ENV !== 'production'
    ? process.env.POSTGRES_URL_NON_POOLING
    : process.env.CUSTOM_PRISMA_URL;

// 先包一層工廠 function，確保型別正確
const extendedPrisma = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['query', 'error', 'warn'],
  }).$extends(withAccelerate());

export const prisma = globalForPrisma.prisma ?? extendedPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
