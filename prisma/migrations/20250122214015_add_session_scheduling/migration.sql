/*
  Warnings:

  - You are about to drop the column `date` on the `MentorshipSession` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `MentorshipSession` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorId` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MentorshipSession" DROP CONSTRAINT "MentorshipSession_userId_fkey";

-- AlterTable
ALTER TABLE "MentorshipSession" DROP COLUMN "date",
DROP COLUMN "userId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "mentorId" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "AlumniProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
