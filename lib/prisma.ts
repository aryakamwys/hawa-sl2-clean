import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaMariaDb | undefined;
};

// Build connection string
const connectionString = `mariadb://${process.env.DB_USER || 'hawa_user'}:${process.env.DB_PASSWORD || 'hawa_password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}/${process.env.DB_NAME || 'hawa'}`;

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
