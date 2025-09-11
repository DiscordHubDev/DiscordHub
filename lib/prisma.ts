import { PrismaClient } from '@prisma/client';

type GlobalPrisma = {
  prisma: PrismaClient | undefined;
  prismaShutdownHookInstalled?: boolean;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

// 強制開發環境用 non-pooling（避掉 Supabase pooler 的 prepared statement bug）
const dbUrl =
  process.env.NODE_ENV !== 'production'
    ? process.env.POSTGRES_URL_NON_POOLING
    : process.env.CUSTOM_PRISMA_URL;

// 直接回傳 PrismaClient，不再套 Accelerate
const createPrisma = () =>
  new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: ['query', 'error', 'warn'],
  });

function installPrismaShutdownHooks(client: PrismaClient) {
  if (globalForPrisma.prismaShutdownHookInstalled) return;
  globalForPrisma.prismaShutdownHookInstalled = true;

  const disconnect = async (reason: string) => {
    try {
      await client.$disconnect();
      // 這裡不強制 process.exit，交給執行環境自行結束
      // 避免在 Serverless/Next.js 中提早終止請求
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[prisma] disconnected due to: ${reason}`);
      }
    } catch (e) {
      console.error('[prisma] disconnect error:', e);
    }
  };

  // Node 在事件迴圈即將清空時
  process.once('beforeExit', () => void disconnect('beforeExit'));

  // 常見關閉訊號
  process.once('SIGINT', () => void disconnect('SIGINT'));
  process.once('SIGTERM', () => void disconnect('SIGTERM'));

  // nodemon 會送 SIGUSR2（重啟）
  process.once('SIGUSR2', () => void disconnect('SIGUSR2'));
}

// 單例（dev 環境避免熱重載重複建立）
export const prisma = globalForPrisma.prisma ?? createPrisma();

// 安裝自動釋放 hook（只裝一次）
installPrismaShutdownHooks(prisma);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
