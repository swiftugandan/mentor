import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const expertise = searchParams.get('expertise')
    const search = searchParams.get('search')?.toLowerCase()

    console.log('[MENTORS_GET] Search params:', { expertise, search })

    // Query alumni with profiles
    const mentors = await db.user.findMany({
      where: {
        role: UserRole.ALUMNI,
        alumniProfile: {
          isNot: null,
        },
      },
      include: {
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
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`[MENTORS_GET] Found ${mentors.length} total mentors`)

    // Filter results in memory for complex conditions
    let filteredMentors = mentors.filter(
      (mentor) => mentor.alumniProfile !== null
    )

    // Apply expertise filter if specified
    if (expertise && expertise !== 'All Areas') {
      filteredMentors = filteredMentors.filter((mentor) =>
        mentor.alumniProfile?.expertise.includes(expertise)
      )
    }

    // Apply search filter if specified
    if (search) {
      filteredMentors = filteredMentors.filter(
        (mentor) =>
          mentor.alumniProfile?.profession.toLowerCase().includes(search) ||
          mentor.alumniProfile?.company.toLowerCase().includes(search)
      )
    }

    console.log(
      `[MENTORS_GET] Returning ${filteredMentors.length} filtered mentors`
    )

    // Transform the data to match the expected format
    const formattedMentors = filteredMentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      alumniProfile: mentor.alumniProfile,
    }))

    return NextResponse.json(formattedMentors)
  } catch (error) {
    console.error('[MENTORS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
      { status: 500 }
    )
  }
}
