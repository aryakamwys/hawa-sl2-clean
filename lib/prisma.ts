import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaMariaDb(connectionString);

export const prisma =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = prisma;
