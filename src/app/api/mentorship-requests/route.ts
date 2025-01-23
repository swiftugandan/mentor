import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { UserRole } from "@prisma/client"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const requestSchema = z.object({
  alumniId: z.string(),
  message: z.string().min(1, "Message is required"),
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

    const body = await req.json()
    const validatedFields = requestSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { alumniId, message } = validatedFields.data

    // Check if alumni exists and is actually an alumni
    const alumni = await db.user.findFirst({
      where: {
        id: alumniId,
        role: UserRole.ALUMNI,
      },
    })

    if (!alumni) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      )
    }

    // Check if request already exists
    const existingRequest = await db.mentorshipRequest.findFirst({
      where: {
        studentId: session.user.id,
        alumniId,
        status: "PENDING",
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending request already exists with this mentor" },
        { status: 409 }
      )
    }

    // Create the request
    const request = await db.mentorshipRequest.create({
      data: {
        studentId: session.user.id,
        alumniId,
        message,
      },
    })

    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    console.error("Error creating mentorship request:", error)
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

    const requests = await db.mentorshipRequest.findMany({
      where: {
        ...(session.user.role === UserRole.STUDENT
          ? { studentId: session.user.id }
          : { alumniId: session.user.id }),
        ...(status ? { status } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentProfile: true,
          },
        },
        alumni: {
          select: {
            id: true,
            name: true,
            alumniProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching mentorship requests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 