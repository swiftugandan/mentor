-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ALUMNI', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "gradeLevel" INTEGER NOT NULL,
    "schoolName" TEXT NOT NULL,
    "interests" TEXT[],
    "bio" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlumniProfile" (
    "id" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "expertise" TEXT[],
    "bio" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AlumniProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipRequest" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,

    CONSTRAINT "MentorshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipSession" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "endTime" TIMESTAMP(3) NOT NULL,
    "mentorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "agenda" TEXT,
    "feedback" TEXT,
    "location" TEXT NOT NULL DEFAULT 'ONLINE',
    "meetingLink" TEXT,
    "meetingType" TEXT NOT NULL DEFAULT 'VIDEO',
    "venue" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "lastModifiedBy" TEXT NOT NULL,
    "meetingId" TEXT,
    "meetingProvider" TEXT,
    "mentorRating" INTEGER,
    "remindersSent" TIMESTAMP(3)[],
    "studentFeedback" TEXT,
    "studentRating" INTEGER,
    "timezone" TEXT NOT NULL,

    CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "alumniId" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'ONLINE',
    "meetingLink" TEXT,
    "meetingType" TEXT NOT NULL DEFAULT 'VIDEO',
    "venue" TEXT,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AlumniProfile_userId_key" ON "AlumniProfile"("userId");

-- CreateIndex
CREATE INDEX "MentorshipSession_status_idx" ON "MentorshipSession"("status");

-- CreateIndex
CREATE INDEX "MentorshipSession_startTime_idx" ON "MentorshipSession"("startTime");

-- CreateIndex
CREATE INDEX "MentorshipSession_mentorId_status_idx" ON "MentorshipSession"("mentorId", "status");

-- CreateIndex
CREATE INDEX "MentorshipSession_studentId_status_idx" ON "MentorshipSession"("studentId", "status");

-- CreateIndex
CREATE INDEX "Availability_dayOfWeek_idx" ON "Availability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "Availability_alumniId_idx" ON "Availability"("alumniId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlumniProfile" ADD CONSTRAINT "AlumniProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_alumniId_fkey" FOREIGN KEY ("alumniId") REFERENCES "AlumniProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
