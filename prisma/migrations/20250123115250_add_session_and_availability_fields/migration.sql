/*
  Warnings:

  - Added the required column `duration` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastModifiedBy` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `MentorshipSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "meetingType" TEXT NOT NULL DEFAULT 'VIDEO',
ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "MentorshipSession" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "lastModifiedBy" TEXT NOT NULL,
ADD COLUMN     "meetingId" TEXT,
ADD COLUMN     "meetingProvider" TEXT,
ADD COLUMN     "mentorRating" INTEGER,
ADD COLUMN     "remindersSent" TIMESTAMP(3)[],
ADD COLUMN     "studentFeedback" TEXT,
ADD COLUMN     "studentRating" INTEGER,
ADD COLUMN     "timezone" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Availability_dayOfWeek_idx" ON "Availability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "Availability_alumniId_idx" ON "Availability"("alumniId");

-- CreateIndex
CREATE INDEX "MentorshipSession_status_idx" ON "MentorshipSession"("status");

-- CreateIndex
CREATE INDEX "MentorshipSession_startTime_idx" ON "MentorshipSession"("startTime");

-- CreateIndex
CREATE INDEX "MentorshipSession_mentorId_status_idx" ON "MentorshipSession"("mentorId", "status");

-- CreateIndex
CREATE INDEX "MentorshipSession_studentId_status_idx" ON "MentorshipSession"("studentId", "status");
