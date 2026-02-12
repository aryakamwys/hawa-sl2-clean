import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // --- ADMIN USER SEEDING ---
  // We use 'upsert' (Update + Insert) here.
  // Logic: If 'admin@hawa.com' exists, do nothing (update: {}).
  //        If it doesn't exist, create it with the data below.
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hawa.com' },
    update: {},
    create: {
      name: 'Hawa Admin',
      email: 'admin@hawa.com',
      passwordHash: 'bypass_hash', // Note: This is a placeholder hash for dev
      role: 'ADMIN',
    },
  });
  console.log('✅ Pseudo-Admin created:', admin.name);
}

// Execute the main function and handle database disconnection
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });