const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const usersCols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users';`);
  const contactsCols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'contacts';`);
  console.log("users columns:", usersCols.map(c => c.column_name));
  console.log("contacts columns:", contactsCols.map(c => c.column_name));
}

check()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
