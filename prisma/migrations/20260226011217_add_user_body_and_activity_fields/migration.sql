-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activityLevel" "ActivityLevel",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "currentWeight" DOUBLE PRECISION,
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "targetWeight" DOUBLE PRECISION;
