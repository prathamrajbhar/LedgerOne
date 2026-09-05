const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;`);
  console.log("COLUMNS ADDED SUCCESSFULLY");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("MIGRATION ERR:", err);
    process.exit(1);
  });
