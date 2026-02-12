import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Helper to prevent multiple Prisma instances in development (Hot Reload fix)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaMariaDb | undefined;
};

// Use DATABASE_URL from .env file
const connectionString = process.env.DATABASE_URL!;

// --- ADAPTER PATTERN ---
// We initialize the MariaDB adapter once to ensure stable connections
if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaMariaDb(connectionString);
}

// --- CLIENT INITIALIZATION ---
// Create the Prisma Client using the specific MariaDB adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: globalForPrisma.adapter,
  });

// Save the instance to globalThis in non-production environments
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
