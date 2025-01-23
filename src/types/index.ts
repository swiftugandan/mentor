import { User as PrismaUser, UserRole } from '@prisma/client'

export type SafeUser = Omit<PrismaUser, 'password'> & {
  password?: undefined
}

export interface AuthForm {
  email: string
  password: string
}

export interface RegisterForm extends AuthForm {
  name: string
  role: UserRole
}

export interface StudentRegistrationForm extends RegisterForm {
  gradeLevel: number
  schoolName: string
  interests: string[]
  bio?: string
}

export interface AlumniRegistrationForm extends RegisterForm {
  profession: string
  company: string
  graduationYear: number
  expertise: string[]
  bio?: string
}

export type MentorshipRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface StudentProfile {
  id: string
  gradeLevel: number
  schoolName: string
  interests: string[]
  bio?: string
}

export interface AlumniProfile {
  id: string
  profession: string
  company: string
  graduationYear: number
  expertise: string[]
  bio?: string
}

export interface User {
  id: string
  name: string
  email: string
  studentProfile?: StudentProfile
  alumniProfile?: AlumniProfile
}

export interface MentorshipRequest {
  id: string
  status: MentorshipRequestStatus
  message: string
  createdAt: string
  student: User & { studentProfile: StudentProfile }
  alumni: User & { alumniProfile: AlumniProfile }
}

export type SessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
export type SessionLocation = 'ONLINE' | 'IN_PERSON'
export type SessionMeetingType = 'VIDEO' | 'AUDIO' | 'IN_PERSON'
export type MeetingProvider = 'ZOOM' | 'GOOGLE_MEET'

export interface MentorshipSession {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: SessionStatus

  // Meeting details
  location: SessionLocation
  meetingType: SessionMeetingType
  meetingLink: string | null
  meetingProvider: MeetingProvider | null
  meetingId: string | null

  // Session content
  agenda: string | null
  notes: string | null
  feedback: string | null

  // Two-way feedback
  studentFeedback: string | null
  mentorRating: number | null
  studentRating: number | null

  // Time management
  timezone: string
  duration: number
  remindersSent: string[]

  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt: string | null
  cancelledAt: string | null
  lastModifiedBy: string

  // Relations
  student: User & { studentProfile: StudentProfile }
  mentor: User & { alumniProfile: AlumniProfile }
  studentId: string
  mentorId: string
}
