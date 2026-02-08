import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaMariaDb | undefined;
};

// Use DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL!;

// Create adapter factory once
if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaMariaDb(connectionString);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: globalForPrisma.adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
