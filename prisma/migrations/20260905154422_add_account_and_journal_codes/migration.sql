-- AlterTable: Add code column to chart_of_accounts
-- If there are existing records, you may need to populate them first
ALTER TABLE "chart_of_accounts" ADD COLUMN "code" TEXT;

-- Update existing accounts with temporary codes if any exist
-- This assumes you'll manually fix these codes after migration
DO $$
DECLARE
  account_record RECORD;
  counter INTEGER := 1000;
BEGIN
  FOR account_record IN SELECT id, type FROM "chart_of_accounts" ORDER BY "createdAt"
  LOOP
    UPDATE "chart_of_accounts"
    SET "code" = CASE
      WHEN type = 'ASSET' THEN '1' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'LIABILITY' THEN '2' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'BANK' THEN '1' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'CAPITAL' THEN '3' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'CASH' THEN '1' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'INCOME' THEN '4' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'EXPENSES' THEN '5' || LPAD(counter::TEXT, 3, '0')
      WHEN type = 'OTHER_EXPENSES' THEN '5' || LPAD(counter::TEXT, 3, '0')
    END
    WHERE id = account_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make code NOT NULL and add unique constraint
ALTER TABLE "chart_of_accounts" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_code_key" UNIQUE ("code");

-- Create index on code
CREATE INDEX "chart_of_accounts_code_idx" ON "chart_of_accounts"("code");

-- AlterTable: Add code column to journals
ALTER TABLE "journals" ADD COLUMN "code" TEXT;

-- Update existing journals with codes if any exist
DO $$
DECLARE
  journal_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR journal_record IN SELECT id, type FROM "journals" ORDER BY "createdAt"
  LOOP
    UPDATE "journals"
    SET "code" = CASE
      WHEN type = 'SALES' THEN 'SAL' || counter::TEXT
      WHEN type = 'PURCHASE' THEN 'PUR' || counter::TEXT
      WHEN type = 'BANK' THEN 'BNK' || counter::TEXT
      WHEN type = 'CASH' THEN 'CSH' || counter::TEXT
    END
    WHERE id = journal_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make code NOT NULL and add unique constraint
ALTER TABLE "journals" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "journals" ADD CONSTRAINT "journals_code_key" UNIQUE ("code");

-- Create index on code
CREATE INDEX "journals_code_idx" ON "journals"("code");
