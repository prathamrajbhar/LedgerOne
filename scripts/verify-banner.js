const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const usersCols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bannerUrl';`);
  const contactsCols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'bannerUrl';`);
  console.log("users bannerUrl column exists:", usersCols.length > 0);
  console.log("contacts bannerUrl column exists:", contactsCols.length > 0);
}

check()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
