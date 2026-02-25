-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "calorieTarget" INTEGER,
    "proteinTarget" INTEGER,
    "carbsTarget" INTEGER,
    "fatTarget" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "barcode" TEXT,
    "caloriesPerGram" INTEGER NOT NULL,
    "proteinPerGram" INTEGER NOT NULL,
    "carbsPerGram" INTEGER NOT NULL,
    "fatPerGram" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLogEntry" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "foodId" TEXT,
    "grams" INTEGER NOT NULL,
    "caloriesSnapshot" INTEGER NOT NULL,
    "proteinSnapshot" INTEGER NOT NULL,
    "carbsSnapshot" INTEGER NOT NULL,
    "fatSnapshot" INTEGER NOT NULL,

    CONSTRAINT "DailyLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Food_barcode_key" ON "Food"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_userId_date_key" ON "DailyLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLogEntry" ADD CONSTRAINT "DailyLogEntry_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLogEntry" ADD CONSTRAINT "DailyLogEntry_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;
