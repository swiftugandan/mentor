-- AlterTable
ALTER TABLE "MentorshipSession" ADD COLUMN     "agenda" TEXT,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "meetingType" TEXT NOT NULL DEFAULT 'VIDEO';
