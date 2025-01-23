-- Add nullable columns first
ALTER TABLE "MentorshipSession" ADD COLUMN "duration" INTEGER;
ALTER TABLE "MentorshipSession" ADD COLUMN "timezone" TEXT;
ALTER TABLE "MentorshipSession" ADD COLUMN "lastModifiedBy" TEXT;
ALTER TABLE "MentorshipSession" ADD COLUMN "meetingProvider" TEXT;
ALTER TABLE "MentorshipSession" ADD COLUMN "meetingId" TEXT;
ALTER TABLE "MentorshipSession" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "MentorshipSession" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "MentorshipSession" ADD COLUMN "remindersSent" TIMESTAMP(3)[] DEFAULT '{}';

-- Update existing records
UPDATE "MentorshipSession" 
SET 
  "duration" = EXTRACT(EPOCH FROM ("endTime" - "startTime"))/60,
  "timezone" = 'UTC',
  "lastModifiedBy" = "studentId";

-- Make columns non-nullable after update
ALTER TABLE "MentorshipSession" ALTER COLUMN "duration" SET NOT NULL;
ALTER TABLE "MentorshipSession" ALTER COLUMN "timezone" SET NOT NULL;
ALTER TABLE "MentorshipSession" ALTER COLUMN "lastModifiedBy" SET NOT NULL;

-- Add new fields to Availability
ALTER TABLE "Availability" ADD COLUMN "location" TEXT NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "Availability" ADD COLUMN "meetingType" TEXT NOT NULL DEFAULT 'VIDEO';
ALTER TABLE "Availability" ADD COLUMN "meetingLink" TEXT;
ALTER TABLE "Availability" ADD COLUMN "venue" TEXT;

-- Remove default values after migration
ALTER TABLE "MentorshipSession" ALTER COLUMN "timezone" DROP DEFAULT;
ALTER TABLE "MentorshipSession" ALTER COLUMN "duration" DROP DEFAULT; 