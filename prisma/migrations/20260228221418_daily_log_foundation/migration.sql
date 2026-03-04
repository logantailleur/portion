-- AlterTable: DailyLogEntry (matches DB state after this migration was applied)
ALTER TABLE "DailyLogEntry" RENAME COLUMN "caloriesSnapshot" TO "calories";
ALTER TABLE "DailyLogEntry" RENAME COLUMN "proteinSnapshot" TO "protein";
ALTER TABLE "DailyLogEntry" RENAME COLUMN "carbsSnapshot" TO "carbs";
ALTER TABLE "DailyLogEntry" RENAME COLUMN "fatSnapshot" TO "fat";
ALTER TABLE "DailyLogEntry" ALTER COLUMN "calories" TYPE DOUBLE PRECISION USING "calories"::double precision;
ALTER TABLE "DailyLogEntry" ALTER COLUMN "protein" TYPE DOUBLE PRECISION USING "protein"::double precision;
ALTER TABLE "DailyLogEntry" ALTER COLUMN "carbs" TYPE DOUBLE PRECISION USING "carbs"::double precision;
ALTER TABLE "DailyLogEntry" ALTER COLUMN "fat" TYPE DOUBLE PRECISION USING "fat"::double precision;
ALTER TABLE "DailyLogEntry" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DailyLogEntry" ALTER COLUMN "grams" TYPE DOUBLE PRECISION USING "grams"::double precision;

-- Set foodId to required (only safe if no nulls exist)
UPDATE "DailyLogEntry" SET "foodId" = (SELECT "id" FROM "Food" LIMIT 1) WHERE "foodId" IS NULL;
ALTER TABLE "DailyLogEntry" ALTER COLUMN "foodId" SET NOT NULL;

-- Recreate FKs with ON DELETE CASCADE for DailyLog
ALTER TABLE "DailyLog" DROP CONSTRAINT IF EXISTS "DailyLog_userId_fkey";
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyLogEntry" DROP CONSTRAINT IF EXISTS "DailyLogEntry_dailyLogId_fkey";
ALTER TABLE "DailyLogEntry" ADD CONSTRAINT "DailyLogEntry_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DailyLogEntry" DROP CONSTRAINT IF EXISTS "DailyLogEntry_foodId_fkey";
ALTER TABLE "DailyLogEntry" ADD CONSTRAINT "DailyLogEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
