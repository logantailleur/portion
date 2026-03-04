/*
  Warnings:

  - You are about to drop the column `calories` on the `DailyLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `carbs` on the `DailyLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `DailyLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `DailyLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `DailyLogEntry` table. All the data in the column will be lost.
  - You are about to alter the column `grams` on the `DailyLogEntry` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `caloriesSnapshot` to the `DailyLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbsSnapshot` to the `DailyLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatSnapshot` to the `DailyLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proteinSnapshot` to the `DailyLogEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateEnum
CREATE TYPE "EntrySource" AS ENUM ('manual', 'barcode', 'api');

-- DropForeignKey
ALTER TABLE "DailyLog" DROP CONSTRAINT "DailyLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailyLogEntry" DROP CONSTRAINT "DailyLogEntry_dailyLogId_fkey";

-- DropForeignKey
ALTER TABLE "DailyLogEntry" DROP CONSTRAINT "DailyLogEntry_foodId_fkey";

-- AlterTable
ALTER TABLE "DailyLogEntry" DROP COLUMN "calories",
DROP COLUMN "carbs",
DROP COLUMN "createdAt",
DROP COLUMN "fat",
DROP COLUMN "protein",
ADD COLUMN     "caloriesSnapshot" INTEGER NOT NULL,
ADD COLUMN     "carbsSnapshot" INTEGER NOT NULL,
ADD COLUMN     "entrySource" "EntrySource" NOT NULL DEFAULT 'manual',
ADD COLUMN     "fatSnapshot" INTEGER NOT NULL,
ADD COLUMN     "foodName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mealType" "MealType" NOT NULL DEFAULT 'snack',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "proteinSnapshot" INTEGER NOT NULL,
ALTER COLUMN "foodId" DROP NOT NULL,
ALTER COLUMN "grams" SET DATA TYPE INTEGER;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLogEntry" ADD CONSTRAINT "DailyLogEntry_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLogEntry" ADD CONSTRAINT "DailyLogEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;
