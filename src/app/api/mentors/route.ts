import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { UserRole } from "@prisma/client"

import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const expertise = searchParams.get("expertise")
    const search = searchParams.get("search")

    const mentors = await db.user.findMany({
      where: {
        role: UserRole.ALUMNI,
        alumniProfile: {
          expertise: expertise ? {
            has: expertise
          } : undefined,
          OR: search ? [
            { profession: { contains: search, mode: "insensitive" } },
            { company: { contains: search, mode: "insensitive" } },
          ] : undefined,
        },
      },
      select: {
        id: true,
        name: true,
        alumniProfile: {
          select: {
            profession: true,
            company: true,
            graduationYear: true,
            expertise: true,
            bio: true,
          },
        },
      },
    })

    return NextResponse.json(mentors)
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 