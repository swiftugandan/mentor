import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { UserRole, Prisma } from "@prisma/client"
import { z } from "zod"
import { differenceInMinutes, addMinutes } from "date-fns"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NotificationService } from "@/lib/notification-service"
import {
  validateSessionTime,
  createSessionUpdateData,
  MIN_DURATION,
  MAX_DURATION,
  BUFFER_TIME,
} from "@/lib/session-utils"

const notificationService = new NotificationService()

const SESSION_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const

type Location = "ONLINE" | "IN_PERSON"
type MeetingType = "VIDEO" | "AUDIO" | "IN_PERSON"

// Validate that meeting type matches location
const validateMeetingType = (location: Location, meetingType: MeetingType) => {
  if (location === "IN_PERSON" && meetingType !== "IN_PERSON") {
    return false
  }
  if (location === "ONLINE" && meetingType === "IN_PERSON") {
    return false
  }
  return true
}

// Check for scheduling conflicts
async function checkSchedulingConflicts(
  startTime: Date,
  endTime: Date,
  mentorId: string,
  studentId: string,
  sessionId?: string
): Promise<string | null> {
  const bufferStart = addMinutes(startTime, -BUFFER_TIME)
  const bufferEnd = addMinutes(endTime, BUFFER_TIME)

  const overlappingSessions = await db.mentorshipSession.findFirst({
    where: {
      status: "SCHEDULED",
      id: sessionId ? { not: sessionId } : undefined,
      startTime: { lt: bufferEnd },
      endTime: { gt: bufferStart },
      OR: [
        { mentorId },
        { studentId }
      ]
    }
  })

  if (overlappingSessions) {
    return "This time slot conflicts with another session"
  }

  return null
}

// Helper function to calculate session duration
function calculateDuration(startTime: Date, endTime: Date): number {
  return differenceInMinutes(endTime, startTime)
}

// Helper function to get user's timezone
function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  mentorId: z.string(),
  agenda: z.string().optional(),
  location: z.enum(["ONLINE", "IN_PERSON"]),
  meetingType: z.enum(["VIDEO", "AUDIO", "IN_PERSON"]),
  meetingLink: z.string().url("Invalid meeting link").optional(),
  venue: z.string().min(1, "Venue is required for in-person meetings").optional(),
}).refine(data => {
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const duration = differenceInMinutes(endTime, startTime)
  return duration >= MIN_DURATION && duration <= MAX_DURATION
}, {
  message: `Session duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes`
}).refine(data => {
  return validateMeetingType(data.location as Location, data.meetingType as MeetingType)
}, {
  message: "Invalid meeting type for selected location"
}).refine(data => {
  if (data.location === "IN_PERSON" && !data.venue) {
    return false
  }
  return true
}, {
  message: "Venue is required for in-person meetings"
})

const updateSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  agenda: z.string().optional(),
  status: z.enum(SESSION_STATUSES).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  studentFeedback: z.string().optional(),
  mentorRating: z.number().min(1).max(5).optional(),
  studentRating: z.number().min(1).max(5).optional(),
  location: z.enum(["ONLINE", "IN_PERSON"]).optional(),
  meetingType: z.enum(["VIDEO", "AUDIO", "IN_PERSON"]).optional(),
  meetingLink: z.string().url("Invalid meeting link").optional(),
  venue: z.string().min(1, "Venue is required for in-person meetings").optional(),
}).refine(data => {
  if (!data.startTime || !data.endTime) return true
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  const duration = differenceInMinutes(endTime, startTime)
  return duration >= MIN_DURATION && duration <= MAX_DURATION
}, {
  message: `Session duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes`
}).refine(data => {
  if (!data.location || !data.meetingType) return true
  return validateMeetingType(data.location as Location, data.meetingType as MeetingType)
}, {
  message: "Invalid meeting type for selected location"
}).refine(data => {
  if (data.location === "IN_PERSON" && !data.venue) {
    return false
  }
  return true
}, {
  message: "Venue is required for in-person meetings"
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const validatedFields = sessionSchema.safeParse(json)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const body = validatedFields.data
    const startTime = new Date(body.startTime)
    const endTime = new Date(body.endTime)
    
    // Validate session time
    const timeValidation = validateSessionTime(startTime, endTime)
    if (!timeValidation.isValid) {
      return NextResponse.json(
        { error: timeValidation.message },
        { status: 400 }
      )
    }

    // Verify mentorship request
    const request = await db.mentorshipRequest.findFirst({
      where: {
        studentId: session.user.id,
        alumniId: body.mentorId,
        status: "ACCEPTED",
      },
    })

    if (!request) {
      return NextResponse.json(
        { error: "You must have an accepted mentorship request to schedule a session" },
        { status: 403 }
      )
    }

    // Get the alumni profile
    const alumniProfile = await db.alumniProfile.findFirst({
      where: {
        userId: body.mentorId
      }
    })

    if (!alumniProfile) {
      return NextResponse.json(
        { error: "Mentor profile not found" },
        { status: 404 }
      )
    }

    // Check availability
    const dayOfWeek = startTime.getDay()
    const timeString = startTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    })

    const availability = await db.availability.findFirst({
      where: {
        alumniId: alumniProfile.id,
        dayOfWeek,
        startTime: {
          lte: timeString,
        },
        endTime: {
          gte: timeString,
        },
      },
    })

    if (!availability) {
      return NextResponse.json(
        { error: "The mentor is not available at this time" },
        { status: 400 }
      )
    }

    // Check for scheduling conflicts
    const conflictError = await checkSchedulingConflicts(
      startTime,
      endTime,
      body.mentorId,
      session.user.id
    )

    if (conflictError) {
      return NextResponse.json(
        { error: conflictError },
        { status: 400 }
      )
    }

    // For session creation
    const sessionData = {
      title: body.title,
      description: body.description,
      startTime,
      endTime,
      student: {
        connect: { id: session.user.id }
      },
      mentor: {
        connect: { id: body.mentorId }
      },
      location: body.location,
      meetingType: body.meetingType,
      meetingLink: body.meetingLink,
      venue: body.venue,
      agenda: body.agenda,
      timezone: getUserTimezone(),
      duration: calculateDuration(startTime, endTime),
      remindersSent: [],
      lastModifiedBy: session.user.id,
    } satisfies Prisma.MentorshipSessionCreateInput

    // Create the session
    const mentorshipSession = await db.mentorshipSession.create({
      data: sessionData,
      include: {
        student: true,
        mentor: true,
      },
    })

    // Send notifications
    await notificationService.notifySessionParticipants(
      "SESSION_SCHEDULED",
      mentorshipSession,
      session.user.id // Don't notify the creator
    )

    return NextResponse.json(mentorshipSession)
  } catch (error) {
    console.error("[SESSIONS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await req.json()
    const validatedFields = updateSchema.safeParse(json)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const body = validatedFields.data

    // Verify session ownership
    const existingSession = await db.mentorshipSession.findFirst({
      where: {
        id: body.id,
        OR: [
          { studentId: session.user.id },
          { mentorId: session.user.id },
        ],
      },
      include: {
        student: true,
        mentor: true,
      },
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Validate permissions based on role and status
    if (session.user.role === UserRole.STUDENT) {
      // Students can only:
      // 1. Cancel their scheduled sessions
      // 2. Provide feedback and rating for completed sessions
      if (body.status && body.status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      if (existingSession.status === "COMPLETED" && (body.studentFeedback || body.mentorRating)) {
        // Allow student feedback
      } else if (existingSession.status === "SCHEDULED" && body.status === "CANCELLED") {
        // Allow cancellation
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    // If updating time, validate it
    if (body.startTime && body.endTime) {
      const startTime = new Date(body.startTime)
      const endTime = new Date(body.endTime)

      // Validate session time
      const timeValidation = validateSessionTime(startTime, endTime)
      if (!timeValidation.isValid) {
        return NextResponse.json(
          { error: timeValidation.message },
          { status: 400 }
        )
      }

      // Check for scheduling conflicts
      const conflictError = await checkSchedulingConflicts(
        startTime,
        endTime,
        existingSession.mentorId,
        existingSession.studentId,
        existingSession.id
      )

      if (conflictError) {
        return NextResponse.json(
          { error: conflictError },
          { status: 400 }
        )
      }

      // If changing time, verify mentor availability
      const dayOfWeek = startTime.getDay()
      const timeString = startTime.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit'
      })

      const availability = await db.availability.findFirst({
        where: {
          alumniId: existingSession.mentorId,
          dayOfWeek,
          startTime: {
            lte: timeString,
          },
          endTime: {
            gte: timeString,
          },
        },
      })

      if (!availability) {
        return NextResponse.json(
          { error: "The mentor is not available at this time" },
          { status: 400 }
        )
      }
    }

    // Create update data
    const updateData = createSessionUpdateData(body, existingSession, session.user.id)

    // Update the session
    const updatedSession = await db.mentorshipSession.update({
      where: { id: body.id },
      data: updateData,
      include: {
        student: true,
        mentor: true,
      },
    })

    // Send notifications
    await notificationService.notifySessionParticipants(
      "SESSION_UPDATED",
      updatedSession,
      session.user.id
    )

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error("[SESSIONS_PATCH]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const sessions = await db.mentorshipSession.findMany({
      where: {
        OR: [
          { studentId: session.user.id },
          { mentorId: session.user.id },
        ],
        ...(status ? { status } : {}),
        ...(from || to ? {
          startTime: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          }
        } : {}),
      },
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
        mentor: {
          include: {
            alumniProfile: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("[SESSIONS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 