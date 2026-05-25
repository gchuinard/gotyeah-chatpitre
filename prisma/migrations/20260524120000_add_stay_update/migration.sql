-- CreateEnum
CREATE TYPE "StayUpdateImageVariant" AS ENUM ('COBALT', 'PAPRIKA', 'CANARI', 'FEUILLE');

-- CreateEnum
CREATE TYPE "StayUpdateImagePose" AS ENUM ('SITTING', 'SLEEPING', 'STANDING', 'WATCHING');

-- CreateTable
CREATE TABLE "StayUpdate" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageVariant" "StayUpdateImageVariant" NOT NULL DEFAULT 'COBALT',
    "imagePose" "StayUpdateImagePose" NOT NULL DEFAULT 'SITTING',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StayUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StayUpdate_bookingId_idx" ON "StayUpdate"("bookingId");

-- CreateIndex
CREATE INDEX "StayUpdate_catId_idx" ON "StayUpdate"("catId");

-- AddForeignKey
ALTER TABLE "StayUpdate" ADD CONSTRAINT "StayUpdate_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayUpdate" ADD CONSTRAINT "StayUpdate_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StayUpdate" ADD CONSTRAINT "StayUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
