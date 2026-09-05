const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dbInfo = await prisma.$queryRawUnsafe(`SELECT current_schema(), current_database(), current_user;`);
  console.log("DB INFO:", dbInfo);

  // Alter tables in public schema explicitly
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."contacts" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;`);
  
  const checkUsers = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name IN ('avatarUrl', 'bannerUrl');
  `);
  console.log("Checked public.users columns:", checkUsers);

  const checkContacts = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'contacts' AND column_name = 'bannerUrl';
  `);
  console.log("Checked public.contacts columns:", checkContacts);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("MIGRATION ERR:", err);
    process.exit(1);
  });
