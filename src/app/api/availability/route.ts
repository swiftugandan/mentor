import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { UserRole } from "@prisma/client"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  location: z.enum(["ONLINE", "IN_PERSON"]),
  meetingType: z.enum(["VIDEO", "AUDIO", "IN_PERSON"]),
  meetingLink: z.string().url("Invalid meeting link").optional(),
  venue: z.string().min(1, "Venue is required for in-person meetings").optional(),
}).refine(data => {
  // Validate that meeting type matches location
  if (data.location === "IN_PERSON" && data.meetingType !== "IN_PERSON") {
    return false
  }
  if (data.location === "ONLINE" && data.meetingType === "IN_PERSON") {
    return false
  }
  // Require venue for in-person meetings
  if (data.location === "IN_PERSON" && !data.venue) {
    return false
  }
  return true
}, {
  message: "Invalid meeting type for selected location"
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedFields = availabilitySchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { dayOfWeek, startTime, endTime, location, meetingType, meetingLink, venue } = validatedFields.data

    // Get the alumni profile
    const alumniProfile = await db.alumniProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!alumniProfile) {
      return NextResponse.json(
        { error: "Alumni profile not found" },
        { status: 404 }
      )
    }

    // Create availability slot
    const availability = await db.availability.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        location,
        meetingType,
        meetingLink,
        venue,
        alumniId: alumniProfile.id,
      },
    })

    return NextResponse.json(availability, { status: 201 })
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const alumniId = searchParams.get("alumniId")
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // If no alumniId is provided, use the authenticated user's ID
    const targetUserId = alumniId || session.user.id

    const availability = await db.availability.findMany({
      where: {
        alumni: {
          userId: targetUserId,
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ALUMNI) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Availability ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const availability = await db.availability.findFirst({
      where: {
        id,
        alumni: {
          userId: session.user.id,
        },
      },
    })

    if (!availability) {
      return NextResponse.json(
        { error: "Availability slot not found" },
        { status: 404 }
      )
    }

    // Delete the availability slot
    await db.availability.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ message: "Availability deleted" })
  } catch (error) {
    console.error("Error deleting availability:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 