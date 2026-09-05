const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;`);
  console.log("avatarUrl COLUMN ADDED TO users TABLE SUCCESSFULLY");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("MIGRATION ERR:", err);
    process.exit(1);
  });
