import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// 強制開發環境用 non-pooling（避掉 Supabase pooler 的 prepared statement bug）
const dbUrl =
    process.env.NODE_ENV !== 'production'
        ? process.env.POSTGRES_URL_NON_POOLING
        : process.env.POSTGRES_PRISMA_URL;

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: dbUrl,
            },
        },
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
