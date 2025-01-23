import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { UserRole } from "@prisma/client"
import { z } from "zod"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const studentProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gradeLevel: z.number().min(1, "Grade level is required"),
  schoolName: z.string().min(1, "School name is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  bio: z.string().optional(),
})

const alumniProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  profession: z.string().min(1, "Profession is required"),
  company: z.string().min(1, "Company is required"),
  graduationYear: z.number().min(1900, "Invalid graduation year"),
  expertise: z.array(z.string()).min(1, "At least one area of expertise is required"),
  bio: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        studentProfile: true,
        alumniProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
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

    const body = await req.json()
    const isStudent = session.user.role === UserRole.STUDENT

    // Validate the request body based on user role
    const validatedFields = isStudent
      ? studentProfileSchema.safeParse(body)
      : alumniProfileSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validatedFields.data

    // Update user name
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
      },
    })

    // Update role-specific profile
    if (isStudent) {
      const { name, ...studentData } = data
      await db.studentProfile.update({
        where: {
          userId: session.user.id,
        },
        data: studentData,
      })
    } else {
      const { name, ...alumniData } = data
      await db.alumniProfile.update({
        where: {
          userId: session.user.id,
        },
        data: alumniData,
      })
    }

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 